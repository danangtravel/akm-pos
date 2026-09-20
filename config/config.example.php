<?php
return [
    'app' => ['name' => 'AKM POS', 'url' => 'https://your-domain.com', 'timezone' => 'Asia/Ho_Chi_Minh', 'debug' => false],
    'db' => ['host' => 'localhost', 'port' => 3306, 'name' => 'akm_pos', 'user' => 'akm_pos', 'pass' => '', 'charset' => 'utf8mb4'],
    'security' => ['session_name' => 'AKMPOSSESSID'],
    'mail' => [
        'enabled' => true,
        'host' => 'smtp.tino.vn',
        'port' => 587,
        'username' => 'admin@pnnmedia.vn',
        'password' => '4Za68_Du%kCc^u+^',
        'encryption' => 'tls',
        'from_email' => 'admin@pnnmedia.vn',
        'from_name' => 'AKM POS - Anh Khoa Mobile'
    ],
];
