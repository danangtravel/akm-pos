<?php
// AKM POS - Full System & Database Backup & Restore Module

function get_sql_dump(): string {
    global $config;
    $dbName = $config['db']['name'] ?? 'akm_pos';
    $dbHost = $config['db']['host'] ?? 'localhost';

    $tables = db()->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_COLUMN);
    $dump = "-- =========================================================\n"
          . "-- AKM POS Database Backup Dump\n"
          . "-- Generation Date: " . date('Y-m-d H:i:s') . "\n"
          . "-- Server: " . $dbHost . "\n"
          . "-- Database: " . $dbName . "\n"
          . "-- =========================================================\n\n"
          . "SET FOREIGN_KEY_CHECKS = 0;\n"
          . "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n"
          . "SET time_zone = '+00:00';\n"
          . "SET NAMES utf8mb4;\n\n";

    foreach ($tables as $table) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) continue;
        $dump .= "-- ---------------------------------------------------------\n";
        $dump .= "-- Structure for table `$table`\n";
        $dump .= "-- ---------------------------------------------------------\n";
        $dump .= "DROP TABLE IF EXISTS `$table`;\n";
        $createRow = db()->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
        $dump .= $createRow[1] . ";\n\n";

        // Dump Table Data
        $rows = db()->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            $dump .= "-- Dumping data for table `$table`\n";
            $cols = array_keys($rows[0]);
            $colNames = '`' . implode('`, `', $cols) . '`';
            
            foreach (array_chunk($rows, 100) as $chunk) {
                $valRows = [];
                foreach ($chunk as $row) {
                    $vals = [];
                    foreach ($row as $val) {
                        if ($val === null) {
                            $vals[] = 'NULL';
                        } else {
                            $vals[] = db()->quote((string)$val);
                        }
                    }
                    $valRows[] = '(' . implode(', ', $vals) . ')';
                }
                $dump .= "INSERT INTO `$table` ($colNames) VALUES\n" . implode(",\n", $valRows) . ";\n";
            }
            $dump .= "\n";
        }
    }

    $dump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
    $dump .= "-- Backup completed successfully\n";
    return $dump;
}

