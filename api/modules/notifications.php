<?php
// AKM POS - Notifications & System Alerts Module

if ($action === 'notifications.unread_count') {
    $u = require_auth();
    $ids = allowed_store_ids();
    $userId = (int)$u['id'];

    if ($u['role'] === 'ADMIN') {
        $where = "is_read = 0";
        $params = [];
    } else {
        if ($ids) {
            $ph = placeholders(count($ids));
            $where = "is_read = 0 AND (user_id = ? OR (user_id IS NULL AND (store_id IS NULL OR store_id IN ($ph))))";
            $params = array_merge([$userId], $ids);
        } else {
            $where = "is_read = 0 AND (user_id = ? OR (user_id IS NULL AND store_id IS NULL))";
            $params = [$userId];
        }
    }

    $count = (int)query("SELECT COUNT(*) FROM notifications WHERE $where", $params)->fetchColumn();
    $maxId = (int)query("SELECT COALESCE(MAX(id), 0) FROM notifications WHERE $where", $params)->fetchColumn();
    
    // Also fetch the 5 latest unread items for fast UI preview / push banner
    $latest = query("SELECT n.*, s.name store_name FROM notifications n LEFT JOIN stores s ON s.id=n.store_id WHERE $where ORDER BY n.id DESC LIMIT 5", $params)->fetchAll();

    json_response([
        'unread_count' => $count,
        'max_id' => $maxId,
        'latest' => $latest
    ]);
}

