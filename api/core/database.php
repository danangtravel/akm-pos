<?php
function db(): PDO {
    static $pdo;
    global $config;
    if (!$pdo) {
        $d = $config['db'];
        $dsn = "mysql:host={$d['host']};port=" . ($d['port'] ?? 3306) . ";dbname={$d['name']};charset=" . ($d['charset'] ?? 'utf8mb4');
        $pdo = new PDO($dsn, $d['user'], $d['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
        $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        try {
            $pdo->exec("ALTER TABLE repair_cases ADD COLUMN fee DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER repair_request");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("ALTER TABLE repair_cases ADD COLUMN staff_note TEXT NULL AFTER repair_request");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("ALTER TABLE products ADD COLUMN cost_price DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER name");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL AFTER selling_price");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("ALTER TABLE products ADD COLUMN image_url TEXT NULL AFTER brand");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS mail_logs (
              id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT UNSIGNED NULL,
              to_email VARCHAR(190) NOT NULL,
              subject VARCHAR(255) NOT NULL,
              driver VARCHAR(30) NOT NULL DEFAULT 'smtp',
              status ENUM('SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
              error_message TEXT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_mail_date(created_at),
              INDEX idx_mail_status(status),
              FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
              id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              store_id BIGINT UNSIGNED NULL,
              user_id BIGINT UNSIGNED NULL,
              type VARCHAR(50) NOT NULL,
              title VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              link_type VARCHAR(50) NULL,
              link_id VARCHAR(100) NULL,
              severity ENUM('INFO','WARNING','DANGER','SUCCESS') NOT NULL DEFAULT 'INFO',
              is_read TINYINT(1) NOT NULL DEFAULT 0,
              read_at DATETIME NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_notif_user(user_id,is_read,created_at),
              INDEX idx_notif_store(store_id,created_at),
              INDEX idx_notif_date(created_at),
              FOREIGN KEY(store_id) REFERENCES stores(id) ON DELETE CASCADE,
              FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (Throwable $e) {}
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS user_remember_tokens (
              id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT UNSIGNED NOT NULL,
              token_hash VARCHAR(64) NOT NULL UNIQUE,
              user_agent VARCHAR(255) NULL,
              ip_address VARCHAR(64) NULL,
              expires_at DATETIME NOT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_tokens(user_id, expires_at),
              INDEX idx_token_hash(token_hash),
              FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (Throwable $e) {}
    }
    return $pdo;
}
