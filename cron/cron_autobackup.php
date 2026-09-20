<?php
require __DIR__.'/bootstrap.php';
global $config;
$d = $config['db'];
$dir = dirname(__DIR__) . '/backups';
if (!is_dir($dir)) @mkdir($dir, 0750, true);
$file = $dir . '/akm-pos-' . date('Ymd-His') . '.sql';
$cmd = 'mysqldump --single-transaction --quick --skip-lock-tables -h ' . escapeshellarg($d['host']) . ' -P ' . (int)$d['port'] . ' -u ' . escapeshellarg($d['user']) . ' --password=' . escapeshellarg($d['pass']) . ' ' . escapeshellarg($d['name']) . ' > ' . escapeshellarg($file);
exec($cmd, $out, $code);

if ($code !== 0) {
    @unlink($file);
    audit('CRON_BACKUP_FAIL', 'BACKUP', null, null, ['code' => $code], 'Cron tự động sao lưu SQL thất bại');
    exit("Backup failed\n");
}

$files = glob($dir . '/akm-pos-*.sql') ?: [];
rsort($files);
foreach (array_slice($files, 7) as $old) @unlink($old);

$filename = basename($file);
audit('CRON_BACKUP_SUCCESS', 'BACKUP', null, null, ['file' => $filename, 'size' => filesize($file)], 'Cron tự động sao lưu SQL thành công: ' . $filename);
echo "$filename\n";
