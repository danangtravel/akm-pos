<?php
// AKM POS - Advanced Analytics & Multi-Source Revenue Engine

if ($action === 'reports.overview') {
    $ids = allowed_store_ids();
    if (!$ids) json_response([
        'kpi' => [],
        'trend' => [],
        'revenue_sources' => [],
        'top_products' => [],
        'low_stock' => [],
        'slow_moving' => [],
        'returns_detail' => [],
        'payment_mix' => [],
        'store_performance' => [],
        'low_stock_threshold' => 5,
        'slow_moving_days' => 7
    ]);

    $store = (int)($_GET['store_id'] ?? 0);
    if ($store) {
        assert_store($store);
        $ids = [$store];
    }
    $ph = placeholders(count($ids));

    $safeAll = static function(string $sql, array $params = []): array {
        try { return query($sql, $params)->fetchAll(); } catch (PDOException $e) { error_log('AKM dashboard: ' . $e->getMessage()); return []; }
    };
    $safeOne = static function(string $sql, array $params = [], $fallback = 0) {
        try { $v = query($sql, $params)->fetchColumn(); return $v === false ? $fallback : $v; } catch (PDOException $e) { error_log('AKM dashboard: ' . $e->getMessage()); return $fallback; }
    };

    $lowThreshold = max(0, (int)$safeOne("SELECT config_value FROM settings WHERE config_key='low_stock_threshold'", [], 5));
    $slowDays = max(1, (int)$safeOne("SELECT config_value FROM settings WHERE config_key='slow_moving_days'", [], 7));

    // 1. Revenue Streams Breakdown (Hôm nay)
    $todaySales = (float)$safeOne("SELECT COALESCE(SUM(total_amount), 0) FROM `orders` WHERE status='COMPLETED' AND store_id IN($ph) AND created_at>=CURDATE() AND created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);
    $todayOrdersCount = (int)$safeOne("SELECT COUNT(id) FROM `orders` WHERE status='COMPLETED' AND store_id IN($ph) AND created_at>=CURDATE() AND created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);
    
    $todayRepairRevenue = (float)$safeOne("SELECT COALESCE(SUM(fee), 0) FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND store_id IN($ph) AND COALESCE(completed_at, created_at)>=CURDATE() AND COALESCE(completed_at, created_at)<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);
    $todayRepairCount = (int)$safeOne("SELECT COUNT(id) FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND store_id IN($ph) AND COALESCE(completed_at, created_at)>=CURDATE() AND COALESCE(completed_at, created_at)<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);

    $totalCombinedRevenue = $todaySales + $todayRepairRevenue;

    // 2. Returns & Exchanges Metrics (Hôm nay)
    $todayReturnsCount = (int)$safeOne("SELECT COUNT(id) FROM `returns` WHERE store_id IN($ph) AND created_at>=CURDATE() AND created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);
    $todayReturnsTotal = (float)$safeOne("SELECT COALESCE(SUM(total_amount), 0) FROM `returns` WHERE store_id IN($ph) AND created_at>=CURDATE() AND created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);
    $todayReturnsItemsQty = (int)$safeOne("SELECT COALESCE(SUM(ri.quantity), 0) FROM return_items ri INNER JOIN `returns` r ON r.id=ri.return_id WHERE r.store_id IN($ph) AND r.created_at>=CURDATE() AND r.created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids);

    $kpi = [
        'revenue' => $totalCombinedRevenue,
        'sales_revenue' => $todaySales,
        'repair_revenue' => $todayRepairRevenue,
        'orders' => $todayOrdersCount,
        'repairs_completed' => $todayRepairCount,
        'items_sold' => (int)$safeOne("SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi INNER JOIN `orders` o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at>=CURDATE() AND o.created_at<DATE_ADD(CURDATE(),INTERVAL 1 DAY)", $ids),
        'inventory' => (int)$safeOne("SELECT COALESCE(SUM(quantity),0) FROM inventories WHERE store_id IN($ph)", $ids),
        'returns' => $todayReturnsCount,
        'returns_total' => $todayReturnsTotal,
        'returns_items_qty' => $todayReturnsItemsQty,
        'repairs' => (int)$safeOne("SELECT COUNT(id) FROM repair_cases WHERE store_id IN($ph) AND status<>'RETURNED'", $ids),
        'pending_transfers' => (int)$safeOne("SELECT COUNT(id) FROM stock_transfers WHERE status='REQUESTED' AND (from_store_id IN($ph) OR to_store_id IN($ph))", array_merge($ids, $ids))
    ];

    // Revenue Sources Distribution
    $revPctSales = $totalCombinedRevenue > 0 ? round(($todaySales / $totalCombinedRevenue) * 100, 1) : 0;
    $revPctRepairs = $totalCombinedRevenue > 0 ? round(($todayRepairRevenue / $totalCombinedRevenue) * 100, 1) : 0;
    $revenueSources = [
        ['source' => 'Bán sản phẩm / Phụ kiện', 'amount' => $todaySales, 'count' => $todayOrdersCount, 'percentage' => $revPctSales, 'color' => '#0f766e'],
        ['source' => 'Dịch vụ sửa chữa & Thay thế', 'amount' => $todayRepairRevenue, 'count' => $todayRepairCount, 'percentage' => $revPctRepairs, 'color' => '#2563eb']
    ];

    // 30-Day Sales & Repair Combined Trend (Allows instant 7D/14D/30D toggling in UI)
    $rawTrend = $safeAll("SELECT DATE(created_at) sale_day, COALESCE(SUM(total_amount),0) revenue, COUNT(id) order_count FROM `orders` WHERE status='COMPLETED' AND store_id IN($ph) AND created_at>=DATE_SUB(CURDATE(),INTERVAL 29 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at)", $ids);
    $trendMap = [];
    foreach ($rawTrend as $row) $trendMap[$row['sale_day']] = $row;
    $trend = [];
    for ($i = 29; $i >= 0; $i--) {
        $day = date('Y-m-d', strtotime("-$i day"));
        $trend[] = [
            'day' => $day,
            'revenue' => (float)($trendMap[$day]['revenue'] ?? 0),
            'orders' => (int)($trendMap[$day]['order_count'] ?? 0)
        ];
    }

    // Top 10 Bestselling Products
    $top = $safeAll("SELECT oi.product_id, MAX(oi.product_name_snapshot) name, MAX(oi.sku_snapshot) sku, COALESCE(NULLIF(p.image_url,''), (SELECT a.file_path FROM attachments a WHERE a.entity_type='PRODUCT' AND a.entity_id=oi.product_id ORDER BY a.id DESC LIMIT 1)) image_path, c.name category_name, SUM(oi.quantity) quantity, SUM(oi.total_amount) revenue, (SELECT COALESCE(SUM(i.quantity),0) FROM inventories i WHERE i.product_id=oi.product_id AND i.store_id IN($ph)) stock, (SELECT GROUP_CONCAT(COALESCE(i2.quantity, 0) ORDER BY s2.id ASC SEPARATOR '|') FROM stores s2 LEFT JOIN inventories i2 ON i2.store_id=s2.id AND i2.product_id=oi.product_id WHERE s2.is_active=1) AS all_stores_stock FROM order_items oi INNER JOIN `orders` o ON o.id=oi.order_id LEFT JOIN products p ON p.id=oi.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY oi.product_id ORDER BY SUM(oi.quantity) DESC, SUM(oi.total_amount) DESC LIMIT 10", array_merge($ids, $ids));

    // Low Stock Alert
    $low = $safeAll("SELECT p.id product_id, s.code store_code, s.name store_name, p.sku, p.name, COALESCE(NULLIF(p.image_url,''), (SELECT a.file_path FROM attachments a WHERE a.entity_type='PRODUCT' AND a.entity_id=p.id ORDER BY a.id DESC LIMIT 1)) image_path, c.name category_name, i.quantity, (SELECT COALESCE(SUM(i_all.quantity),0) FROM inventories i_all WHERE i_all.product_id=p.id) total_stock, (SELECT GROUP_CONCAT(COALESCE(i2.quantity, 0) ORDER BY s2.id ASC SEPARATOR '|') FROM stores s2 LEFT JOIN inventories i2 ON i2.store_id=s2.id AND i2.product_id=p.id WHERE s2.is_active=1) AS all_stores_stock FROM inventories i INNER JOIN stores s ON s.id=i.store_id INNER JOIN products p ON p.id=i.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE i.store_id IN($ph) AND p.is_active=1 AND i.quantity<=? ORDER BY i.quantity ASC, p.name ASC LIMIT 50", array_merge($ids, [$lowThreshold]));

    // Slow Moving Stock
    $slow = $safeAll("SELECT s.code store_code, p.sku, p.name, i.quantity, (SELECT MAX(sl.created_at) FROM stock_ledger sl WHERE sl.store_id=i.store_id AND sl.product_id=i.product_id AND sl.movement_type='SALE') last_sale FROM inventories i INNER JOIN stores s ON s.id=i.store_id INNER JOIN products p ON p.id=i.product_id WHERE i.store_id IN($ph) AND i.quantity>0 AND COALESCE((SELECT MAX(sl2.created_at) FROM stock_ledger sl2 WHERE sl2.store_id=i.store_id AND sl2.product_id=i.product_id AND sl2.movement_type='SALE'),'1970-01-01')<DATE_SUB(NOW(),INTERVAL $slowDays DAY) ORDER BY last_sale IS NULL DESC, i.quantity DESC LIMIT 50", $ids);

    // Detailed Returns Log (Chi tiết các vụ việc đổi trả)
    $returnsDetail = $safeAll("SELECT r.id, r.return_code, r.created_at, r.reason, r.total_amount, s.name store_name, o.order_code, u.full_name staff_name, (SELECT COUNT(*) FROM return_items ri WHERE ri.return_id=r.id) item_count, (SELECT GROUP_CONCAT(CONCAT(p.name, ' (SL: ', ri.quantity, ', Tiền: ', FORMAT(ri.amount, 0), '₫)') SEPARATOR ' | ') FROM return_items ri JOIN products p ON p.id=ri.product_id WHERE ri.return_id=r.id) items_summary FROM returns r JOIN stores s ON s.id=r.store_id JOIN orders o ON o.id=r.order_id JOIN users u ON u.id=r.created_by WHERE r.store_id IN($ph) ORDER BY r.id DESC LIMIT 30", $ids);

    // Payment Mix
    $payment = $safeAll("SELECT pay.method, SUM(pay.amount) amount FROM payments pay INNER JOIN `orders` o ON o.id=pay.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY pay.method", $ids);

    // Store Performance
    $stores = $safeAll("SELECT id, code, name FROM stores WHERE id IN($ph) ORDER BY code", $ids);
    $storePerformance = [];
    foreach ($stores as $s) {
        $perfSales = $safeAll("SELECT COALESCE(SUM(total_amount),0) revenue, COUNT(id) order_count FROM `orders` WHERE store_id=? AND status='COMPLETED' AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)", [(int)$s['id']]);
        $perfRepairs = (float)$safeOne("SELECT COALESCE(SUM(fee),0) FROM repair_cases WHERE store_id=? AND status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND COALESCE(completed_at, created_at)>=DATE_SUB(NOW(),INTERVAL 30 DAY)", [(int)$s['id']]);
        $sRevenue = (float)($perfSales[0]['revenue'] ?? 0) + $perfRepairs;
        $storePerformance[] = [
            'code' => $s['code'],
            'name' => $s['name'],
            'revenue' => $sRevenue,
            'sales_revenue' => (float)($perfSales[0]['revenue'] ?? 0),
            'repair_revenue' => $perfRepairs,
            'orders' => (int)($perfSales[0]['order_count'] ?? 0)
        ];
    }

    json_response([
        'kpi' => $kpi,
        'trend' => $trend,
        'revenue_sources' => $revenueSources,
        'top_products' => $top,
        'low_stock' => $low,
        'slow_moving' => $slow,
        'returns_detail' => $returnsDetail,
        'payment_mix' => $payment,
        'store_performance' => $storePerformance,
        'low_stock_threshold' => $lowThreshold,
        'slow_moving_days' => $slowDays
    ]);
}
