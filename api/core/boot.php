<?php
declare(strict_types=1);

ini_set('default_charset', 'UTF-8');
if (function_exists('mb_internal_encoding')) mb_internal_encoding('UTF-8');
if (function_exists('mb_http_output')) mb_http_output('UTF-8');

// CORS support for mobile native app & PWA
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$root = dirname(__DIR__, 2);
$configFile = $root . '/config/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Ứng dụng chưa được cài đặt. Hãy mở /install.php.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$config = require $configFile;
date_default_timezone_set($config['app']['timezone'] ?? 'Asia/Ho_Chi_Minh');
ini_set('display_errors', !empty($config['app']['debug']) ? '1' : '0');
// 10 years permanent session configuration (315,360,000 seconds)
$sessionLifetime = 315360000;
ini_set('session.gc_maxlifetime', (string)$sessionLifetime);
ini_set('session.cookie_lifetime', (string)$sessionLifetime);

// Isolated app session storage to prevent shared host OS /tmp cron cleanups
$sessionDir = $root . '/sessions';
if (!is_dir($sessionDir)) {
    @mkdir($sessionDir, 0700, true);
    if (is_dir($sessionDir)) {
        @file_put_contents($sessionDir . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    }
}
if (is_dir($sessionDir) && is_writable($sessionDir)) {
    @session_save_path($sessionDir);
}

session_name($config['security']['session_name'] ?? 'AKMPOSSESSID');
session_set_cookie_params([
    'lifetime' => $sessionLifetime,
    'httponly' => true,
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'samesite' => 'Lax',
    'path' => '/'
]);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/audit.php';
require_once __DIR__ . '/stock_engine.php';
require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/webpush.php';

