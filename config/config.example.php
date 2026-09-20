<?php
return [
    'app' => ['name' => 'AKM POS', 'url' => 'https://your-domain.com', 'timezone' => 'Asia/Ho_Chi_Minh', 'debug' => false],
    'db' => ['host' => 'localhost', 'port' => 3306, 'name' => 'akm_pos', 'user' => 'akm_pos', 'pass' => '', 'charset' => 'utf8mb4'],
    'security' => ['session_name' => 'AKMPOSSESSID'],
    'mail' => [
        'enabled' => false,
        'host' => 'smtp.example.com',
        'port' => 587,
        'username' => 'your_smtp_user@example.com',
        'password' => 'your_smtp_password',
        'encryption' => 'tls',
        'from_email' => 'no-reply@example.com',
        'from_name' => 'AKM POS'
    ],
];
