<?php
require __DIR__.'/bootstrap.php';
$rows = query("SELECT r.repair_code, r.customer_name, r.device_name, r.expected_return_at, u.email FROM repair_cases r LEFT JOIN users u ON u.id=r.technician_id WHERE r.status NOT IN('RETURNED','COMPLETED') AND r.expected_return_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 DAY)")->fetchAll();

$sentCount = 0;
foreach ($rows as $r) {
    $to = $r['email'] ?: setting('daily_report_recipients', '') ?: setting('mail_admin_notify', '');
    if (!$to) continue;
    $subject = 'AKM POS · Nhắc lịch trả máy: ' . $r['repair_code'];
    $html = '<div style="font-family:sans-serif;padding:16px;background:#f8fafc;border-radius:10px;"><h3 style="color:#0f766e;">Nhắc lịch trả máy sửa chữa</h3><p>Phiếu <b>'.htmlspecialchars($r['repair_code']).'</b> - Khách: <b>'.htmlspecialchars($r['customer_name']).'</b> / Thiết bị: <b>'.htmlspecialchars($r['device_name']).'</b><br>Hẹn trả khách: <b style="color:#e11d48;">'.htmlspecialchars($r['expected_return_at']).'</b></p></div>';
    $res = send_system_mail($to, $subject, $html);
    if (!empty($res['ok'])) $sentCount++;
}

audit('CRON_REPAIR_REMINDERS', 'CRON', null, null, ['total_cases' => count($rows), 'sent' => $sentCount], "Cron nhắc lịch hẹn trả máy sửa chữa (Đã gửi $sentCount / " . count($rows) . " phiếu)");
echo count($rows) . " reminder(s), $sentCount email(s) sent.\n";