function restore_sql_content(string $sqlContent): void {
    if (!trim($sqlContent)) fail('Nội dung SQL sao lưu rỗng');
    db()->exec('SET FOREIGN_KEY_CHECKS = 0;');
    try {
        db()->exec($sqlContent);
        db()->exec('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (Throwable $e) {
        db()->exec('SET FOREIGN_KEY_CHECKS = 1;');
        throw $e;
    }
}

if ($action === 'system.backup.list') {
    require_admin();
    $dir = dirname(__DIR__, 2) . '/backups';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $files = glob($dir . '/*.*') ?: [];
    $validFiles = [];
    foreach ($files as $f) {
        if (preg_match('/\.(zip|sql)$/i', $f)) {
            $validFiles[] = $f;
        }
    }
    rsort($validFiles);
    $list = [];
    $totalSize = 0;
    foreach ($validFiles as $f) {
        $size = filesize($f);
        $totalSize += $size;
        $mtime = filemtime($f);
        $name = basename($f);
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $formatted = $size >= 1048576 
            ? number_format($size / 1048576, 2) . ' MB' 
            : number_format($size / 1024, 1) . ' KB';
        $list[] = [
            'filename' => $name,
            'type' => $ext === 'zip' ? 'FULL' : 'SQL',
            'size' => $size,
            'size_formatted' => $formatted,
            'created_at' => date('Y-m-d H:i:s', $mtime),
            'created_at_formatted' => date('d/m/Y H:i:s', $mtime)
        ];
    }
    $totalFormatted = $totalSize >= 1048576 
        ? number_format($totalSize / 1048576, 2) . ' MB' 
        : number_format($totalSize / 1024, 1) . ' KB';

    json_response([
        'backups' => $list,
        'count' => count($list),
        'total_size_formatted' => $totalFormatted,
        'latest' => $list[0] ?? null
    ]);
}

if ($action === 'system.backup.create') {
    require_admin();
    @set_time_limit(300);
    $d = body();
    $type = strtoupper($d['type'] ?? 'FULL'); // 'FULL' or 'SQL'
    $dir = dirname(__DIR__, 2) . '/backups';
    $rootDir = dirname(__DIR__, 2);
    if (!is_dir($dir)) @mkdir($dir, 0750, true);

    $dump = get_sql_dump();

    if ($type === 'FULL' && class_exists('ZipArchive')) {
        $filename = 'akm-pos-full-backup-' . date('Ymd-His') . '.zip';
        $filepath = $dir . '/' . $filename;
        $zip = new ZipArchive();
        if ($zip->open($filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            fail('Không thể tạo tệp zip sao lưu.');
        }

        // Add SQL dump
        $zip->addFromString('database.sql', $dump);

        // Add uploads directory
        $uploadsDir = $rootDir . '/uploads';
        if (is_dir($uploadsDir)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($files as $file) {
                if ($file->isFile()) {
                    $relative = 'uploads/' . substr($file->getPathname(), strlen($uploadsDir) + 1);
                    $zip->addFile($file->getPathname(), str_replace('\\', '/', $relative));
                }
            }
        }

        // Add Manifest
        $manifest = [
            'app' => 'AKM POS',
            'type' => 'FULL_SYSTEM_BACKUP',
            'created_at' => date('Y-m-d H:i:s'),
            'version' => '1.0'
        ];
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->close();

        audit('BACKUP_CREATE_FULL', 'SYSTEM', null, null, ['filename' => $filename, 'size' => filesize($filepath)], 'Tạo bản sao lưu Full hệ thống (Database + Uploads)');

        json_response([
            'filename' => $filename,
            'type' => 'FULL',
            'size_formatted' => number_format(filesize($filepath) / 1024, 1) . ' KB',
            'message' => "Đã tạo bản sao lưu Full hệ thống $filename thành công."
        ]);
    } else {
        // SQL Only Backup
        $filename = 'akm-pos-sql-backup-' . date('Ymd-His') . '.sql';
        $filepath = $dir . '/' . $filename;
        if (file_put_contents($filepath, $dump) === false) {
            fail('Không thể ghi tệp sao lưu vào thư mục backups/.');
        }

        audit('BACKUP_CREATE_SQL', 'SYSTEM', null, null, ['filename' => $filename, 'size' => strlen($dump)], 'Tạo bản sao lưu cơ sở dữ liệu SQL');

        json_response([
            'filename' => $filename,
            'type' => 'SQL',
            'size_formatted' => number_format(strlen($dump) / 1024, 1) . ' KB',
            'message' => "Đã tạo bản sao lưu cơ sở dữ liệu $filename thành công."
        ]);
    }
}

if ($action === 'system.backup.download') {
    require_admin();
    $file = basename($_GET['file'] ?? '');
    if (!$file || !preg_match('/^akm-pos-[\w-]+\.(zip|sql)$/i', $file)) {
        fail('Tên tệp không hợp lệ');
    }
    $filepath = dirname(__DIR__, 2) . '/backups/' . $file;
    if (!is_file($filepath)) {
        fail('Tệp sao lưu không tồn tại', 404);
    }
    audit('BACKUP_DOWNLOAD', 'SYSTEM', null, null, ['filename' => $file], 'Tải về bản sao lưu ' . $file);

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = $ext === 'zip' ? 'application/zip' : 'application/sql; charset=UTF-8';

    header('Content-Type: ' . $mime);
    header('Content-Disposition: attachment; filename="' . $file . '"');
    header('Content-Length: ' . filesize($filepath));
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    readfile($filepath);
    exit;
}

if ($action === 'system.backup.restore') {
    require_admin();
    $d = body();
    $file = basename($d['file'] ?? '');
    if (!$file || !preg_match('/^akm-pos-[\w-]+\.(zip|sql)$/i', $file)) {
        fail('Tên tệp sao lưu không hợp lệ');
    }
    $rootDir = dirname(__DIR__, 2);
    $filepath = $rootDir . '/backups/' . $file;
    if (!is_file($filepath)) {
        fail('Không tìm thấy tệp sao lưu để phục hồi', 404);
    }

    @set_time_limit(300);
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if ($ext === 'zip') {
        if (!class_exists('ZipArchive')) fail('PHP ZipArchive không khả dụng để giải nén tệp zip.');
        $zip = new ZipArchive();
        if ($zip->open($filepath) !== true) fail('Không thể mở tệp zip sao lưu');
        
        // 1. Restore Database from database.sql
        $sqlContent = $zip->getFromName('database.sql');
        if (!$sqlContent) {
            $zip->close();
            fail('Tệp zip không chứa database.sql hợp lệ');
        }
        restore_sql_content($sqlContent);

        // 2. Extract uploads/
        $uploadsDir = $rootDir . '/uploads';
        if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0755, true);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entry = $zip->getNameIndex($i);
            if (str_starts_with($entry, 'uploads/') && !str_ends_with($entry, '/')) {
                $content = $zip->getFromIndex($i);
                $dest = $rootDir . '/' . $entry;
                $destDir = dirname($dest);
                if (!is_dir($destDir)) @mkdir($destDir, 0755, true);
                @file_put_contents($dest, $content);
            }
        }
        $zip->close();

        audit('BACKUP_RESTORE_FULL', 'SYSTEM', null, null, ['filename' => $file], 'Phục hồi toàn bộ hệ thống từ tệp Full Backup ' . $file);
        json_response(['message' => "Đã phục hồi toàn bộ hệ thống & CSDL từ bản sao lưu $file thành công!"]);
    } else {
        // SQL restore
        $sqlContent = file_get_contents($filepath);
        if (!$sqlContent) fail('Tệp sao lưu rỗng hoặc không đọc được');
        restore_sql_content($sqlContent);

        audit('BACKUP_RESTORE_SQL', 'SYSTEM', null, null, ['filename' => $file], 'Phục hồi cơ sở dữ liệu từ tệp SQL ' . $file);
        json_response(['message' => "Đã phục hồi cơ sở dữ liệu từ bản sao lưu $file thành công!"]);
    }
}

