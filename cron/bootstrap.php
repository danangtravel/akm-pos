<?php
if (PHP_SAPI !== 'cli' && !isset($_GET['cron_key'])) {
    http_response_code(403);
    exit("CLI or authorized cron key only\n");
}
require_once dirname(__DIR__) . '/api/core/boot.php';
require_once dirname(__DIR__) . '/api/core/mailer.php';

function setting(string $key, $default = null) {
    $v = query('SELECT config_value FROM settings WHERE config_key=?', [$key])->fetchColumn();
    return $v === false ? $default : $v;
}

function send_internal_mail(string $subject, string $html): bool {
    $to = (string)setting('daily_report_recipients', '') ?: (string)setting('mail_admin_notify', '');
    if (!$to) return false;
    $res = send_system_mail($to, $subject, $html);
    return !empty($res['ok']);
}

// Automatically cleanup logs older than 7 days on every cron execution
if (function_exists('cleanup_expired_logs')) {
    cleanup_expired_logs(7);
}
