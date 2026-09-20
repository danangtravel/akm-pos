<?php
require __DIR__.'/bootstrap.php';
$days = max(1, (int)setting('slow_moving_days', 7));
$rows = query("SELECT p.sku, p.name, SUM(i.quantity) quantity, MAX(CASE WHEN l.movement_type='SALE' THEN l.created_at END) last_sale FROM inventories i JOIN products p ON p.id=i.product_id LEFT JOIN stock_ledger l ON l.store_id=i.store_id AND l.product_id=i.product_id WHERE i.quantity>0 GROUP BY p.id HAVING last_sale IS NULL OR last_sale < DATE_SUB(NOW(), INTERVAL $days DAY)")->fetchAll();

query('INSERT INTO settings(config_key, config_value) VALUES("slow_moving_cache", ?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)', [json_encode($rows, JSON_UNESCAPED_UNICODE)]);
audit('CRON_SLOW_MOVING', 'CRON', null, null, ['days' => $days, 'count' => count($rows)], "Cron tính toán $days ngày hàng chậm luân chuyển (" . count($rows) . " sản phẩm)");
echo count($rows) . " slow moving product(s) cached.\n";
