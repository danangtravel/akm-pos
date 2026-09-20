<?php
if (!function_exists('str_starts_with')) { function str_starts_with(string $haystack, string $needle): bool { return $needle === '' || strpos($haystack, $needle) === 0; } }
function json_response($data = null, int $status = 200) { http_response_code($status); header('Content-Type: application/json; charset=UTF-8'); echo json_encode(['ok' => $status < 400, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function fail(string $message, int $status = 422, $details = null) { http_response_code($status); header('Content-Type: application/json; charset=UTF-8'); echo json_encode(['ok' => false, 'error' => $message, 'details' => $details], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function body(): array { static $v; if ($v !== null) return $v; $raw = file_get_contents('php://input'); $v = $raw ? (json_decode($raw, true) ?: []) : $_POST; return $v; }
function require_fields(array $data, array $fields): void { foreach ($fields as $f) if (!isset($data[$f]) || $data[$f] === '') fail("Thiếu trường: $f"); }
function query(string $sql, array $params = []): PDOStatement { $s=db()->prepare($sql); $s->execute($params); return $s; }
function code(string $prefix): string { return $prefix . date('ymdHis') . strtoupper(substr(bin2hex(random_bytes(3)),0,4)); }
function csrf_token(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24)); return $_SESSION['csrf']; }
function verify_csrf(): void { if (in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['POST','PUT','PATCH','DELETE'], true) && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('CSRF token không hợp lệ', 419); }
function page_params(): array { $page=max(1,(int)($_GET['page']??1)); $limit=min(2000,max(1,(int)($_GET['limit']??100))); return [$limit,($page-1)*$limit]; }
function allowed_store_ids(): array { $u=current_user(); if (!$u) return []; if ($u['role']==='ADMIN') return array_map('intval',query('SELECT id FROM stores WHERE is_active=1')->fetchAll(PDO::FETCH_COLUMN)); return array_map('intval',query('SELECT store_id FROM user_stores WHERE user_id=?',[$u['id']])->fetchAll(PDO::FETCH_COLUMN)); }
function assert_store(int $id): void { if (!in_array($id,allowed_store_ids(),true)) fail('Bạn không có quyền truy cập cửa hàng này',403); }
function placeholders(int $n): string { return implode(',',array_fill(0,$n,'?')); }
function notify(string $type, string $title, string $message, string $severity = 'INFO', ?int $storeId = null, ?int $userId = null, ?string $linkType = null, ?string $linkId = null): ?int {
    try {
        query('INSERT INTO notifications(store_id, user_id, type, title, message, link_type, link_id, severity) VALUES(?,?,?,?,?,?,?,?)', [
            $storeId ?: null,
            $userId ?: null,
            $type,
            $title,
            $message,
            $linkType ?: null,
            $linkId !== null ? (string)$linkId : null,
            in_array($severity, ['INFO', 'WARNING', 'DANGER', 'SUCCESS'], true) ? $severity : 'INFO'
        ]);
        $notifId = (int)db()->lastInsertId();

        // Trigger real background Web Push to devices even when PWA/browser is completely closed
        if (function_exists('webpush_send_notification')) {
            webpush_send_notification([
                'id' => $notifId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'severity' => $severity,
                'store_id' => $storeId,
                'user_id' => $userId,
                'link_type' => $linkType,
                'link_id' => $linkId
            ]);
        }

        return $notifId;
    } catch (Throwable $e) {
        return null;
    }
}