if ($action === 'notifications.list') {
    $u = require_auth();
    $ids = allowed_store_ids();
    $userId = (int)$u['id'];
    [$limit, $offset] = page_params();
    $filter = trim((string)($_GET['filter'] ?? 'all'));
    $q = trim((string)($_GET['q'] ?? ''));

    $conds = [];
    $params = [];

    // Scope condition by role
    if ($u['role'] === 'ADMIN') {
        // Admin sees all
    } else {
        if ($ids) {
            $ph = placeholders(count($ids));
            $conds[] = "(n.user_id = ? OR (n.user_id IS NULL AND (n.store_id IS NULL OR n.store_id IN ($ph))))";
            $params[] = $userId;
            $params = array_merge($params, $ids);
        } else {
            $conds[] = "(n.user_id = ? OR (n.user_id IS NULL AND n.store_id IS NULL))";
            $params[] = $userId;
        }
    }

    // Filter type condition
    if ($filter === 'unread') {
        $conds[] = "n.is_read = 0";
    } elseif ($filter === 'sales' || $filter === 'orders') {
        $conds[] = "(n.type IN ('SALE_NEW', 'SALE_ALERT', 'ORDER_CANCELLED', 'RETURN_CREATED') OR n.link_type IN ('orders', 'returns'))";
    } elseif ($filter === 'stock') {
        $conds[] = "n.type IN ('LOW_STOCK', 'STOCK_OUT', 'STOCK_ADJUST')";
    } elseif ($filter === 'repairs') {
        $conds[] = "(n.type LIKE 'REPAIR%' OR n.link_type = 'repairs')";
    } elseif ($filter === 'transfers') {
        $conds[] = "(n.type LIKE '%TRANSFER%' OR n.link_type = 'transfers')";
    } elseif ($filter === 'alerts') {
        $conds[] = "(n.severity IN ('WARNING', 'DANGER') OR n.type IN ('LOW_STOCK', 'STOCK_OUT', 'REPAIR_OVERDUE', 'TRANSFER_REMINDER'))";
    } elseif ($filter === 'system') {
        $conds[] = "n.type IN ('SYSTEM', 'BACKUP', 'BROADCAST', 'CUSTOM')";
    }

    // Search query
    if ($q !== '') {
        $conds[] = "(n.title LIKE ? OR n.message LIKE ?)";
        $params[] = "%$q%";
        $params[] = "%$q%";
    }

    $whereSql = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';

    $total = (int)query("SELECT COUNT(*) FROM notifications n $whereSql", $params)->fetchColumn();
    $unreadTotal = (int)query("SELECT COUNT(*) FROM notifications n " . ($whereSql ? "$whereSql AND n.is_read=0" : "WHERE n.is_read=0"), $params)->fetchColumn();

    $sql = "SELECT n.*, s.name store_name, s.code store_code, u.full_name user_name 
            FROM notifications n 
            LEFT JOIN stores s ON s.id=n.store_id 
            LEFT JOIN users u ON u.id=n.user_id 
            $whereSql 
            ORDER BY n.id DESC 
            LIMIT $limit OFFSET $offset";
    
    $rows = query($sql, $params)->fetchAll();

    json_response([
        'items' => $rows,
        'total' => $total,
        'unread' => $unreadTotal,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

if ($action === 'notifications.mark_read') {
    $u = require_auth();
    $d = body();
    $id = (int)($d['id'] ?? 0);
    $all = !empty($d['all']);
    $ids = allowed_store_ids();
    $userId = (int)$u['id'];

    if ($all) {
        if ($u['role'] === 'ADMIN') {
            query("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0");
        } else {
            if ($ids) {
                $ph = placeholders(count($ids));
                query("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0 AND (user_id = ? OR (user_id IS NULL AND (store_id IS NULL OR store_id IN ($ph))))", array_merge([$userId], $ids));
            } else {
                query("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0 AND (user_id = ? OR (user_id IS NULL AND store_id IS NULL))", [$userId]);
            }
        }
        json_response(['success' => true, 'marked_all' => true]);
    }

    if (!$id) fail('ID thông báo không hợp lệ');
    query("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?", [$id]);
    json_response(['success' => true, 'id' => $id]);
}

if ($action === 'notifications.delete') {
    $u = require_auth();
    $d = body();
    $id = (int)($d['id'] ?? 0);
    $clearRead = !empty($d['clear_read']);
    $ids = allowed_store_ids();
    $userId = (int)$u['id'];

    if ($clearRead) {
        if ($u['role'] === 'ADMIN') {
            query("DELETE FROM notifications WHERE is_read = 1");
        } else {
            if ($ids) {
                $ph = placeholders(count($ids));
                query("DELETE FROM notifications WHERE is_read = 1 AND (user_id = ? OR (user_id IS NULL AND (store_id IS NULL OR store_id IN ($ph))))", array_merge([$userId], $ids));
            } else {
                query("DELETE FROM notifications WHERE is_read = 1 AND (user_id = ? OR (user_id IS NULL AND store_id IS NULL))", [$userId]);
            }
        }
        json_response(['success' => true, 'cleared_read' => true]);
    }

    if (!$id) fail('ID thông báo không hợp lệ');
    if ($u['role'] !== 'ADMIN') {
        $n = query("SELECT * FROM notifications WHERE id = ?", [$id])->fetch();
        if (!$n) fail('Không tìm thấy thông báo', 404);
        if ($n['user_id'] && (int)$n['user_id'] !== $userId) fail('Bạn không có quyền xóa thông báo này', 403);
    }
    query("DELETE FROM notifications WHERE id = ?", [$id]);
    json_response(['success' => true, 'id' => $id]);
}

if ($action === 'notifications.send') {
    $admin = require_admin();
    $d = body();
    require_fields($d, ['title', 'message']);

    $title = trim((string)$d['title']);
    $message = trim((string)$d['message']);
    $severity = in_array($d['severity'] ?? '', ['INFO', 'WARNING', 'DANGER', 'SUCCESS'], true) ? $d['severity'] : 'INFO';
    $storeId = !empty($d['store_id']) ? (int)$d['store_id'] : null;
    $targetUserId = !empty($d['user_id']) ? (int)$d['user_id'] : null;
    $type = !empty($d['type']) ? trim((string)$d['type']) : 'BROADCAST';
    $linkType = !empty($d['link_type']) ? trim((string)$d['link_type']) : null;
    $linkId = !empty($d['link_id']) ? trim((string)$d['link_id']) : null;

    $notifId = notify($type, $title, $message, $severity, $storeId, $targetUserId, $linkType, $linkId);

    audit('NOTIFICATION_SEND', 'SYSTEM', $notifId, null, [
        'title' => $title,
        'severity' => $severity,
        'store_id' => $storeId,
        'user_id' => $targetUserId
    ], "Admin phát thông báo hệ thống: $title");

    json_response([
        'success' => true,
        'id' => $notifId,
        'message' => 'Đã gửi thông báo thành công!'
    ]);
}

if ($action === 'notifications.scan') {
    $u = require_auth();
    $createdCount = 0;

    // 1. Quét hàng tồn kho thấp dưới ngưỡng
    $threshold = (int)query("SELECT config_value FROM settings WHERE config_key='low_stock_threshold'")->fetchColumn() ?: 5;

    // Tự động dọn thông báo tồn thấp đã được khắc phục (đã nhập thêm hàng > định mức)
    try {
        query("
            DELETE n FROM notifications n
            JOIN inventories i ON i.product_id = CAST(n.link_id AS UNSIGNED) AND i.store_id = n.store_id
            WHERE n.type IN ('LOW_STOCK', 'STOCK_OUT') AND i.quantity > ?
        ", [$threshold]);
    } catch (Throwable $e) {}

    $lowStocks = query("
        SELECT p.id product_id, p.name product_name, s.id store_id, s.name store_name, COALESCE(i.quantity, 0) quantity
        FROM products p
        CROSS JOIN stores s
        LEFT JOIN inventories i ON i.product_id=p.id AND i.store_id=s.id
        WHERE p.is_active = 1 AND s.is_active = 1 AND COALESCE(i.quantity, 0) <= ?
        ORDER BY quantity ASC LIMIT 30
    ", [$threshold])->fetchAll();

    foreach ($lowStocks as $ls) {
        $pid = (int)$ls['product_id'];
        $sid = (int)$ls['store_id'];
        
        // Chỉ thông báo 1 lần duy nhất: nếu đã có thông báo (chưa đọc hoặc đã xem), không gửi lại
        $already = (int)query("
            SELECT COUNT(*) FROM notifications 
            WHERE type IN ('LOW_STOCK', 'STOCK_OUT') AND store_id=? AND link_id=?
        ", [$sid, (string)$pid])->fetchColumn();

        if ($already === 0) {
            $qty = (int)$ls['quantity'];
            $sev = $qty <= 0 ? 'DANGER' : 'WARNING';
            $title = $qty <= 0 ? "Hết hàng: {$ls['product_name']}" : "Sắp hết ({$qty} cái): {$ls['product_name']}";
            $msg = "Kho {$ls['store_name']} chỉ còn {$qty} sản phẩm (định mức: {$threshold}).";
            notify('LOW_STOCK', $title, $msg, $sev, $sid, null, 'inventory', (string)$pid);
            $createdCount++;
        }
    }

    // 2. Quét phiếu sửa chữa sắp đến hạn hoặc quá hạn
    $dueRepairs = query("
        SELECT r.id, r.repair_code, r.customer_name, r.device_name, r.expected_return_at, r.store_id, r.technician_id, s.name store_name
        FROM repair_cases r
        JOIN stores s ON s.id=r.store_id
        WHERE r.status NOT IN ('COMPLETED', 'WAITING_PICKUP', 'RETURNED')
          AND r.expected_return_at IS NOT NULL
          AND r.expected_return_at <= DATE_ADD(NOW(), INTERVAL 1 DAY)
        ORDER BY r.expected_return_at ASC LIMIT 25
    ")->fetchAll();

    foreach ($dueRepairs as $rp) {
        $rid = (int)$rp['id'];
        $already = (int)query("
            SELECT COUNT(*) FROM notifications 
            WHERE type IN ('REPAIR_DUE', 'REPAIR_OVERDUE') AND link_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 18 HOUR)
        ", [(string)$rid])->fetchColumn();

        if ($already === 0) {
            $isOverdue = strtotime($rp['expected_return_at']) < time();
            $sev = $isOverdue ? 'DANGER' : 'WARNING';
            $type = $isOverdue ? 'REPAIR_OVERDUE' : 'REPAIR_DUE';
            $title = $isOverdue ? "Quá hạn sửa: {$rp['device_name']}" : "Sắp đến hẹn: {$rp['device_name']}";
            $msg = "Khách {$rp['customer_name']} ({$rp['store_name']}) · Hẹn: {$rp['expected_return_at']}";
            notify($type, $title, $msg, $sev, (int)$rp['store_id'], $rp['technician_id'] ? (int)$rp['technician_id'] : null, 'repairs', (string)$rid);
            $createdCount++;
        }
    }

    // 3. Quét phiếu điều chuyển kho chờ duyệt quá 2 tiếng
    $pendingTransfers = query("
        SELECT t.id, t.transfer_code, t.from_store_id, t.to_store_id, a.name from_store, b.name to_store, t.requested_at, u.full_name requested_by_name
        FROM stock_transfers t
        JOIN stores a ON a.id=t.from_store_id
        JOIN stores b ON b.id=t.to_store_id
        JOIN users u ON u.id=t.requested_by
        WHERE t.status = 'REQUESTED' AND t.requested_at <= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        ORDER BY t.requested_at ASC LIMIT 15
    ")->fetchAll();

    foreach ($pendingTransfers as $tr) {
        $tid = (int)$tr['id'];
        $already = (int)query("
            SELECT COUNT(*) FROM notifications 
            WHERE type='TRANSFER_REMINDER' AND link_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        ", [(string)$tid])->fetchColumn();

        if ($already === 0) {
            $title = "Chờ duyệt chuyển: {$tr['from_store']} ➔ {$tr['to_store']}";
            $msg = "Do {$tr['requested_by_name']} tạo, đang chờ Quản trị viên duyệt";
            notify('TRANSFER_REMINDER', $title, $msg, 'WARNING', (int)$tr['to_store_id'], null, 'transfers', (string)$tid);
            $createdCount++;
        }
    }

    json_response([
        'success' => true,
        'created' => $createdCount,
        'message' => $createdCount > 0 ? "Đã phát hiện và tạo $createdCount thông báo/cảnh báo mới." : "Hệ thống an toàn, chưa có cảnh báo mới phát sinh."
    ]);
}

if ($action === 'push.vapid_public_key') {
    $u = require_auth();
    $keys = webpush_get_vapid_keys();
    json_response([
        'public_key' => $keys['public_key']
    ]);
}

if ($action === 'push.subscribe') {
    $u = require_auth();
    verify_csrf();
    $d = body();
    require_fields($d, ['endpoint']);

    $endpoint = trim((string)$d['endpoint']);
    $keys = $d['keys'] ?? [];
    $p256dh = trim((string)($keys['p256dh'] ?? ($d['p256dh'] ?? '')));
    $auth = trim((string)($keys['auth'] ?? ($d['auth'] ?? '')));
    $storeId = !empty($d['store_id']) ? (int)$d['store_id'] : null;
    $userAgent = substr(trim((string)($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 250);

    if (!$endpoint || !$p256dh || !$auth) {
        fail('Dữ liệu đăng ký push không đầy đủ');
    }

    webpush_ensure_schema();

    // Remove existing identical endpoint if assigned to another user/session
    query("DELETE FROM push_subscriptions WHERE endpoint = ?", [$endpoint]);

    query("INSERT INTO push_subscriptions(user_id, store_id, endpoint, p256dh, auth, user_agent) VALUES(?,?,?,?,?,?)", [
        (int)$u['id'],
        $storeId,
        $endpoint,
        $p256dh,
        $auth,
        $userAgent
    ]);

    json_response([
        'success' => true,
        'message' => 'Đã đăng ký nhận thông báo đẩy ngầm thành công!'
    ]);
}

if ($action === 'push.unsubscribe') {
    $u = require_auth();
    verify_csrf();
    $d = body();
    $endpoint = trim((string)($d['endpoint'] ?? ''));
    if ($endpoint) {
        query("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?", [$endpoint, (int)$u['id']]);
    }
    json_response([
        'success' => true,
        'message' => 'Đã hủy đăng ký thông báo đẩy'
    ]);
}

if ($action === 'push.test') {
    $u = require_auth();
    verify_csrf();

    $count = webpush_send_notification([
        'id' => time(),
        'title' => '🔔 AKM POS: Test Web Push Thành Công!',
        'message' => 'Hệ thống đã kết nối thông báo ngầm với thiết bị của ' . $u['full_name'] . '. Bạn sẽ nhận được tin nhắn báo đơn ngay cả khi đóng ứng dụng.',
        'severity' => 'SUCCESS',
        'type' => 'SYSTEM',
        'user_id' => (int)$u['id'],
        'link_type' => 'notifications'
    ]);

    json_response([
        'success' => true,
        'sent_devices' => $count,
        'message' => $count > 0 ? "Đã gửi tín hiệu Web Push tới $count thiết bị của bạn thành công!" : "Chưa tìm thấy thiết bị đã đăng ký Web Push. Hãy bấm 'Bật Web Push PWA' trước."
    ]);
}

if ($action === 'push.status') {
    $u = require_auth();
    webpush_ensure_schema();
    $totalSubs = (int)query("SELECT COUNT(*) FROM push_subscriptions")->fetchColumn();
    $userSubs = (int)query("SELECT COUNT(*) FROM push_subscriptions WHERE user_id = ?", [(int)$u['id']])->fetchColumn();

    json_response([
        'total_devices' => $totalSubs,
        'user_devices' => $userSubs,
        'is_subscribed' => $userSubs > 0
    ]);
}

