<?php
declare(strict_types=1);

function issue_remember_token(int $userId): string {
    try {
        // Cleanup expired tokens for this user
        query('DELETE FROM user_remember_tokens WHERE user_id=? AND expires_at < NOW()', [$userId]);

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + 315360000); // 10 years
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
        $ip = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 64);

        query('INSERT INTO user_remember_tokens(user_id, token_hash, user_agent, ip_address, expires_at) VALUES(?,?,?,?,?)', [
            $userId,
            $tokenHash,
            $ua,
            $ip,
            $expiresAt
        ]);

        $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        setcookie('akm_remember', $token, [
            'expires' => time() + 315360000,
            'path' => '/',
            'domain' => '',
            'secure' => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        return $token;
    } catch (Throwable $e) {
        return '';
    }
}

function revoke_remember_token(): void {
    try {
        if (!empty($_COOKIE['akm_remember']) && is_string($_COOKIE['akm_remember'])) {
            $tokenHash = hash('sha256', trim($_COOKIE['akm_remember']));
            query('DELETE FROM user_remember_tokens WHERE token_hash=?', [$tokenHash]);
        }
    } catch (Throwable $e) {}

    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    setcookie('akm_remember', '', [
        'expires' => time() - 86400,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    unset($_COOKIE['akm_remember']);
}

function current_user(): ?array {
    static $cache = false;
    if ($cache !== false) return $cache;

    // 1. Check active session
    if (!empty($_SESSION['user_id'])) {
        try {
            $u = query('SELECT id,full_name,email,phone,role,permissions,is_active FROM users WHERE id=?', [$_SESSION['user_id']])->fetch();
            if ($u && (int)$u['is_active'] === 1) {
                $u['permissions'] = json_decode($u['permissions'] ?: '{}', true) ?: [];
                $u['store_ids'] = allowed_store_ids_raw((int)$u['id'], $u['role']);
                return $cache = $u;
            }
        } catch (Throwable $e) {}

        // Inactive user in session -> cleanup
        revoke_remember_token();
        if (session_status() === PHP_SESSION_ACTIVE) @session_destroy();
        return $cache = null;
    }

    // 2. Check persistent remember cookie
    if (!empty($_COOKIE['akm_remember']) && is_string($_COOKIE['akm_remember'])) {
        $rawToken = trim($_COOKIE['akm_remember']);
        if (strlen($rawToken) >= 32) {
            try {
                $tokenHash = hash('sha256', $rawToken);
                $tok = query('SELECT t.id, t.user_id, u.id uid, u.full_name, u.email, u.phone, u.role, u.permissions, u.is_active FROM user_remember_tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = ? AND t.expires_at > NOW() AND u.is_active = 1', [$tokenHash])->fetch();
                if ($tok && !empty($tok['uid'])) {
                    // Restore PHP session
                    if (session_status() === PHP_SESSION_ACTIVE) {
                        @session_regenerate_id(true);
                    }
                    $_SESSION['user_id'] = (int)$tok['uid'];
                    if (function_exists('csrf_token')) {
                        csrf_token();
                    }

                    $u = [
                        'id' => (int)$tok['uid'],
                        'full_name' => $tok['full_name'],
                        'email' => $tok['email'],
                        'phone' => $tok['phone'],
                        'role' => $tok['role'],
                        'permissions' => json_decode($tok['permissions'] ?: '{}', true) ?: [],
                        'is_active' => (int)$tok['is_active'],
                    ];
                    $u['store_ids'] = allowed_store_ids_raw((int)$u['id'], $u['role']);
                    return $cache = $u;
                }
            } catch (Throwable $e) {}
        }
        revoke_remember_token();
    }

    return $cache = null;
}

function allowed_store_ids_raw(int $uid, string $role): array {
    if ($role === 'ADMIN') {
        return array_map('intval', query('SELECT id FROM stores WHERE is_active=1')->fetchAll(PDO::FETCH_COLUMN));
    }
    return array_map('intval', query('SELECT store_id FROM user_stores WHERE user_id=?', [$uid])->fetchAll(PDO::FETCH_COLUMN));
}

function require_auth(): array {
    $u = current_user();
    if (!$u) fail('Vui lòng đăng nhập', 401);
    return $u;
}

function require_admin(): array {
    $u = require_auth();
    if ($u['role'] !== 'ADMIN') fail('Chức năng chỉ dành cho Admin', 403);
    return $u;
}

function has_permission(string $name): bool {
    $u = current_user();
    if (!$u) return false;
    if ($u['role'] === 'ADMIN') return true;
    $perms = $u['permissions'] ?? [];
    if (!empty($perms[$name])) return true;
    $legacyMap = [
        'sales' => ['pos.access', 'pos.discount', 'pos.cancel_order'],
        'orders' => ['orders.view', 'orders.export'],
        'inventory' => ['inventory.view', 'inventory.adjust'],
        'transfers' => ['transfers.create', 'transfers.approve'],
        'returns' => ['returns.create'],
        'repairs' => ['repairs.view', 'repairs.manage'],
        'reports' => ['reports.view', 'reports.export'],
    ];
    foreach ($legacyMap as $oldKey => $newKeys) {
        if (in_array($name, $newKeys, true) && !empty($perms[$oldKey])) return true;
    }
    return false;
}
