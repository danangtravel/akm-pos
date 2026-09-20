<?php
declare(strict_types=1);

/**
 * AKM POS - Pure PHP Resilient Mailer Module
 * Supports direct Socket SMTP (SSL/TLS/STARTTLS) and native PHP mail() fallback
 */

function is_smtp_configured(?array $cfg = null): bool {
    $c = $cfg ?? get_mail_config();
    return !empty($c['host']) && !empty($c['username']);
}

function get_mail_config(): array {
    global $config;
    static $cached = null;
    if ($cached !== null) return $cached;

    // Load from settings table if available
    $dbSettings = [];
    try {
        $rows = query("SELECT config_key, config_value FROM settings WHERE config_key LIKE 'mail_%' OR config_key LIKE 'smtp_%' OR config_key = 'daily_report_recipients'")->fetchAll();
        foreach ($rows as $r) {
            $dbSettings[$r['config_key']] = $r['config_value'];
        }
    } catch (Throwable $e) {}

    $fileCfg = $config['mail'] ?? [];
    $appUrl = $config['app']['url'] ?? ((!empty($_SERVER['HTTPS']) ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

    $host = trim($dbSettings['smtp_host'] ?? ($fileCfg['host'] ?? 'smtp.tino.vn'));
    $port = (int)($dbSettings['smtp_port'] ?? ($fileCfg['port'] ?? 587));
    $user = trim($dbSettings['smtp_username'] ?? ($fileCfg['username'] ?? 'admin@pnnmedia.vn'));
    $dbPass = isset($dbSettings['smtp_password']) && trim((string)$dbSettings['smtp_password']) !== '' ? (string)$dbSettings['smtp_password'] : null;
    $pass = $dbPass !== null ? $dbPass : ($fileCfg['password'] ?? '4Za68_Du%kCc^u+^');
    $enc = strtolower(trim($dbSettings['smtp_encryption'] ?? ($fileCfg['encryption'] ?? 'tls')));
    $fromEmail = trim($dbSettings['mail_from_email'] ?? ($fileCfg['from_email'] ?? 'admin@pnnmedia.vn'));
    $fromName = trim($dbSettings['mail_from_name'] ?? ($fileCfg['from_name'] ?? 'AKM POS - Anh Khoa Mobile'));

    $cached = [
        'driver'      => $dbSettings['mail_driver'] ?? (!empty($fileCfg['enabled']) ? 'smtp' : 'smtp'),
        'host'        => $host ?: 'smtp.tino.vn',
        'port'        => $port ?: 587,
        'username'    => $user ?: 'admin@pnnmedia.vn',
        'password'    => $pass ?: '4Za68_Du%kCc^u+^',
        'encryption'  => $enc ?: 'tls',
        'from_email'  => $fromEmail ?: 'admin@pnnmedia.vn',
        'from_name'   => $fromName ?: 'AKM POS - Anh Khoa Mobile',
        'admin_email' => trim($dbSettings['mail_admin_notify'] ?? ($dbSettings['daily_report_recipients'] ?? 'admin@pnnmedia.vn')),
        'app_url'     => rtrim($appUrl, '/'),
        'app_name'    => $config['app']['name'] ?? 'AKM POS',
    ];

    return $cached;
}

/**
 * Send an email using SMTP Socket or PHP mail() with automated audit/mail logging
 * Supports single email or comma/semicolon-separated multi-recipient addresses
 */
function send_system_mail($to, string $subject, string $html, array $options = []): array {
    $cfg = get_mail_config();
    
    // Parse recipients (string or array, comma/semicolon/space/newline separated)
    $rawList = is_array($to) ? $to : preg_split('/[,;\s\r\n]+/', trim((string)$to));
    $recipients = [];
    foreach ($rawList as $item) {
        $item = trim((string)$item);
        if ($item !== '' && filter_var($item, FILTER_VALIDATE_EMAIL)) {
            $recipients[] = $item;
        }
    }
    $recipients = array_values(array_unique($recipients));

    if (empty($recipients)) {
        $displayTo = is_array($to) ? implode(', ', $to) : (string)$to;
        $err = 'Địa chỉ email người nhận không hợp lệ: ' . $displayTo;
        if (function_exists('log_mail')) log_mail($displayTo, $subject, 'none', false, $err);
        return ['ok' => false, 'error' => $err];
    }

    $fromEmail = $options['from_email'] ?? $cfg['from_email'];
    $fromName  = $options['from_name']  ?? $cfg['from_name'];

    $successCount = 0;
    $errors = [];
    $sentRecipients = [];

    foreach ($recipients as $recipient) {
        $sentOne = false;
        $oneError = null;

        // 1. Check if SMTP is configured
        if (!empty($cfg['host'])) {
            try {
                $res = smtp_socket_send($cfg, $recipient, $subject, $html, $fromEmail, $fromName);
                if (!empty($res['ok'])) {
                    if (function_exists('log_mail')) log_mail($recipient, $subject, 'smtp', true, null);
                    $successCount++;
                    $sentRecipients[] = $recipient;
                    $sentOne = true;
                    continue;
                }
                $oneError = $res['error'] ?? 'Lỗi kết nối SMTP';
            } catch (Throwable $e) {
                $oneError = $e->getMessage();
            }
        } else {
            $oneError = 'Chưa cấu hình máy chủ SMTP trong mục Cài đặt (Host và Username đang trống).';
        }

        // 2. Fallback to PHP native mail() only if explicitly requested or on local fallback
        if (!$sentOne && (!empty($options['allow_php_mail']) || empty($cfg['host']))) {
            $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
            $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
            $headers = [
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
                'Content-Transfer-Encoding: 8bit',
                "From: $encodedFromName <$fromEmail>",
                "Reply-To: $fromEmail",
                'X-Mailer: AKM POS Mailer v2.0',
            ];
            $headerStr = implode("\r\n", $headers) . "\r\n";

            $sent = @mail($recipient, $encodedSubject, $html, $headerStr);
            if ($sent) {
                if (function_exists('log_mail')) log_mail($recipient, $subject, 'mail', true, null);
                $successCount++;
                $sentRecipients[] = $recipient;
                $sentOne = true;
                continue;
            }
        }

        if (!$sentOne) {
            $finalErr = "Gửi tới $recipient thất bại: " . ($oneError ?: 'Lỗi không xác định');
            $errors[] = $finalErr;
            if (function_exists('log_mail')) log_mail($recipient, $subject, !empty($cfg['host']) ? 'smtp' : 'none', false, $finalErr);
        }
    }

    if ($successCount > 0) {
        $msg = "Đã gửi email thành công tới " . implode(', ', $sentRecipients);
        if (!empty($errors)) {
            $msg .= " (Một số email thất bại: " . implode('; ', $errors) . ")";
        }
        return [
            'ok' => true,
            'driver' => 'smtp',
            'sent_count' => $successCount,
            'recipients' => $sentRecipients,
            'message' => $msg
        ];
    }

    $finalError = !empty($errors) ? implode('; ', $errors) : 'Gửi mail thất bại qua SMTP.';
    return ['ok' => false, 'error' => $finalError];
}

/**
 * Pure PHP Socket SMTP Client (No Composer / PHPMailer required)
 */
function smtp_socket_send(array $cfg, string $to, string $subject, string $html, string $fromEmail, string $fromName): array {
    $host = $cfg['host'];
    $port = (int)$cfg['port'];
    $timeout = 10;
    $encryption = $cfg['encryption']; // 'tls', 'ssl', or ''

    $remoteHost = $host;
    if ($encryption === 'ssl' || $port === 465) {
        $remoteHost = 'ssl://' . $host;
    }

    $socket = @fsockopen($remoteHost, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        return ['ok' => false, 'error' => "Không kết nối được tới SMTP $host:$port ($errstr)"];
    }

    stream_set_timeout($socket, $timeout);

    $readResponse = function() use ($socket): string {
        $data = '';
        while ($line = fgets($socket, 515)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $data;
    };

    $sendCommand = function(string $cmd, array $expectedCodes = [250]) use ($socket, $readResponse): array {
        fputs($socket, $cmd . "\r\n");
        $resp = $readResponse();
        $code = (int)substr($resp, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            return ['ok' => false, 'code' => $code, 'response' => $resp];
        }
        return ['ok' => true, 'code' => $code, 'response' => $resp];
    };

    // Initial greeting
    $greet = $readResponse();
    if ((int)substr($greet, 0, 3) !== 220) {
        fclose($socket);
        return ['ok' => false, 'error' => "SMTP greeting failed: $greet"];
    }

    $clientDomain = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $res = $sendCommand("EHLO $clientDomain");
    if (!$res['ok']) {
        $res = $sendCommand("HELO $clientDomain");
        if (!$res['ok']) {
            fclose($socket);
            return ['ok' => false, 'error' => "HELO failed: " . $res['response']];
        }
    }

    // STARTTLS if requested
    if (($encryption === 'tls' || $port === 587) && strpos($res['response'], 'STARTTLS') !== false) {
        $res = $sendCommand("STARTTLS", [220]);
        if (!$res['ok']) {
            fclose($socket);
            return ['ok' => false, 'error' => "STARTTLS failed: " . $res['response']];
        }
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return ['ok' => false, 'error' => "Bật mã hóa TLS socket thất bại."];
        }
        $sendCommand("EHLO $clientDomain");
    }

    // SMTP Auth if username provided
    if (!empty($cfg['username'])) {
        if (empty($cfg['password'])) {
            fclose($socket);
            return ['ok' => false, 'error' => "Chưa nhập Mật khẩu SMTP cho tài khoản {$cfg['username']}."];
        }
        $res = $sendCommand("AUTH LOGIN", [334]);
        if (!$res['ok']) {
            $plainAuth = base64_encode("\0" . $cfg['username'] . "\0" . $cfg['password']);
            $res = $sendCommand("AUTH PLAIN " . $plainAuth, [235]);
            if (!$res['ok']) {
                fclose($socket);
                return ['ok' => false, 'error' => "Xác thực SMTP thất bại: " . $res['response']];
            }
        } else {
            $res = $sendCommand(base64_encode($cfg['username']), [334]);
            if (!$res['ok']) {
                fclose($socket);
                return ['ok' => false, 'error' => "Tài khoản Username bị từ chối: " . $res['response']];
            }
            $res = $sendCommand(base64_encode($cfg['password']), [235]);
            if (!$res['ok']) {
                fclose($socket);
                return ['ok' => false, 'error' => "Mật khẩu SMTP không đúng hoặc bị từ chối: " . $res['response']];
            }
        }
    }

    // MAIL FROM
    $res = $sendCommand("MAIL FROM:<$fromEmail>");
    if (!$res['ok']) {
        fclose($socket);
        return ['ok' => false, 'error' => "MAIL FROM failed: " . $res['response']];
    }

    // RCPT TO
    $res = $sendCommand("RCPT TO:<$to>");
    if (!$res['ok']) {
        fclose($socket);
        return ['ok' => false, 'error' => "RCPT TO failed: " . $res['response']];
    }

    // DATA
    $res = $sendCommand("DATA", [354]);
    if (!$res['ok']) {
        fclose($socket);
        return ['ok' => false, 'error' => "DATA handshake failed: " . $res['response']];
    }

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    
    $headers = [
        "Date: " . date('r'),
        "From: $encodedFromName <$fromEmail>",
        "To: <$to>",
        "Subject: $encodedSubject",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "X-Mailer: AKM POS Pure SMTP v2.0",
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $html . "\r\n.\r\n";
    fputs($socket, $payload);
    $finalResp = $readResponse();
    $sendCommand("QUIT", [221, 250]);
    fclose($socket);

    if ((int)substr($finalResp, 0, 3) === 250) {
        return ['ok' => true, 'driver' => 'smtp', 'message' => 'Gửi email qua SMTP thành công.'];
    }

    return ['ok' => false, 'error' => "SMTP Delivery Failed: $finalResp"];
}

/**
 * Detailed Diagnostic SMTP Test with step-by-step logs for Admin UI
 */
function smtp_socket_diagnose(array $cfg, string $to): array {
    $logs = [];
    $host = trim($cfg['host'] ?? '');
    $port = (int)($cfg['port'] ?? 587);
    $encryption = strtolower(trim($cfg['encryption'] ?? 'tls'));
    $fromEmail = trim($cfg['from_email'] ?? 'no-reply@anhkhoamobile.com');
    $fromName  = trim($cfg['from_name']  ?? 'AKM POS Test');
    $timeout = 12;

    $logs[] = "1. Bắt đầu kiểm tra cấu hình SMTP: Host: $host | Port: $port | Mã hóa: " . strtoupper($encryption ?: 'Không');

    if (!$host) {
        $logs[] = "❌ LỖI: Chưa nhập Host SMTP.";
        return ['ok' => false, 'logs' => $logs, 'error' => 'Chưa nhập Host SMTP'];
    }

    $remoteHost = $host;
    if ($encryption === 'ssl' || $port === 465) {
        $remoteHost = 'ssl://' . $host;
    }

    $t0 = microtime(true);
    $socket = @fsockopen($remoteHost, $port, $errno, $errstr, $timeout);
    $connTime = round((microtime(true) - $t0) * 1000, 1);

    if (!$socket) {
        $logs[] = "❌ LỖI KẾT NỐI: Không thể kết nối tới $remoteHost:$port (Lỗi #$errno: $errstr) sau {$connTime}ms.";
        if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, "Kết nối thất bại ($errstr)");
        return ['ok' => false, 'logs' => $logs, 'error' => "Không thể kết nối tới $host:$port ($errstr)"];
    }

    $logs[] = "✅ 2. Kết nối Socket TCP thành công tới $remoteHost:$port ({$connTime}ms).";
    stream_set_timeout($socket, $timeout);

    $readResponse = function() use ($socket): string {
        $data = '';
        while ($line = fgets($socket, 515)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return trim($data);
    };

    $sendCommand = function(string $cmd, array $expectedCodes = [250]) use ($socket, $readResponse, &$logs): array {
        fputs($socket, $cmd . "\r\n");
        $resp = $readResponse();
        $code = (int)substr($resp, 0, 3);
        $ok = in_array($code, $expectedCodes, true);
        $maskCmd = str_starts_with($cmd, 'AUTH') ? 'AUTH ***' : $cmd;
        if ($ok) {
            $logs[] = "  ➜ [SERVER: $code] $resp";
        } else {
            $logs[] = "  ❌ [LỖI $code] $resp";
        }
        return ['ok' => $ok, 'code' => $code, 'response' => $resp];
    };

    // 1. Greeting
    $greet = $readResponse();
    $logs[] = "✅ 3. Nhận phản hồi khởi tạo Server: $greet";
    if ((int)substr($greet, 0, 3) !== 220) {
        fclose($socket);
        $err = "Server SMTP không sẵn sàng: $greet";
        if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
        return ['ok' => false, 'logs' => $logs, 'error' => $err];
    }

    // 2. EHLO
    $clientDomain = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $logs[] = "4. Gửi EHLO $clientDomain...";
    $res = $sendCommand("EHLO $clientDomain");
    if (!$res['ok']) {
        $res = $sendCommand("HELO $clientDomain");
        if (!$res['ok']) {
            fclose($socket);
            $err = "Bắt tay HELO thất bại: " . $res['response'];
            if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
            return ['ok' => false, 'logs' => $logs, 'error' => $err];
        }
    }

    // 3. STARTTLS
    if (($encryption === 'tls' || $port === 587) && strpos($res['response'], 'STARTTLS') !== false) {
        $logs[] = "5. Khởi động bảo mật STARTTLS...";
        $res = $sendCommand("STARTTLS", [220]);
        if (!$res['ok']) {
            fclose($socket);
            $err = "STARTTLS thất bại: " . $res['response'];
            if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
            return ['ok' => false, 'logs' => $logs, 'error' => $err];
        }
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            $err = "Bật mã hóa TLS Socket thất bại.";
            $logs[] = "❌ $err";
            if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
            return ['ok' => false, 'logs' => $logs, 'error' => $err];
        }
        $logs[] = "✅ Mã hóa TLS đã được kích hoạt thành công. Gửi lại EHLO...";
        $sendCommand("EHLO $clientDomain");
    }

    // 4. AUTHENTICATION
    if (!empty($cfg['username'])) {
        if (empty($cfg['password'])) {
            fclose($socket);
            $err = "❌ [LỖI XÁC THỰC] Chưa có Mật khẩu SMTP cho tài khoản '{$cfg['username']}'. Vui lòng nhập Mật khẩu SMTP và bấm 'Lưu cấu hình SMTP' trước khi kiểm tra.";
            $logs[] = $err;
            if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
            return ['ok' => false, 'logs' => $logs, 'error' => $err];
        }
        $logs[] = "6. Xác thực tài khoản SMTP (" . $cfg['username'] . ")...";
        $res = $sendCommand("AUTH LOGIN", [334]);
        if (!$res['ok']) {
            $plainAuth = base64_encode("\0" . $cfg['username'] . "\0" . $cfg['password']);
            $res = $sendCommand("AUTH PLAIN " . $plainAuth, [235]);
            if (!$res['ok']) {
                fclose($socket);
                $err = "Lỗi xác thực AUTH: " . $res['response'];
                $logs[] = "❌ " . $err;
                if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
                return ['ok' => false, 'logs' => $logs, 'error' => $err];
            }
        } else {
            $res = $sendCommand(base64_encode($cfg['username']), [334]);
            if (!$res['ok']) {
                fclose($socket);
                $err = "Tài khoản Username bị từ chối: " . $res['response'];
                $logs[] = "❌ " . $err;
                if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
                return ['ok' => false, 'logs' => $logs, 'error' => $err];
            }
            $res = $sendCommand(base64_encode($cfg['password']), [235]);
            if (!$res['ok']) {
                fclose($socket);
                $err = "Mật khẩu SMTP không đúng hoặc bị từ chối: " . $res['response'];
                $logs[] = "❌ " . $err;
                if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
                return ['ok' => false, 'logs' => $logs, 'error' => $err];
            }
        }
        $logs[] = "✅ Xác thực tài khoản SMTP thành công (235 Authentication succeeded).";
    }

    // 5. Test Mail Delivery
    $logs[] = "7. Thực hiện gửi email kiểm tra tới: $to (Người gửi: $fromEmail)...";
    $res = $sendCommand("MAIL FROM:<$fromEmail>");
    if (!$res['ok']) {
        fclose($socket);
        $err = "MAIL FROM bị từ chối: " . $res['response'];
        if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
        return ['ok' => false, 'logs' => $logs, 'error' => $err];
    }

    $res = $sendCommand("RCPT TO:<$to>");
    if (!$res['ok']) {
        fclose($socket);
        $err = "RCPT TO bị từ chối: " . $res['response'];
        if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
        return ['ok' => false, 'logs' => $logs, 'error' => $err];
    }

    $res = $sendCommand("DATA", [354]);
    if (!$res['ok']) {
        fclose($socket);
        $err = "DATA handshake thất bại: " . $res['response'];
        if (function_exists('log_mail')) log_mail($to, 'SMTP Diagnostic Test', 'smtp', false, $err);
        return ['ok' => false, 'logs' => $logs, 'error' => $err];
    }

    $now = date('d/m/Y H:i:s');
    $subject = "AKM POS · Kiểm tra kết nối SMTP thành công ($now)";
    $html = "
    <div style='font-family:sans-serif; max-width:560px; margin:0 auto; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;'>
        <div style='background:#0f766e; color:#fff; padding:16px; border-radius:8px; text-align:center;'>
            <h2 style='margin:0; font-size:18px;'>🎉 Kết nối Máy chủ SMTP Thành công!</h2>
        </div>
        <div style='padding:16px 0; font-size:13.5px; color:#334155; line-height:1.6;'>
            <p>Hệ thống <strong>AKM POS</strong> đã kết nối và xác thực thành công với máy chủ SMTP của bạn.</p>
            <ul>
                <li><strong>Máy chủ:</strong> $host:$port (" . strtoupper($encryption) . ")</li>
                <li><strong>Người gửi:</strong> $fromName &lt;$fromEmail&gt;</li>
                <li><strong>Thời gian test:</strong> $now</li>
            </ul>
            <p style='color:#0f766e; font-weight:600;'>Giờ đây bạn đã có thể bật tính năng tự động gửi Báo cáo doanh số cuối ngày hoặc nhận thông báo nhân viên mới.</p>
        </div>
    </div>";

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [
        "Date: " . date('r'),
        "From: $encodedFromName <$fromEmail>",
        "To: <$to>",
        "Subject: $encodedSubject",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "X-Mailer: AKM POS SMTP Tester v2.0",
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $html . "\r\n.\r\n";
    fputs($socket, $payload);
    $finalResp = $readResponse();
    $sendCommand("QUIT", [221, 250]);
    fclose($socket);

    if ((int)substr($finalResp, 0, 3) === 250) {
        $logs[] = "🎉 8. Hoàn tất! Email kiểm tra đã được máy chủ SMTP tiếp nhận thành công ($finalResp).";
        if (function_exists('log_mail')) log_mail($to, $subject, 'smtp', true, null);
        return [
            'ok' => true,
            'logs' => $logs,
            'message' => "Kết nối SMTP và gửi email kiểm tra thành công tới $to!"
        ];
    }

    $err = "Server từ chối chuyển phát thư: $finalResp";
    $logs[] = "❌ $err";
    if (function_exists('log_mail')) log_mail($to, $subject, 'smtp', false, $err);
    return ['ok' => false, 'logs' => $logs, 'error' => $err];
}

/**
 * Standard Modern Responsive Email Template
 */
function render_email_template(string $title, string $badgeText, string $bodyHtml, ?string $ctaText = null, ?string $ctaUrl = null, ?string $footerNote = null): string {
    $cfg = get_mail_config();
    $appUrl = $cfg['app_url'];
    $year = date('Y');

    $ctaBlock = '';
    if ($ctaText && $ctaUrl) {
        $ctaBlock = "
        <div style=\"margin: 28px 0 20px; text-align: center;\">
            <a href=\"{$ctaUrl}\" style=\"display: inline-block; padding: 13px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); letter-spacing: 0.2px;\">
                {$ctaText} →
            </a>
        </div>";
    }

    $footerText = $footerNote ?: "Email này được gửi tự động từ hệ thống Quản lý Bán hàng & Dịch vụ AKM POS. Vui lòng không trả lời trực tiếp email này.";

    return <<<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
                    <!-- Brand Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 28px; text-align: center;">
                            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px; font-weight: 800; font-size: 22px; color: #ffffff; margin-bottom: 10px; backdrop-filter: blur(4px);">
                                A
                            </div>
                            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">AKM POS</h1>
                            <p style="margin: 4px 0 0; font-size: 12px; color: #bfdbfe; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px;">Hệ thống Quản lý Bán lẻ & Chuỗi Dịch vụ</p>
                        </td>
                    </tr>
                    
                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 32px 28px;">
                            <div style="margin-bottom: 20px;">
                                <span style="display: inline-block; padding: 4px 12px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11.5px; font-weight: 600; border-radius: 9999px;">
                                    {$badgeText}
                                </span>
                            </div>
                            
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.4;">
                                {$title}
                            </h2>

                            <div style="font-size: 14px; line-height: 1.65; color: #334155;">
                                {$bodyHtml}
                            </div>

                            {$ctaBlock}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 22px 28px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
                            <p style="margin: 0 0 6px;">{$footerText}</p>
                            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                                &copy; {$year} AKM POS &middot; <a href="{$appUrl}" style="color: #2563eb; text-decoration: none;">{$appUrl}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}

/**
 * 1. Send Registration Confirmation Email to User
 */
function send_registration_confirmation_mail(array $user): array {
    $fullName = htmlspecialchars($user['full_name'] ?? 'Bạn');
    $email    = htmlspecialchars($user['email'] ?? '');
    $phone    = htmlspecialchars($user['phone'] ?? 'Chưa cập nhật');
    $time     = date('d/m/Y H:i:s');
    $note     = !empty($user['registration_note']) ? htmlspecialchars($user['registration_note']) : 'Không có';

    $title = "Xác nhận yêu cầu Đăng ký tài khoản AKM POS";
    $badge = "🕒 ĐANG CHỜ ADMIN PHÊ DUYỆT";

    $body = <<<HTML
<p>Xin chào <strong>{$fullName}</strong>,</p>
<p>Hệ thống <strong>AKM POS</strong> đã nhận được yêu cầu đăng ký tài khoản của bạn thành công. Dưới đây là thông tin chi tiết:</p>

<table style="width: 100%; border-collapse: collapse; margin: 18px 0; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 13px;">
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 38%;">Họ và tên:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">{$fullName}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email đăng nhập:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">{$email}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Số điện thoại:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">{$phone}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Thời gian đăng ký:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">{$time}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; color: #64748b;">Ghi chú / Chi nhánh:</td>
        <td style="padding: 10px 14px; color: #0f172a;">{$note}</td>
    </tr>
</table>

<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; color: #92400e; font-size: 13px; line-height: 1.5;">
    <strong>📌 Quy trình tiếp theo:</strong> Tài khoản của bạn hiện đang ở trạng thái <strong>Chờ Quản trị viên xét duyệt</strong>. Sau khi Quản trị viên duyệt và phân quyền chi nhánh, bạn sẽ nhận được email thông báo kích hoạt kèm đường link để bắt đầu làm việc.
</div>

<p style="color: #64748b; font-size: 13px;">Nếu bạn không thực hiện yêu cầu này hoặc cần hỗ trợ gấp, xin vui lòng liên hệ trực tiếp với người quản lý chi nhánh của bạn.</p>
HTML;

    $html = render_email_template($title, $badge, $body);
    return send_system_mail($user['email'], "[AKM POS] Xác nhận đăng ký tài khoản - Chờ duyệt", $html);
}

/**
 * 2. Send Alert Email to Admin when a new user registers
 */
function send_admin_new_user_notification_mail(array $user): array {
    $cfg = get_mail_config();
    $adminEmail = $cfg['admin_email'];
    if (!$adminEmail) {
        return ['ok' => false, 'error' => 'Chưa cấu hình email Admin nhận thông báo.'];
    }

    $fullName = htmlspecialchars($user['full_name'] ?? '');
    $email    = htmlspecialchars($user['email'] ?? '');
    $phone    = htmlspecialchars($user['phone'] ?? 'Chưa cập nhật');
    $time     = date('d/m/Y H:i:s');
    $appUrl   = $cfg['app_url'];

    $title = "Thông báo: Có tài khoản mới vừa đăng ký cần duyệt";
    $badge = "🔔 TÀI KHOẢN MỚI CHỜ DUYỆT";

    $body = <<<HTML
<p>Kính gửi Quản trị viên,</p>
<p>Hệ thống ghi nhận có nhân sự mới vừa đăng ký tài khoản vào hệ thống <strong>AKM POS</strong>:</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 13px;">
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 38%;">Họ và tên:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">{$fullName}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">{$email}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Số điện thoại:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">{$phone}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; color: #64748b;">Thời gian:</td>
        <td style="padding: 10px 14px; color: #0f172a;">{$time}</td>
    </tr>
</table>

<p>Vui lòng đăng nhập trang quản trị để tiến hành phê duyệt, chỉ định chi nhánh làm việc và phân quyền cho nhân sự này.</p>
HTML;

    $html = render_email_template($title, $badge, $body, "Mở trang Quản lý Tài khoản", $appUrl);
    return send_system_mail($adminEmail, "[AKM POS] Nhân sự mới đăng ký: {$fullName} (Chờ duyệt)", $html);
}

/**
 * 3. Send Account Approved Notification Email to User
 */
function send_account_approved_mail(array $user, string $storeNames = ''): array {
    $cfg = get_mail_config();
    $fullName = htmlspecialchars($user['full_name'] ?? 'Bạn');
    $email    = htmlspecialchars($user['email'] ?? '');
    $roleName = ($user['role'] ?? '') === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên';
    $stores   = $storeNames ? htmlspecialchars($storeNames) : 'Được chỉ định theo chi nhánh';
    $appUrl   = $cfg['app_url'];

    $title = "Tài khoản của bạn đã được Phê duyệt!";
    $badge = "✅ ĐÃ KÍCH HOẠT THÀNH CÔNG";

    $body = <<<HTML
<p>Xin chào <strong>{$fullName}</strong>,</p>
<p>Chúc mừng bạn! Tài khoản của bạn tại <strong>AKM POS</strong> đã được Quản trị viên phê duyệt và kích hoạt thành công.</p>

<table style="width: 100%; border-collapse: collapse; margin: 18px 0; background: #f0fdf4; border-radius: 10px; overflow: hidden; border: 1px solid #bbf7d0; font-size: 13px;">
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #bbf7d0; color: #166534; width: 38%;">Email đăng nhập:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #bbf7d0; font-weight: 600; color: #15803d;">{$email}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #bbf7d0; color: #166534;">Vai trò hệ thống:</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #bbf7d0; font-weight: 600; color: #0f172a;">{$roleName}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; color: #166534;">Chi nhánh hoạt động:</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">{$stores}</td>
    </tr>
</table>

<p>Bây giờ bạn có thể đăng nhập ngay vào hệ thống để bắt đầu thực hiện các nghiệp vụ bán hàng, quản lý đơn hoặc sửa chữa theo quyền hạn được cấp.</p>
HTML;

    $html = render_email_template($title, $badge, $body, "Đăng nhập AKM POS ngay", $appUrl);
    return send_system_mail($user['email'], "[AKM POS] Tài khoản của bạn đã được kích hoạt thành công", $html);
}

/**
 * 4. Send Account Rejected Notification Email to User
 */
function send_account_rejected_mail(array $user, string $reason = ''): array {
    $fullName = htmlspecialchars($user['full_name'] ?? 'Bạn');
    $reasonText = $reason ? htmlspecialchars($reason) : 'Thông tin đăng ký chưa hợp lệ hoặc không thuộc danh sách nhân sự hiện tại.';

    $title = "Thông báo kết quả xét duyệt tài khoản AKM POS";
    $badge = "✕ TỪ CHỐI PHÊ DUYỆT";

    $body = <<<HTML
<p>Xin chào <strong>{$fullName}</strong>,</p>
<p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu đăng ký tài khoản của bạn tại <strong>AKM POS</strong> đã bị từ chối phê duyệt.</p>

<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 16px; margin: 18px 0; color: #991b1b; font-size: 13px; line-height: 1.5;">
    <strong>Lý do từ chối:</strong><br>
    {$reasonText}
</div>

<p style="color: #64748b; font-size: 13px;">Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ lại với Quản trị viên hoặc bộ phận Nhân sự của bạn để được hỗ trợ.</p>
HTML;

    $html = render_email_template($title, $badge, $body);
    return send_system_mail($user['email'], "[AKM POS] Thông báo kết quả đăng ký tài khoản", $html);
}
