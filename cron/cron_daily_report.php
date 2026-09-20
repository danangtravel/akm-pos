<?php
require __DIR__.'/bootstrap.php';
if (setting('daily_report_enabled', '0') !== '1') exit("Daily report is disabled in Settings.\n");

$to = setting('daily_report_recipients', '');
if (!$to) exit("No recipient configured.\n");

$today = date('Y-m-d');
$sales = query("SELECT COALESCE(SUM(total_amount), 0) sales_revenue, COUNT(*) orders FROM orders WHERE status='COMPLETED' AND DATE(created_at)=?", [$today])->fetch();
$salesRevenue = (float)($sales['sales_revenue'] ?? 0);
$ordersCount = (int)($sales['orders'] ?? 0);

$repairs = query("SELECT COALESCE(SUM(fee), 0) repair_revenue, COUNT(*) repairs_completed FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND DATE(COALESCE(completed_at, created_at))=?", [$today])->fetch();
$repairRevenue = (float)($repairs['repair_revenue'] ?? 0);
$repairsCompleted = (int)($repairs['repairs_completed'] ?? 0);
$totalRevenue = $salesRevenue + $repairRevenue;

$itemsCount = (int)query("SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND DATE(o.created_at)=?", [$today])->fetchColumn();
$returnsCount = (int)query("SELECT COUNT(*) FROM returns WHERE DATE(created_at)=?", [$today])->fetchColumn();

$lowThreshold = (int)setting('low_stock_threshold', 5);
$lowStock = query("SELECT p.sku, p.name, s.name store_name, i.quantity FROM inventories i JOIN products p ON p.id=i.product_id JOIN stores s ON s.id=i.store_id WHERE p.is_active=1 AND i.quantity<=? ORDER BY i.quantity ASC LIMIT 10", [$lowThreshold])->fetchAll();

$topProducts = query("SELECT oi.product_name_snapshot name, SUM(oi.quantity) quantity, SUM(oi.total_amount) revenue FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND DATE(o.created_at)=? GROUP BY oi.product_id, oi.product_name_snapshot ORDER BY quantity DESC LIMIT 5", [$today])->fetchAll();

$payments = query("SELECT pay.method, SUM(pay.amount) amount FROM payments pay JOIN orders o ON o.id=pay.order_id WHERE o.status='COMPLETED' AND DATE(o.created_at)=? GROUP BY pay.method", [$today])->fetchAll();

$sectionsJson = setting('daily_report_sections', '');
$sections = $sectionsJson ? json_decode($sectionsJson, true) : ['sec_revenue' => 1, 'sec_low_stock' => 1, 'sec_top_products' => 1, 'sec_payment_methods' => 1];

// Require helper if extended.php has generate_daily_report_html
if (!function_exists('generate_daily_report_html')) {
    require_once dirname(__DIR__) . '/api/modules/extended.php';
}

$html = generate_daily_report_html($today, $totalRevenue, $salesRevenue, $repairRevenue, $ordersCount, $repairsCompleted, $itemsCount, $returnsCount, $lowStock, $topProducts, $payments, $sections);

$subject = 'AKM POS · Báo cáo tổng kết ngày ' . date('d/m/Y', strtotime($today));
$sent = send_internal_mail($subject, $html);

audit('CRON_DAILY_REPORT', 'CRON', null, null, [
    'recipients' => $to,
    'revenue' => $totalRevenue,
    'orders' => $ordersCount,
    'sent' => $sent
], "Chạy Cron tự động gửi Báo cáo Doanh số cuối ngày tới $to: " . ($sent ? 'Thành công' : 'Thất bại'));

echo $sent ? "Report sent successfully to $to\n" : "Failed to send report to $to\n";