if ($action === 'system.backup.delete') {
    require_admin();
    $d = body();
    $file = basename($d['file'] ?? '');
    if (!$file || !preg_match('/^akm-pos-[\w-]+\.(zip|sql)$/i', $file)) {
        fail('Tên tệp không hợp lệ');
    }
    $filepath = dirname(__DIR__, 2) . '/backups/' . $file;
    if (is_file($filepath)) {
        @unlink($filepath);
        audit('BACKUP_DELETE', 'SYSTEM', null, null, ['filename' => $file], 'Xóa bản sao lưu ' . $file);
        json_response(['message' => "Đã xóa bản sao lưu $file thành công."]);
    } else {
        fail('Tệp không tồn tại', 404);
    }
}

if ($action === 'system.backup.upload') {
    require_admin();
    if (empty($_FILES['backup_file']['tmp_name']) || !is_uploaded_file($_FILES['backup_file']['tmp_name'])) {
        fail('Vui lòng chọn tệp .zip hoặc .sql để tải lên');
    }
    $origName = $_FILES['backup_file']['name'] ?? '';
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, ['zip', 'sql'], true)) {
        fail('Chỉ chấp nhận tệp định dạng .zip hoặc .sql');
    }

    @set_time_limit(300);
    $rootDir = dirname(__DIR__, 2);
    $dir = $rootDir . '/backups';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);

    $saveName = 'akm-pos-uploaded-' . date('Ymd-His') . '.' . $ext;
    $targetPath = $dir . '/' . $saveName;
    if (!move_uploaded_file($_FILES['backup_file']['tmp_name'], $targetPath)) {
        fail('Không thể lưu tệp tải lên vào thư mục backups/');
    }

    if ($ext === 'zip') {
        if (!class_exists('ZipArchive')) fail('PHP ZipArchive không khả dụng');
        $zip = new ZipArchive();
        if ($zip->open($targetPath) !== true) fail('Không thể mở tệp zip tải lên');
        $sqlContent = $zip->getFromName('database.sql');
        if (!$sqlContent) {
            $zip->close();
            fail('Tệp zip không chứa database.sql');
        }
        restore_sql_content($sqlContent);

        // Extract uploads
        $uploadsDir = $rootDir . '/uploads';
        if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0755, true);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entry = $zip->getNameIndex($i);
            if (str_starts_with($entry, 'uploads/') && !str_ends_with($entry, '/')) {
                $content = $zip->getFromIndex($i);
                $dest = $rootDir . '/' . $entry;
                $destDir = dirname($dest);
                if (!is_dir($destDir)) @mkdir($destDir, 0755, true);
                @file_put_contents($dest, $content);
            }
        }
        $zip->close();

        audit('BACKUP_UPLOAD_FULL', 'SYSTEM', null, null, ['original_name' => $origName, 'saved_as' => $saveName], 'Tải lên và phục hồi toàn bộ hệ thống từ tệp ZIP');
        json_response(['message' => 'Đã tải lên và phục hồi toàn bộ hệ thống & CSDL thành công!']);
    } else {
        $sqlContent = file_get_contents($targetPath);
        if (!$sqlContent) fail('Tệp SQL rỗng');
        restore_sql_content($sqlContent);

        audit('BACKUP_UPLOAD_SQL', 'SYSTEM', null, null, ['original_name' => $origName, 'saved_as' => $saveName], 'Tải lên và phục hồi CSDL từ tệp SQL');
        json_response(['message' => 'Đã tải lên và phục hồi cơ sở dữ liệu thành công!']);
    }
}
