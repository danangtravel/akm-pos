<?php
declare(strict_types=1);

/**
 * AKM POS - Activity Audit & Mail Operations Logging Engine
 * Automatically purges activity and mail delivery logs older than 7 days
 */

function audit(string $action, ?string $entityType = null, ?int $entityId = null, $old = null, $new = null, string $description = ''): void {
    $u = function_exists('current_user') ? current_user() : null;
    $ip = $_SERVER['REMOTE_ADDR'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '127.0.0.1');
    try {
        query(
            'INSERT INTO audit_logs(user_id, entity_type, entity_id, action, old_data, new_data, ip_address, description) VALUES(?,?,?,?,?,?,?,?)',
            [
                $u['id'] ?? null,
                $entityType,
                $entityId,
                $action,
                $old === null ? null : json_encode($old, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE),
                $new === null ? null : json_encode($new, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE),
                $ip,
                $description
            ]
        );

        // Opportunistic auto-cleanup (1 out of 10 requests) to keep DB lean (<= 7 days retention)
        if (mt_rand(1, 10) === 1) {
            cleanup_expired_logs(7);
        }
    } catch (Throwable $e) {
        error_log('AKM Audit log failed: ' . $e->getMessage());
    }
}

function log_mail(string $toEmail, string $subject, string $driver, bool $success, ?string $error = null): void {
    $u = function_exists('current_user') ? current_user() : null;
    try {
        query(
            'INSERT INTO mail_logs(user_id, to_email, subject, driver, status, error_message) VALUES(?,?,?,?,?,?)',
            [
                $u['id'] ?? null,
                $toEmail,
                $subject,
                $driver,
                $success ? 'SUCCESS' : 'FAILED',
                $error
            ]
        );

        // Also record in central audit log
        audit(
            $success ? 'MAIL_SEND_SUCCESS' : 'MAIL_SEND_FAILED',
            'MAIL',
            null,
            null,
            ['to' => $toEmail, 'driver' => $driver, 'status' => $success ? 'SUCCESS' : 'FAILED', 'error' => $error],
            ($success ? "Gửi email thành công tới: $toEmail" : "Gửi email thất bại tới $toEmail. Lý do: $error") . " | Tiêu đề: $subject"
        );
    } catch (Throwable $e) {
        error_log('AKM Mail log failed: ' . $e->getMessage());
    }
}

function cleanup_expired_logs(int $days = 7): array {
    $deletedAudit = 0;
    $deletedMail = 0;
    try {
        $stmtAudit = query('DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [$days]);
        $deletedAudit = $stmtAudit->rowCount();
    } catch (Throwable $e) {
        error_log('Cleanup audit_logs error: ' . $e->getMessage());
    }

    try {
        $stmtMail = query('DELETE FROM mail_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [$days]);
        $deletedMail = $stmtMail->rowCount();
    } catch (Throwable $e) {
        error_log('Cleanup mail_logs error: ' . $e->getMessage());
    }

    return [
        'audit_logs_deleted' => $deletedAudit,
        'mail_logs_deleted' => $deletedMail,
        'retention_days' => $days
    ];
}
