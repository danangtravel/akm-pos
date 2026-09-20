<?php
if ($action === 'users.list') { require_admin(); json_response(query('SELECT id,full_name,email,phone,role,permissions,is_active,created_at,(SELECT GROUP_CONCAT(store_id) FROM user_stores us WHERE us.user_id=users.id) store_ids FROM users ORDER BY full_name')->fetchAll()); }
if ($action === 'users.save') { require_admin();$d=body();require_fields($d,['full_name','email','role']);db()->beginTransaction();try{if(!empty($d['id'])){$id=(int)$d['id'];$old=query('SELECT id,full_name,email,phone,role,is_active,permissions FROM users WHERE id=?',[$id])->fetch();query('UPDATE users SET full_name=?,email=?,phone=?,role=?,permissions=?,is_active=? WHERE id=?',[trim($d['full_name']),strtolower(trim($d['email'])),$d['phone']??null,$d['role'],json_encode($d['permissions']??new stdClass),(int)($d['is_active']??1),$id]);if(!empty($d['password']))query('UPDATE users SET password=? WHERE id=?',[password_hash($d['password'],PASSWORD_DEFAULT),$id]);}else{require_fields($d,['password']);query('INSERT INTO users(full_name,email,phone,password,role,permissions) VALUES(?,?,?,?,?,?)',[trim($d['full_name']),strtolower(trim($d['email'])),$d['phone']??null,password_hash($d['password'],PASSWORD_DEFAULT),$d['role'],json_encode($d['permissions']??new stdClass)]);$id=(int)db()->lastInsertId();$old=null;}query('DELETE FROM user_stores WHERE user_id=?',[$id]);foreach(array_unique(array_map('intval',$d['store_ids']??[])) as $sid)query('INSERT INTO user_stores(user_id,store_id) VALUES(?,?)',[$id,$sid]);audit('USER_UPDATE','USER',$id,$old,$d);db()->commit();json_response(['id'=>$id]);}catch(Throwable $e){db()->rollBack();throw $e;} }
if ($action === 'users.delete') { $admin=require_admin();$d=body();$id=(int)($d['id']??0);if($id===(int)$admin['id'])fail('Không thể xóa tài khoản đang đăng nhập');$u=query('SELECT * FROM users WHERE id=?',[$id])->fetch();if(!$u)fail('Không tìm thấy tài khoản',404);if($u['role']==='ADMIN'&&(int)query("SELECT COUNT(*) FROM users WHERE role='ADMIN' AND is_active=1")->fetchColumn()<=1)fail('Hệ thống phải còn ít nhất một Admin');query('UPDATE users SET is_active=0 WHERE id=?',[$id]);audit('USER_DELETE','USER',$id,$u,['is_active'=>0]);json_response(true); }
if ($action === 'stores.delete') { require_admin();$d=body();$id=(int)($d['id']??0);$old=query('SELECT * FROM stores WHERE id=?',[$id])->fetch();if(!$old)fail('Không tìm thấy cửa hàng',404);query('UPDATE stores SET is_active=0 WHERE id=?',[$id]);audit('STORE_DELETE','STORE',$id,$old,['is_active'=>0]);json_response(true); }
if ($action === 'sales.search') {
    $ids = allowed_store_ids();
    if (!$ids) json_response([]);
    $store = (int)($_GET['store_id'] ?? 0);
    $q = '%' . trim((string)($_GET['q'] ?? '')) . '%';
    $sort = (string)($_GET['sort'] ?? 'date_desc');
    $orders = ['date_desc'=>'o.created_at DESC','date_asc'=>'o.created_at ASC','amount_desc'=>'o.total_amount DESC','amount_asc'=>'o.total_amount ASC'];
    $order = $orders[$sort] ?? $orders['date_desc'];
    if ($store > 0) {
        assert_store($store);
        $where = 'o.store_id = ?';
        $params = [$store, $q, $q, $q];
    } else {
        $u = current_user();
        if ($u && $u['role'] === 'ADMIN') {
            $where = '1=1';
            $params = [$q, $q, $q];
        } else {
            $where = 'o.store_id IN(' . placeholders(count($ids)) . ')';
            $params = array_merge($ids, [$q, $q, $q]);
        }
    }
    json_response(query('SELECT o.id,o.order_code,o.total_amount,o.status,o.created_at,s.name store_name,s.code store_code,u.full_name FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE ' . $where . ' AND (o.order_code LIKE ? OR u.full_name LIKE ? OR s.name LIKE ?) ORDER BY ' . $order . ' LIMIT 100', $params)->fetchAll());
}
if ($action === 'media.upload') { $u=require_admin();$type=strtoupper(trim((string)($_POST['entity_type']??'')));$id=(int)($_POST['entity_id']??0);if(!in_array($type,['PRODUCT','CATEGORY'],true)||!$id)fail('Đối tượng ảnh không hợp lệ');$table=$type==='PRODUCT'?'products':'categories';if(!query("SELECT id FROM $table WHERE id=?",[$id])->fetchColumn())fail('Không tìm thấy đối tượng',404);if(empty($_FILES['image'])||$_FILES['image']['error']!==UPLOAD_ERR_OK)fail('Upload ảnh thất bại');$tmp=$_FILES['image']['tmp_name'];$mime=(new finfo(FILEINFO_MIME_TYPE))->file($tmp);if(!in_array($mime,['image/jpeg','image/png','image/webp'],true))fail('Chỉ nhận ảnh JPG, PNG hoặc WebP');if(!function_exists('imagecreatefromstring'))fail('Hosting cần bật PHP GD để xử lý ảnh',500);$img=@imagecreatefromstring(file_get_contents($tmp));if(!$img)fail('Ảnh không hợp lệ');$w=imagesx($img);$h=imagesy($img);$size=800;$scale=min(1,$size/max($w,$h));$nw=max(1,(int)($w*$scale));$nh=max(1,(int)($h*$scale));$dst=imagecreatetruecolor($nw,$nh);$white=imagecolorallocate($dst,255,255,255);imagefill($dst,0,0,$white);imagecopyresampled($dst,$img,0,0,0,0,$nw,$nh,$w,$h);imagedestroy($img);$dir='uploads/'.date('Y/m');$abs=dirname(__DIR__,2).'/'.$dir;if(!is_dir($abs)&&!mkdir($abs,0755,true))fail('Không tạo được thư mục ảnh',500);$name=bin2hex(random_bytes(12)).'.jpg';$path=$abs.'/'.$name;imagejpeg($dst,$path,82);imagedestroy($dst);$rel=$dir.'/'.$name;query('DELETE FROM attachments WHERE entity_type=? AND entity_id=?',[$type,$id]);query('INSERT INTO attachments(entity_type,entity_id,file_path,original_name,file_size,mime_type,created_by) VALUES(?,?,?,?,?,"image/jpeg",?)',[$type,$id,$rel,$_FILES['image']['name'],filesize($path),$u['id']]);audit('MEDIA_UPLOAD',$type,$id,null,['path'=>$rel]);json_response(['path'=>$rel]); }
if ($action === 'repairs.list') { $ids=allowed_store_ids();json_response($ids?query('SELECT r.*,s.name store_name,u.full_name technician_name,(SELECT COUNT(*) FROM attachments a WHERE a.entity_type="REPAIR" AND a.entity_id=r.id) image_count FROM repair_cases r JOIN stores s ON s.id=r.store_id LEFT JOIN users u ON u.id=r.technician_id WHERE r.store_id IN('.placeholders(count($ids)).') ORDER BY r.id DESC',$ids)->fetchAll():[]); }
if ($action === 'repairs.save') { $u=require_auth();$d=body();require_fields($d,['store_id','customer_name','customer_phone','device_name','repair_request','received_at']);assert_store((int)$d['store_id']);$fee=max(0,(float)($d['fee']??0));$staffNote=isset($d['staff_note'])?trim((string)$d['staff_note']):(isset($d['note'])?trim((string)$d['note']):null);if(!empty($d['id'])){$old=query('SELECT * FROM repair_cases WHERE id=?',[(int)$d['id']])->fetch();if(!$old)fail('Không tìm thấy phiếu sửa chữa',404);assert_store((int)$old['store_id']);$completed=$d['status']==='COMPLETED'?date('Y-m-d H:i:s'):$old['completed_at'];$returned=$d['status']==='RETURNED'?date('Y-m-d H:i:s'):$old['returned_at'];query('UPDATE repair_cases SET store_id=?,technician_id=?,customer_name=?,customer_phone=?,device_name=?,imei=?,device_condition=?,repair_request=?,staff_note=?,fee=?,status=?,received_at=?,expected_return_at=?,completed_at=?,returned_at=? WHERE id=?',[(int)$d['store_id'],$d['technician_id']?:null,trim($d['customer_name']),trim($d['customer_phone']),trim($d['device_name']),$d['imei']??null,$d['device_condition']??null,$d['repair_request'],$staffNote,$fee,$d['status']??'RECEIVED',$d['received_at'],$d['expected_return_at']?:null,$completed,$returned,(int)$d['id']]);$id=(int)$d['id'];$act='REPAIR_UPDATE';if(($d['status']??'')==='COMPLETED'&&($old['status']??'')!=='COMPLETED'){notify('REPAIR_COMPLETE','Sửa xong: '.$old['device_name'],'Khách '.$old['customer_name'].' · Đã xong, sẵn sàng giao khách','SUCCESS',(int)$d['store_id'],null,'repairs',(string)$id);}}else{$code=code('SC');query('INSERT INTO repair_cases(repair_code,store_id,technician_id,customer_name,customer_phone,device_name,imei,device_condition,repair_request,staff_note,fee,status,received_at,expected_return_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[$code,(int)$d['store_id'],$d['technician_id']?:null,trim($d['customer_name']),trim($d['customer_phone']),trim($d['device_name']),$d['imei']??null,$d['device_condition']??null,$d['repair_request'],$staffNote,$fee,$d['status']??'RECEIVED',$d['received_at'],$d['expected_return_at']?:null]);$id=(int)db()->lastInsertId();$old=null;$act='REPAIR_CREATE';notify('REPAIR_CREATE','Tiếp nhận sửa: '.$d['device_name'],'Khách '.$d['customer_name'].' · Yêu cầu: '.$d['repair_request'],'INFO',(int)$d['store_id'],!empty($d['technician_id'])?(int)$d['technician_id']:null,'repairs',(string)$id);}audit($act,'REPAIR',$id,$old,$d);json_response(['id'=>$id]); }
if ($action === 'repairs.upload') { $u=require_auth();$id=(int)($_POST['repair_id']??0);$r=query('SELECT * FROM repair_cases WHERE id=?',[$id])->fetch();if(!$r)fail('Không tìm thấy phiếu',404);assert_store((int)$r['store_id']);$count=(int)query('SELECT COUNT(*) FROM attachments WHERE entity_type="REPAIR" AND entity_id=?',[$id])->fetchColumn();if($count>=5)fail('Mỗi phiếu tối đa 5 ảnh');if(empty($_FILES['image'])||$_FILES['image']['error']!==UPLOAD_ERR_OK)fail('Upload thất bại');$tmp=$_FILES['image']['tmp_name'];$info=(new finfo(FILEINFO_MIME_TYPE))->file($tmp);if(!in_array($info,['image/jpeg','image/png','image/webp'],true))fail('Chỉ nhận JPG, PNG hoặc WebP');if(!function_exists('imagecreatefromstring'))fail('Hosting cần bật PHP GD để xử lý ảnh',500);$img=@imagecreatefromstring(file_get_contents($tmp));if(!$img)fail('Ảnh không hợp lệ');$w=imagesx($img);$h=imagesy($img);$max=1600;if(max($w,$h)>$max){$scale=$max/max($w,$h);$nw=(int)($w*$scale);$nh=(int)($h*$scale);$dst=imagecreatetruecolor($nw,$nh);imagecopyresampled($dst,$img,0,0,0,0,$nw,$nh,$w,$h);imagedestroy($img);$img=$dst;}$dir='uploads/'.date('Y/m');$abs=dirname(__DIR__,2).'/'.$dir;if(!is_dir($abs))mkdir($abs,0755,true);$name=bin2hex(random_bytes(12)).'.jpg';$path=$abs.'/'.$name;$quality=82;do{imagejpeg($img,$path,$quality);$quality-=8;}while(filesize($path)>400*1024&&$quality>=42);imagedestroy($img);$rel=$dir.'/'.$name;query('INSERT INTO attachments(entity_type,entity_id,file_path,original_name,file_size,mime_type,created_by) VALUES("REPAIR",?,?,?,?,"image/jpeg",?)',[$id,$rel,$_FILES['image']['name'],filesize($path),$u['id']]);json_response(['path'=>$rel,'size'=>filesize($path)]); }
if ($action === 'repairs.detail') { $id=(int)($_GET['id']??0);$r=query('SELECT r.*,s.name store_name,s.address store_address,s.phone store_phone,u.full_name technician_name FROM repair_cases r JOIN stores s ON s.id=r.store_id LEFT JOIN users u ON u.id=r.technician_id WHERE r.id=?',[$id])->fetch();if(!$r)fail('Không tìm thấy phiếu sửa chữa',404);assert_store((int)$r['store_id']);$r['images']=query('SELECT id,file_path,original_name,file_size,created_at FROM attachments WHERE entity_type="REPAIR" AND entity_id=? ORDER BY id ASC',[$id])->fetchAll();json_response($r); }
if ($action === 'inventory.product_stores') { $pid=(int)($_GET['product_id']??0);if(!$pid)fail('Sản phẩm không hợp lệ');$ids=allowed_store_ids();if(!$ids)json_response([]);$rows=query('SELECT s.id store_id,s.code store_code,s.name store_name,COALESCE(i.quantity,0) quantity FROM stores s LEFT JOIN inventories i ON i.store_id=s.id AND i.product_id=? WHERE s.is_active=1 AND s.id IN('.placeholders(count($ids)).') ORDER BY s.code',array_merge([$pid],$ids))->fetchAll();json_response($rows); }
if ($action === 'reports.dashboard') { $ids=allowed_store_ids();if(!$ids)json_response([]);$from=$_GET['from']??date('Y-m-d');$to=$_GET['to']??date('Y-m-d');$store=(int)($_GET['store_id']??0);if($store){assert_store($store);$ids=[$store];}$ph=placeholders(count($ids));$params=array_merge($ids,[$from.' 00:00:00',$to.' 23:59:59']);$sales=query("SELECT COALESCE(SUM(total_amount),0) sales_revenue,COUNT(*) orders FROM orders WHERE status='COMPLETED' AND store_id IN($ph) AND created_at BETWEEN ? AND ?",$params)->fetch();$salesRevenue=(float)($sales['sales_revenue']??0);$ordersCount=(int)($sales['orders']??0);$repairs=query("SELECT COALESCE(SUM(fee),0) repair_revenue,COUNT(*) repairs_completed FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND store_id IN($ph) AND COALESCE(completed_at,created_at) BETWEEN ? AND ?",$params)->fetch();$repairRevenue=(float)($repairs['repair_revenue']??0);$repairsCompleted=(int)($repairs['repairs_completed']??0);$totalRevenue=$salesRevenue+$repairRevenue;$returns=query("SELECT COUNT(*) returns_count,COALESCE(SUM(total_amount),0) returns_total FROM returns WHERE store_id IN($ph) AND created_at BETWEEN ? AND ?",$params)->fetch();$returnsCount=(int)($returns['returns_count']??0);$returnsTotal=(float)($returns['returns_total']??0);$returnsItemsQty=(int)query("SELECT COALESCE(SUM(ri.quantity),0) FROM return_items ri JOIN returns r ON r.id=ri.return_id WHERE r.store_id IN($ph) AND r.created_at BETWEEN ? AND ?",$params)->fetchColumn();$returnsList=query("SELECT r.id,r.return_code,r.created_at,r.reason,r.total_amount,s.name store_name,o.order_code,u.full_name staff_name,(SELECT COUNT(*) FROM return_items ri WHERE ri.return_id=r.id) item_count,(SELECT GROUP_CONCAT(CONCAT(p.name,' (SL: ',ri.quantity,', Tiền: ',REPLACE(FORMAT(ri.amount,0),',','.'),' ₫)') SEPARATOR ' | ') FROM return_items ri JOIN products p ON p.id=ri.product_id WHERE ri.return_id=r.id) items_summary FROM returns r JOIN stores s ON s.id=r.store_id JOIN orders o ON o.id=r.order_id JOIN users u ON u.id=r.created_by WHERE r.store_id IN($ph) AND r.created_at BETWEEN ? AND ? ORDER BY r.id DESC LIMIT 100",$params)->fetchAll();$k=['revenue'=>$totalRevenue,'sales_revenue'=>$salesRevenue,'repair_revenue'=>$repairRevenue,'orders'=>$ordersCount,'repairs_completed'=>$repairsCompleted,'returns'=>$returnsCount,'returns_total'=>$returnsTotal,'returns_items_qty'=>$returnsItemsQty,'returns_list'=>$returnsList];$k['items_sold']=(int)query("SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ?",$params)->fetchColumn();$k['inventory']=(int)query("SELECT COALESCE(SUM(quantity),0) FROM inventories WHERE store_id IN($ph)",$ids)->fetchColumn();$k['repairs_in_progress']=(int)query("SELECT COUNT(*) FROM repair_cases WHERE store_id IN($ph) AND status NOT IN('RETURNED')",$ids)->fetchColumn();$k['pending_transfers']=(int)query("SELECT COUNT(*) FROM stock_transfers WHERE status='REQUESTED' AND (from_store_id IN($ph) OR to_store_id IN($ph))",array_merge($ids,$ids))->fetchColumn();$k['top_products']=query("SELECT oi.product_id,oi.product_name_snapshot name,SUM(oi.quantity) quantity,SUM(oi.total_amount) revenue,(SELECT COALESCE(SUM(i.quantity),0) FROM inventories i WHERE i.product_id=oi.product_id AND i.store_id IN($ph)) stock FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ? GROUP BY oi.product_id,oi.product_name_snapshot ORDER BY quantity DESC LIMIT 10",array_merge($ids,$params))->fetchAll();$k['daily']=query("SELECT DATE(created_at) day,SUM(total_amount) revenue FROM orders WHERE status='COMPLETED' AND store_id IN($ph) AND created_at BETWEEN ? AND ? GROUP BY DATE(created_at) ORDER BY day",$params)->fetchAll();$k['slow_moving']=query("SELECT p.sku,p.name,SUM(i.quantity) quantity,MAX(CASE WHEN sl.movement_type='SALE' THEN sl.created_at END) last_sale FROM inventories i JOIN products p ON p.id=i.product_id LEFT JOIN stock_ledger sl ON sl.store_id=i.store_id AND sl.product_id=i.product_id WHERE i.store_id IN($ph) AND i.quantity>0 GROUP BY p.id,p.sku,p.name HAVING last_sale IS NULL OR last_sale < DATE_SUB(NOW(),INTERVAL 7 DAY) ORDER BY quantity DESC LIMIT 20",$ids)->fetchAll();json_response($k); }
if ($action === 'reports.export') { require_admin();$ids=allowed_store_ids();audit('EXPORT_EXCEL','REPORT',null);header('Content-Type: text/csv; charset=UTF-8');header('Content-Disposition: attachment; filename="akm-pos-report-'.date('Ymd-His').'.csv"');echo "\xEF\xBB\xBF";$out=fopen('php://output','w');fputcsv($out,['Mã hóa đơn','Cửa hàng','Nhân viên','Trạng thái','Tổng tiền','Ngày'],',','"','');$rows=query('SELECT o.order_code,s.name,u.full_name,o.status,o.total_amount,o.created_at FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE o.store_id IN('.placeholders(count($ids)).') ORDER BY o.id DESC',$ids)->fetchAll();foreach($rows as $row)fputcsv($out,array_values($row),',','"','');fclose($out);exit; }
if ($action === 'audit.list') {
    require_admin();
    cleanup_expired_logs(7);
    json_response(query('SELECT a.*,u.full_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 500')->fetchAll());
}

if ($action === 'audit.cleanup') {
    require_admin();
    $res = cleanup_expired_logs(7);
    audit('AUDIT_CLEANUP', 'SYSTEM', null, null, $res, "Dọn dẹp nhật ký hệ thống & mail logs cũ hơn 7 ngày ({$res['audit_logs_deleted']} audit, {$res['mail_logs_deleted']} mail)");
    json_response([
        'success' => true,
        'deleted_audit' => $res['audit_logs_deleted'],
        'deleted_mail' => $res['mail_logs_deleted'],
        'message' => "Đã dọn dẹp thành công {$res['audit_logs_deleted']} bản ghi nhật ký hoạt động và {$res['mail_logs_deleted']} bản ghi gửi mail cũ hơn 7 ngày."
    ]);
}

if ($action === 'mail.logs') {
    require_admin();
    cleanup_expired_logs(7);
    json_response(query('SELECT m.*, u.full_name FROM mail_logs m LEFT JOIN users u ON u.id=m.user_id ORDER BY m.id DESC LIMIT 300')->fetchAll());
}

if ($action === 'settings.get') {
    require_admin();
    $rows = query('SELECT config_key,config_value FROM settings')->fetchAll();
    $r = [];
    foreach ($rows as $x) $r[$x['config_key']] = $x['config_value'];
    json_response($r);
}

if ($action === 'settings.save') {
    require_admin();
    $b = body();
    foreach ($b as $k => $v) {
        query('INSERT INTO settings(config_key,config_value) VALUES(?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)', [$k, is_scalar($v) ? (string)$v : json_encode($v)]);
    }
    audit('SETTINGS_UPDATE', 'SETTINGS', null, null, ['keys' => array_keys($b)], 'Cập nhật thiết lập hệ thống');
    json_response(true);
}

if ($action === 'settings.test_smtp') {
    require_admin();
    $d = body();
    $testTo = trim($d['test_recipient'] ?? '') ?: trim($d['smtp_username'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='daily_report_recipients'")->fetchColumn();
    if (!$testTo || !filter_var($testTo, FILTER_VALIDATE_EMAIL)) {
        fail('Vui lòng nhập một địa chỉ email hợp lệ để nhận thư kiểm tra');
    }

    $dbPass = (string)query("SELECT config_value FROM settings WHERE config_key='smtp_password'")->fetchColumn();
    $inputPass = isset($d['smtp_password']) && trim((string)$d['smtp_password']) !== '' ? (string)$d['smtp_password'] : null;
    $finalPass = $inputPass !== null ? $inputPass : ($dbPass !== '' ? $dbPass : '4Za68_Du%kCc^u+^');

    $smtpConfig = [
        'host' => trim($d['smtp_host'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='smtp_host'")->fetchColumn() ?: 'smtp.tino.vn',
        'port' => (int)($d['smtp_port'] ?? 0) ?: (int)query("SELECT config_value FROM settings WHERE config_key='smtp_port'")->fetchColumn() ?: 587,
        'encryption' => trim($d['smtp_encryption'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='smtp_encryption'")->fetchColumn() ?: 'tls',
        'username' => trim($d['smtp_username'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='smtp_username'")->fetchColumn() ?: 'admin@pnnmedia.vn',
        'password' => $finalPass,
        'from_email' => trim($d['mail_from_email'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='mail_from_email'")->fetchColumn() ?: 'admin@pnnmedia.vn',
        'from_name' => trim($d['mail_from_name'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='mail_from_name'")->fetchColumn() ?: 'AKM POS - Anh Khoa Mobile'
    ];

    if (empty($smtpConfig['host'])) {
        fail('Vui lòng nhập Host SMTP (ví dụ: smtp.tino.vn)');
    }

    require_once dirname(__DIR__, 2) . '/api/core/mailer.php';
    $result = smtp_socket_diagnose($smtpConfig, $testTo);

    audit('SMTP_TEST', 'SETTINGS', null, null, ['host' => $smtpConfig['host'], 'port' => $smtpConfig['port'], 'to' => $testTo, 'success' => $result['ok']], "Kiểm tra kết nối SMTP tới {$smtpConfig['host']}: " . ($result['ok'] ? 'Thành công' : 'Thất bại'));

    json_response($result);
}
if ($action === 'products.import') {
    $u = require_admin();
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Không nhận được file dữ liệu');
    
    $tmpPath = $_FILES['file']['tmp_name'];
    $rawContent = file_get_contents($tmpPath);
    if (!$rawContent || trim($rawContent) === '') fail('File dữ liệu trống');
    
    // Xóa UTF-8 BOM nếu có
    if (str_starts_with($rawContent, "\xEF\xBB\xBF")) {
        $rawContent = substr($rawContent, 3);
    }

    $lines = preg_split('/\r\n|\r|\n/', trim($rawContent));
    if (!$lines || count($lines) < 2) fail('File dữ liệu không chứa dòng dữ liệu nào');

    // Tự động nhận diện dấu phân cách (; hoặc , hoặc \t)
    $firstLine = $lines[0];
    $semiCount = substr_count($firstLine, ';');
    $commaCount = substr_count($firstLine, ',');
    $tabCount = substr_count($firstLine, "\t");
    $delimiter = ',';
    if ($semiCount > $commaCount && $semiCount > $tabCount) $delimiter = ';';
    elseif ($tabCount > $commaCount && $tabCount > $semiCount) $delimiter = "\t";

    $fh = fopen($tmpPath, 'r');
    $rawHeader = fgetcsv($fh, 0, $delimiter);
    if (!$rawHeader) fail('Không đọc được tiêu đề các cột');
    
    // Xóa BOM ở cột đầu nếu còn
    $rawHeader[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', (string)$rawHeader[0]);

    // Chuẩn hóa tên cột
    $colMap = [];
    foreach ($rawHeader as $idx => $col) {
        $c = mb_strtolower(trim((string)$col), 'UTF-8');
        if (in_array($c, ['sku', 'mã hàng', 'ma hang', 'mã sp', 'ma sp', 'mã sản phẩm', 'product code'], true)) $colMap['sku'] = $idx;
        elseif (in_array($c, ['name', 'tên hàng', 'ten hang', 'tên sản phẩm', 'ten san pham', 'product name'], true)) $colMap['name'] = $idx;
        elseif (in_array($c, ['category', 'nhóm hàng', 'nhom hang', 'nhóm hàng(3 cấp)', 'nhóm hàng (3 cấp)', 'danh mục', 'danh muc'], true)) $colMap['category'] = $idx;
        elseif (in_array($c, ['brand', 'thương hiệu', 'thuong hieu', 'hãng', 'nhãn hiệu'], true)) $colMap['brand'] = $idx;
        elseif (in_array($c, ['selling_price', 'giá bán', 'gia ban', 'giá niêm yết', 'đơn giá', 'price'], true)) $colMap['selling_price'] = $idx;
        elseif (in_array($c, ['cost_price', 'giá vốn', 'gia von', 'giá nhập', 'cost'], true)) $colMap['cost_price'] = $idx;
        elseif (in_array($c, ['stock', 'tồn kho', 'ton kho', 'số lượng', 'quantity'], true)) $colMap['stock'] = $idx;
        elseif (in_array($c, ['image_url', 'hình ảnh (url1,url2...)', 'hình ảnh', 'hinh anh', 'ảnh', 'anh', 'image'], true)) $colMap['image_url'] = $idx;
        elseif (in_array($c, ['barcode', 'mã vạch', 'ma vach'], true)) $colMap['barcode'] = $idx;
        elseif (in_array($c, ['description', 'mô tả', 'mo ta', 'ghi chú'], true)) $colMap['description'] = $idx;
        elseif (str_starts_with($c, 'stock_')) $colMap[$c] = $idx;
    }

    if (!isset($colMap['sku']) || !isset($colMap['name'])) {
        fail('File cần có tối thiểu các cột: Mã hàng (SKU) và Tên hàng (Name)');
    }

    $targetStoreId = !empty($_POST['store_id']) ? (int)$_POST['store_id'] : 0;
    if (!$targetStoreId) {
        $allowed = allowed_store_ids();
        $targetStoreId = $allowed[0] ?? (int)query('SELECT id FROM stores WHERE is_active=1 ORDER BY id ASC LIMIT 1')->fetchColumn();
    }

    $parseNumber = function($val): float {
        if ($val === null || $val === '') return 0.0;
        $s = trim((string)$val);
        $s = preg_replace('/[^\d.,-]/', '', $s);
        if ($s === '') return 0.0;
        if (str_contains($s, '.') && str_contains($s, ',')) {
            $lastDot = strrpos($s, '.');
            $lastComma = strrpos($s, ',');
            if ($lastComma > $lastDot) {
                $s = str_replace('.', '', $s);
                $s = str_replace(',', '.', $s);
            } else {
                $s = str_replace(',', '', $s);
            }
        } elseif (str_contains($s, '.')) {
            $parts = explode('.', $s);
            if (count($parts) > 1 && strlen(end($parts)) === 3) {
                $s = str_replace('.', '', $s);
            }
        } elseif (str_contains($s, ',')) {
            $parts = explode(',', $s);
            if (count($parts) > 1 && strlen(end($parts)) === 3) {
                $s = str_replace(',', '', $s);
            } else {
                $s = str_replace(',', '.', $s);
            }
        }
        return (float)$s;
    };

    $formatTitle = function($str): string {
        $str = trim((string)$str);
        if ($str === '') return '';
        return mb_convert_case($str, MB_CASE_TITLE, 'UTF-8');
    };

    $count = 0;
    $errors = [];
    db()->beginTransaction();
    try {
        while (($row = fgetcsv($fh, 0, $delimiter)) !== false) {
            if (!array_filter($row, fn($x) => trim((string)$x) !== '')) continue;
            
            $sku = trim((string)($row[$colMap['sku']] ?? ''));
            $name = trim((string)($row[$colMap['name']] ?? ''));
            if ($sku === '' || $name === '') continue;

            $price = isset($colMap['selling_price']) ? $parseNumber($row[$colMap['selling_price']]) : 0.0;
            $cost = isset($colMap['cost_price']) ? $parseNumber($row[$colMap['cost_price']]) : 0.0;
            $rawBrand = isset($colMap['brand']) ? trim((string)$row[$colMap['brand']]) : '';
            $brand = $rawBrand !== '' ? $formatTitle($rawBrand) : null;
            $barcode = isset($colMap['barcode']) ? trim((string)$row[$colMap['barcode']]) : $sku;
            $desc = isset($colMap['description']) ? trim((string)$row[$colMap['description']]) : null;

            // Xử lý hình ảnh (Lấy link ảnh đầu tiên nếu có nhiều link)
            $imageUrl = null;
            if (isset($colMap['image_url'])) {
                $rawImg = trim((string)$row[$colMap['image_url']]);
                if ($rawImg !== '') {
                    $urls = preg_split('/[\s,;]+/', $rawImg);
                    foreach ($urls as $uStr) {
                        if (str_starts_with($uStr, 'http://') || str_starts_with($uStr, 'https://')) {
                            $imageUrl = $uStr;
                            break;
                        }
                    }
                }
            }

            // Xử lý nhóm sản phẩm (Category)
            $categoryId = null;
            if (isset($colMap['category'])) {
                $rawCat = trim((string)$row[$colMap['category']]);
                if ($rawCat !== '') {
                    $catName = $formatTitle($rawCat);
                    $categoryId = (int)query('SELECT id FROM categories WHERE LOWER(name)=LOWER(?) LIMIT 1', [$catName])->fetchColumn();
                    if (!$categoryId) {
                        query('INSERT INTO categories(name,sort_order,is_active) VALUES(?,10,1)', [$catName]);
                        $categoryId = (int)db()->lastInsertId();
                    }
                }
            }

            // Lưu sản phẩm
            query('INSERT INTO products(category_id,sku,barcode,name,cost_price,selling_price,brand,image_url,description,allow_discount,is_active) 
                   VALUES(?,?,?,?,?,?,?,?,?,1,1) 
                   ON DUPLICATE KEY UPDATE 
                     category_id=COALESCE(VALUES(category_id),category_id),
                     barcode=COALESCE(VALUES(barcode),barcode),
                     name=VALUES(name),
                     cost_price=VALUES(cost_price),
                     selling_price=VALUES(selling_price),
                     brand=COALESCE(VALUES(brand),brand),
                     image_url=COALESCE(VALUES(image_url),image_url),
                     is_active=1', 
                   [$categoryId, $sku, $barcode ?: $sku, $name, $cost, $price, $brand, $imageUrl, $desc]);
            
            $pid = (int)query('SELECT id FROM products WHERE sku=?', [$sku])->fetchColumn();

            // Cập nhật tồn kho theo từng cột chi nhánh hoặc cột tổng tồn kho
            $hasSpecificStockCol = false;
            foreach ($colMap as $key => $idx) {
                if (!str_starts_with($key, 'stock_')) continue;
                $hasSpecificStockCol = true;
                $storeCode = substr($key, 6);
                $sid = (int)query('SELECT id FROM stores WHERE LOWER(code)=LOWER(?)', [$storeCode])->fetchColumn();
                if (!$sid) continue;
                $qty = (int)$parseNumber($row[$idx] ?? 0);
                query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,0) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id)', [$sid, $pid]);
                $before = (int)query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=? FOR UPDATE', [$sid, $pid])->fetchColumn();
                $delta = $qty - $before;
                if ($delta !== 0) {
                    move_stock($sid, $pid, $delta, 'INITIAL_IMPORT', 'IMPORT', null, (int)$u['id'], 'Import CSV');
                }
            }

            if (!$hasSpecificStockCol && isset($colMap['stock']) && $targetStoreId) {
                $qty = (int)$parseNumber($row[$colMap['stock']]);
                query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,0) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id)', [$targetStoreId, $pid]);
                $before = (int)query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=? FOR UPDATE', [$targetStoreId, $pid])->fetchColumn();
                $delta = $qty - $before;
                if ($delta !== 0) {
                    move_stock($targetStoreId, $pid, $delta, 'INITIAL_IMPORT', 'IMPORT', null, (int)$u['id'], 'Import CSV');
                }
            }

            $count++;
        }
        fclose($fh);
        audit('PRODUCT_IMPORT', 'PRODUCT', null, null, ['rows' => $count], "Import thành công $count sản phẩm từ file CSV");
        db()->commit();
        json_response(['imported' => $count, 'message' => "Đã import thành công $count sản phẩm."]);
    } catch (Throwable $e) {
        if (is_resource($fh)) fclose($fh);
        db()->rollBack();
        throw $e;
    }
}

function generate_daily_report_html($date, $totalRevenue, $salesRev, $repairRev, $ordersCount, $repairsCount, $itemsCount, $returnsCount, $lowStock, $topProducts, $payments, $sections = []) {
    $dateFormatted = date('d/m/Y', strtotime($date));
    $secRev = !empty($sections['sec_revenue']);
    $secLow = !empty($sections['sec_low_stock']);
    $secTop = !empty($sections['sec_top_products']);
    $secPay = !empty($sections['sec_payment_methods']);
    $payNames = ['CASH' => 'Tiền mặt', 'BANK_TRANSFER' => 'Chuyển khoản', 'CARD' => 'Thẻ POS'];

    $html = '
    <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px; color: #1e293b; line-height: 1.5;">
      <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 22px; border-radius: 10px; color: #ffffff; text-align: center; margin-bottom: 16px;">
        <h1 style="margin: 0 0 6px; font-size: 20px; font-weight: 700;">AKM POS · Báo Cáo Doanh Số Cuối Ngày</h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.95;">Ngày tổng kết: <strong>'.$dateFormatted.'</strong></p>
      </div>';

    if ($secRev) {
        $html .= '
      <div style="background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
        <h2 style="font-size: 14px; margin: 0 0 12px; color: #0f766e; text-transform: uppercase; font-weight: 700;">1. Doanh thu & Giao dịch</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Tổng doanh thu trong ngày:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 16px; color: #0f766e;">'.number_format($totalRevenue, 0, ',', '.').' ₫</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Doanh thu bán hàng:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">'.number_format($salesRev, 0, ',', '.').' ₫ ('.$ordersCount.' đơn)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Doanh thu sửa chữa:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">'.number_format($repairRev, 0, ',', '.').' ₫ ('.$repairsCount.' máy)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Tổng sản phẩm đã xuất bán:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">'.$itemsCount.' cái</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Số vụ đổi / trả hàng:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: '.($returnsCount > 0 ? '#e11d48' : '#64748b').';">'.$returnsCount.' vụ</td>
          </tr>
        </table>
      </div>';
    }

    if ($secPay && !empty($payments)) {
        $html .= '
      <div style="background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
        <h2 style="font-size: 14px; margin: 0 0 12px; color: #2563eb; text-transform: uppercase; font-weight: 700;">2. Cơ cấu nguồn thanh toán</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
        foreach ($payments as $p) {
            $name = $payNames[$p['method']] ?? $p['method'];
            $html .= '<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">'.$name.'</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">'.number_format((float)$p['amount'], 0, ',', '.').' ₫</td></tr>';
        }
        $html .= '</table></div>';
    }

    if ($secTop && !empty($topProducts)) {
        $html .= '
      <div style="background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
        <h2 style="font-size: 14px; margin: 0 0 12px; color: #0f766e; text-transform: uppercase; font-weight: 700;">3. Top sản phẩm bán chạy</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <tr style="background: #f8fafc; color: #64748b; text-align: left;">
            <th style="padding: 6px 8px;">Sản phẩm</th>
            <th style="padding: 6px 8px; text-align: center;">SL</th>
            <th style="padding: 6px 8px; text-align: right;">Doanh số</th>
          </tr>';
        foreach ($topProducts as $tp) {
            $html .= '<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: 500;">'.htmlspecialchars($tp['name']).'</td><td style="padding: 8px; text-align: center; font-weight: 700; color: #0f766e;">'.$tp['quantity'].'</td><td style="padding: 8px; text-align: right; font-weight: 600;">'.number_format((float)$tp['revenue'], 0, ',', '.').' ₫</td></tr>';
        }
        $html .= '</table></div>';
    }

    if ($secLow && !empty($lowStock)) {
        $html .= '
      <div style="background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #fed7aa; margin-bottom: 14px;">
        <h2 style="font-size: 14px; margin: 0 0 12px; color: #c2410c; text-transform: uppercase; font-weight: 700;">⚠️ Cảnh báo tồn kho sắp hết</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr style="background: #fff7ed; color: #9a3412; text-align: left;">
            <th style="padding: 6px 8px;">Kho</th>
            <th style="padding: 6px 8px;">Sản phẩm</th>
            <th style="padding: 6px 8px; text-align: center;">Tồn</th>
          </tr>';
        foreach ($lowStock as $ls) {
            $html .= '<tr style="border-bottom: 1px solid #ffedd5;"><td style="padding: 6px 8px; color: #64748b;">'.htmlspecialchars($ls['store_name']).'</td><td style="padding: 6px 8px; font-weight: 500;">'.htmlspecialchars($ls['name']).' <small style="color:#94a3b8;">('.htmlspecialchars($ls['sku']).')</small></td><td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #dc2626;">'.$ls['quantity'].'</td></tr>';
        }
        $html .= '</table></div>';
    }

    $html .= '
      <div style="text-align: center; padding: 12px; font-size: 11.5px; color: #94a3b8;">
        Email được gửi tự động từ hệ thống <strong>AKM POS</strong>.<br>
        Cấu hình thời gian gửi và nội dung tại menu <em>Cài đặt &gt; Báo cáo tự động</em>.
      </div>
    </div>';

    return $html;
}

if ($action === 'reports.preview_daily') {
    require_admin();
    $today = date('Y-m-d');
    $ids = allowed_store_ids();
    if (!$ids) $ids = [0];
    $ph = placeholders(count($ids));
    
    $d = body();
    $sections = $d['sections'] ?? ['sec_revenue' => '1', 'sec_low_stock' => '1', 'sec_top_products' => '1', 'sec_payment_methods' => '1', 'sec_shifts' => '1'];
    $params = array_merge($ids, [$today . ' 00:00:00', $today . ' 23:59:59']);
    
    $sales = query("SELECT COALESCE(SUM(total_amount), 0) sales_revenue, COUNT(*) orders FROM orders WHERE status='COMPLETED' AND store_id IN($ph) AND created_at BETWEEN ? AND ?", $params)->fetch();
    $salesRevenue = (float)($sales['sales_revenue'] ?? 0);
    $ordersCount = (int)($sales['orders'] ?? 0);
    
    $repairs = query("SELECT COALESCE(SUM(fee), 0) repair_revenue, COUNT(*) repairs_completed FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND store_id IN($ph) AND COALESCE(completed_at, created_at) BETWEEN ? AND ?", $params)->fetch();
    $repairRevenue = (float)($repairs['repair_revenue'] ?? 0);
    $repairsCompleted = (int)($repairs['repairs_completed'] ?? 0);
    $totalRevenue = $salesRevenue + $repairRevenue;
    
    $itemsSold = (int)query("SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ?", $params)->fetchColumn();
    $returnsCount = (int)query("SELECT COUNT(*) FROM returns WHERE store_id IN($ph) AND created_at BETWEEN ? AND ?", $params)->fetchColumn();
    
    $lowStockThreshold = (int)query("SELECT config_value FROM settings WHERE config_key='low_stock_threshold'")->fetchColumn() ?: 5;
    $lowStock = query("SELECT p.sku, p.name, s.name store_name, i.quantity FROM inventories i JOIN products p ON p.id=i.product_id JOIN stores s ON s.id=i.store_id WHERE i.store_id IN($ph) AND p.is_active=1 AND i.quantity<=? ORDER BY i.quantity ASC LIMIT 10", array_merge($ids, [$lowStockThreshold]))->fetchAll();
    
    $topProducts = query("SELECT oi.product_name_snapshot name, SUM(oi.quantity) quantity, SUM(oi.total_amount) revenue FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ? GROUP BY oi.product_id, oi.product_name_snapshot ORDER BY quantity DESC LIMIT 5", $params)->fetchAll();
    
    $payments = query("SELECT pay.method, SUM(pay.amount) amount FROM payments pay JOIN orders o ON o.id=pay.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ? GROUP BY pay.method", $params)->fetchAll();

    $html = generate_daily_report_html($today, $totalRevenue, $salesRevenue, $repairRevenue, $ordersCount, $repairsCompleted, $itemsSold, $returnsCount, $lowStock, $topProducts, $payments, $sections);

    json_response(['html' => $html, 'date' => $today, 'revenue' => $totalRevenue]);
}

if ($action === 'reports.test_send_daily') {
    require_admin();
    $d = body();
    $to = trim($d['recipients'] ?? '') ?: (string)query("SELECT config_value FROM settings WHERE config_key='daily_report_recipients'")->fetchColumn();
    if (!$to) fail('Vui lòng nhập ít nhất một địa chỉ email nhận báo cáo');
    
    $today = date('Y-m-d');
    $ids = allowed_store_ids();
    if (!$ids) $ids = [0];
    $ph = placeholders(count($ids));
    $params = array_merge($ids, [$today . ' 00:00:00', $today . ' 23:59:59']);
    
    $sales = query("SELECT COALESCE(SUM(total_amount), 0) sales_revenue, COUNT(*) orders FROM orders WHERE status='COMPLETED' AND store_id IN($ph) AND created_at BETWEEN ? AND ?", $params)->fetch();
    $salesRevenue = (float)($sales['sales_revenue'] ?? 0);
    $ordersCount = (int)($sales['orders'] ?? 0);
    $repairs = query("SELECT COALESCE(SUM(fee), 0) repair_revenue, COUNT(*) repairs_completed FROM repair_cases WHERE status IN('COMPLETED','WAITING_PICKUP','RETURNED') AND store_id IN($ph) AND COALESCE(completed_at, created_at) BETWEEN ? AND ?", $params)->fetch();
    $repairRevenue = (float)($repairs['repair_revenue'] ?? 0);
    $repairsCompleted = (int)($repairs['repairs_completed'] ?? 0);
    $totalRevenue = $salesRevenue + $repairRevenue;
    
    $itemsSold = (int)query("SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ?", $params)->fetchColumn();
    $returnsCount = (int)query("SELECT COUNT(*) FROM returns WHERE store_id IN($ph) AND created_at BETWEEN ? AND ?", $params)->fetchColumn();
    $lowStockThreshold = (int)query("SELECT config_value FROM settings WHERE config_key='low_stock_threshold'")->fetchColumn() ?: 5;
    $lowStock = query("SELECT p.sku, p.name, s.name store_name, i.quantity FROM inventories i JOIN products p ON p.id=i.product_id JOIN stores s ON s.id=i.store_id WHERE i.store_id IN($ph) AND p.is_active=1 AND i.quantity<=? ORDER BY i.quantity ASC LIMIT 10", array_merge($ids, [$lowStockThreshold]))->fetchAll();
    $topProducts = query("SELECT oi.product_name_snapshot name, SUM(oi.quantity) quantity, SUM(oi.total_amount) revenue FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ? GROUP BY oi.product_id, oi.product_name_snapshot ORDER BY quantity DESC LIMIT 5", $params)->fetchAll();
    $payments = query("SELECT pay.method, SUM(pay.amount) amount FROM payments pay JOIN orders o ON o.id=pay.order_id WHERE o.status='COMPLETED' AND o.store_id IN($ph) AND o.created_at BETWEEN ? AND ? GROUP BY pay.method", $params)->fetchAll();

    $sections = $d['sections'] ?? ['sec_revenue' => '1', 'sec_low_stock' => '1', 'sec_top_products' => '1', 'sec_payment_methods' => '1'];
    $html = generate_daily_report_html($today, $totalRevenue, $salesRevenue, $repairRevenue, $ordersCount, $repairsCompleted, $itemsSold, $returnsCount, $lowStock, $topProducts, $payments, $sections);

    $subject = 'AKM POS · Báo cáo kinh doanh ngày ' . date('d/m/Y', strtotime($today));
    require_once dirname(__DIR__, 2) . '/api/core/mailer.php';
    $mailRes = send_system_mail($to, $subject, $html);
    $sent = !empty($mailRes['ok']);
    
    audit('REPORT_TEST_SEND', 'REPORT', null, null, ['recipients' => $to, 'sent' => $sent, 'error' => $mailRes['error'] ?? null], "Gửi email báo cáo thử nghiệm tới: $to (" . ($sent ? 'Thành công' : 'Thất bại') . ")");
    
    if (!$sent) {
        fail($mailRes['error'] ?? 'Không thể gửi email báo cáo qua máy chủ SMTP. Vui lòng kiểm tra lại cấu hình SMTP.', 500);
    }
    
    json_response([
        'success' => true,
        'sent' => true,
        'recipients' => $to,
        'message' => $mailRes['message'] ?? "Đã gửi email báo cáo thành công tới $to"
    ]);
}

if ($action === 'export.products') {
    require_admin();
    $storeId = (int)($_GET['store_id'] ?? 0);
    if (!$storeId) {
        fail('Chức năng tải danh mục sản phẩm chỉ hỗ trợ xuất theo từng cửa hàng cụ thể. Vui lòng chọn một chi nhánh để tải.', 400);
    }
    assert_store($storeId);

    $store = query('SELECT * FROM stores WHERE id=?', [$storeId])->fetch();
    if (!$store) {
        fail('Không tìm thấy thông tin cửa hàng', 404);
    }

    audit('EXPORT_PRODUCTS', 'PRODUCT', null, null, ['store_id' => $storeId, 'store_name' => $store['name']], "Xuất file danh mục sản phẩm chi nhánh: {$store['name']}");

    $rows = query("
        SELECT 
            p.id product_id,
            p.name product_name,
            COALESCE(c.name, 'Chưa phân nhóm') category_name,
            COALESCE(c.sort_order, 999) category_sort,
            COALESCE(p.brand, '') brand,
            COALESCE(i.quantity, 0) quantity,
            p.cost_price,
            p.selling_price,
            (COALESCE(i.quantity, 0) * p.cost_price) total_cost_value,
            (COALESCE(i.quantity, 0) * p.selling_price) total_selling_value,
            (SELECT MAX(sl.created_at) FROM stock_ledger sl WHERE sl.store_id=? AND sl.product_id=p.id AND sl.movement_type='SALE') last_sale,
            p.is_active,
            p.created_at
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN inventories i ON i.product_id = p.id AND i.store_id = ?
        ORDER BY COALESCE(c.sort_order, 999) ASC, COALESCE(c.name, 'Chưa phân nhóm') ASC, p.name ASC
    ", [$storeId, $storeId])->fetchAll();

    $format = strtolower(trim((string)($_GET['format'] ?? 'excel')));
    $storeCodeSlug = preg_replace('/[^a-zA-Z0-9_-]/', '_', $store['code'] ?: 'CH' . $storeId);
    $dateStr = date('Ymd_His');

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="AKM_POS_DanhMuc_SP_' . $storeCodeSlug . '_' . $dateStr . '.csv"');
        echo "\xEF\xBB\xBF";
        $out = fopen('php://output', 'w');
        fputcsv($out, [
            'STT',
            'Chi nhánh',
            'Mã chi nhánh',
            'Nhóm sản phẩm',
            'Tên sản phẩm',
            'Thương hiệu',
            'Số lượng tồn',
            'Giá vốn (VNĐ)',
            'Giá bán niêm yết (VNĐ)',
            'Tổng giá trị vốn (VNĐ)',
            'Tổng giá trị bán (VNĐ)',
            'Bán gần nhất',
            'Trạng thái tồn kho',
            'Trạng thái kinh doanh',
            'Ngày tạo'
        ], ',', '"', '');

        $stt = 1;
        foreach ($rows as $r) {
            $qty = (int)$r['quantity'];
            $lastSale = $r['last_sale'];
            $isSlow = $qty > 0 && (!$lastSale || strtotime($lastSale) < strtotime('-7 days'));
            $statusStock = $qty <= 0 ? 'Hết hàng' : ($qty <= 5 ? "Sắp hết ($qty)" : ($isSlow ? 'Chậm bán (>7 ngày)' : 'Ổn định'));
            $statusBiz = +$r['is_active'] ? 'Đang bán' : 'Ngừng bán';

            fputcsv($out, [
                $stt++,
                $store['name'],
                $store['code'],
                $r['category_name'],
                $r['product_name'],
                $r['brand'] ?: '—',
                $qty,
                (float)$r['cost_price'],
                (float)$r['selling_price'],
                (float)$r['total_cost_value'],
                (float)$r['total_selling_value'],
                $lastSale ? date('d/m/Y H:i', strtotime($lastSale)) : 'Chưa bán',
                $statusStock,
                $statusBiz,
                date('d/m/Y H:i', strtotime($r['created_at']))
            ], ',', '"', '');
        }
        fclose($out);
        exit;
    }

    // Default: Native Excel Spreadsheet (.xls) with rich table styling, category grouping and subtotals
    header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
    header('Content-Disposition: attachment; filename="AKM_POS_DanhMuc_SP_' . $storeCodeSlug . '_' . $dateStr . '.xls"');
    header('Cache-Control: max-age=0');
    header('Pragma: public');

    $totalQty = 0;
    $totalCost = 0;
    $totalSelling = 0;
    foreach ($rows as $r) {
        $totalQty += (int)$r['quantity'];
        $totalCost += (float)$r['total_cost_value'];
        $totalSelling += (float)$r['total_selling_value'];
    }

    echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    echo '<head>';
    echo '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
    echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Danh mục sản phẩm</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    echo '<style>';
    echo 'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #1e293b; }';
    echo 'table { border-collapse: collapse; width: 100%; margin-top: 10px; }';
    echo 'th { background-color: #0f766e; color: #ffffff; font-weight: bold; padding: 10px 8px; border: 1px solid #0d655e; text-align: center; vertical-align: middle; }';
    echo 'td { padding: 7px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }';
    echo '.title { font-size: 16pt; font-weight: bold; color: #0f766e; text-align: center; }';
    echo '.subtitle { font-size: 11pt; color: #475569; text-align: center; font-style: italic; }';
    echo '.meta-box { font-size: 10pt; color: #334155; margin-bottom: 8px; }';
    echo '.text-center { text-align: center; }';
    echo '.text-left { text-align: left; }';
    echo '.text-right { text-align: right; }';
    echo '.num { mso-number-format: "#,##0"; text-align: right; }';
    echo '.currency { mso-number-format: "#,##0\\ \"₫\""; text-align: right; font-weight: 600; }';
    echo '.cat-row { background-color: #f0fdfa; font-weight: bold; color: #0f766e; font-size: 11pt; border-top: 2px solid #0f766e; }';
    echo '.sum-row { background-color: #e2e8f0; font-weight: bold; color: #0f172a; border-top: 2px solid #64748b; }';
    echo '.badge-stable { color: #16a34a; font-weight: bold; }';
    echo '.badge-low { color: #d97706; font-weight: bold; }';
    echo '.badge-out { color: #dc2626; font-weight: bold; }';
    echo '.badge-slow { color: #4f46e5; font-weight: bold; }';
    echo '</style>';
    echo '</head>';
    echo '<body>';

    echo '<table>';
    echo '<tr><td colspan="14" class="title" style="border:none;padding:12px 0 4px 0;">BÁO CÁO DANH MỤC SẢN PHẨM &amp; TỒN KHO CHI NHÁNH</td></tr>';
    echo '<tr><td colspan="14" class="subtitle" style="border:none;padding:0 0 12px 0;">Hệ thống Quản lý Bán hàng AKM POS</td></tr>';
    echo '<tr><td colspan="7" class="meta-box" style="border:none;"><b>Chi nhánh:</b> ' . htmlspecialchars($store['name']) . ' (' . htmlspecialchars($store['code']) . ')</td><td colspan="7" class="meta-box text-right" style="border:none;"><b>Ngày xuất báo cáo:</b> ' . date('d/m/Y H:i:s') . '</td></tr>';
    echo '<tr><td colspan="7" class="meta-box" style="border:none;"><b>Địa chỉ:</b> ' . htmlspecialchars($store['address'] ?: 'Chưa cập nhật') . ' · <b>SĐT:</b> ' . htmlspecialchars($store['phone'] ?: '—') . '</td><td colspan="7" class="meta-box text-right" style="border:none;"><b>Tổng số mặt hàng:</b> ' . count($rows) . ' sản phẩm</td></tr>';
    echo '</table>';

    echo '<table>';
    echo '<thead>';
    echo '<tr>';
    echo '<th style="width:45px;">STT</th>';
    echo '<th style="width:140px;">Nhóm sản phẩm</th>';
    echo '<th style="width:240px;">Tên sản phẩm</th>';
    echo '<th style="width:100px;">Thương hiệu</th>';
    echo '<th style="width:80px;">Tồn kho</th>';
    echo '<th style="width:110px;">Giá vốn</th>';
    echo '<th style="width:120px;">Giá bán niêm yết</th>';
    echo '<th style="width:130px;">Tổng giá trị vốn</th>';
    echo '<th style="width:130px;">Tổng giá trị bán</th>';
    echo '<th style="width:120px;">Bán gần nhất</th>';
    echo '<th style="width:110px;">Trạng thái tồn</th>';
    echo '<th style="width:110px;">Kinh doanh</th>';
    echo '<th style="width:120px;">Chi nhánh</th>';
    echo '<th style="width:120px;">Ngày tạo</th>';
    echo '</tr>';
    echo '</thead>';
    echo '<tbody>';

    $currentCat = null;
    $stt = 1;
    $catQty = 0;
    $catCost = 0;
    $catSelling = 0;
    $catCount = 0;

    foreach ($rows as $r) {
        if ($currentCat !== $r['category_name']) {
            if ($currentCat !== null) {
                echo '<tr style="background-color:#f8fafc;font-weight:bold;">';
                echo '<td colspan="4" class="text-right" style="color:#0f766e;">Tổng nhóm [' . htmlspecialchars($currentCat) . '] (' . $catCount . ' SP):</td>';
                echo '<td class="num" style="color:#0f766e;">' . $catQty . '</td>';
                echo '<td></td>';
                echo '<td></td>';
                echo '<td class="currency" style="color:#0f766e;">' . number_format($catCost, 0, ',', '.') . ' ₫</td>';
                echo '<td class="currency" style="color:#0f766e;">' . number_format($catSelling, 0, ',', '.') . ' ₫</td>';
                echo '<td colspan="5"></td>';
                echo '</tr>';
            }
            $currentCat = $r['category_name'];
            $catQty = 0;
            $catCost = 0;
            $catSelling = 0;
            $catCount = 0;

            echo '<tr class="cat-row">';
            echo '<td colspan="14" style="padding:8px 10px;">📁 NHÓM HÀNG: <b>' . htmlspecialchars($currentCat) . '</b></td>';
            echo '</tr>';
        }

        $qty = (int)$r['quantity'];
        $costVal = (float)$r['total_cost_value'];
        $sellVal = (float)$r['total_selling_value'];
        $catQty += $qty;
        $catCost += $costVal;
        $catSelling += $sellVal;
        $catCount++;

        $lastSale = $r['last_sale'];
        $isSlow = $qty > 0 && (!$lastSale || strtotime($lastSale) < strtotime('-7 days'));
        $statusClass = $qty <= 0 ? 'badge-out' : ($qty <= 5 ? 'badge-low' : ($isSlow ? 'badge-slow' : 'badge-stable'));
        $statusText = $qty <= 0 ? 'Hết hàng' : ($qty <= 5 ? "Sắp hết ($qty)" : ($isSlow ? 'Chậm bán (>7 ngày)' : 'Ổn định'));

        echo '<tr>';
        echo '<td class="text-center">' . ($stt++) . '</td>';
        echo '<td>' . htmlspecialchars($r['category_name']) . '</td>';
        echo '<td><b>' . htmlspecialchars($r['product_name']) . '</b></td>';
        echo '<td class="text-center">' . htmlspecialchars($r['brand'] ?: '—') . '</td>';
        echo '<td class="num"><b>' . $qty . '</b></td>';
        echo '<td class="currency">' . number_format((float)$r['cost_price'], 0, ',', '.') . ' ₫</td>';
        echo '<td class="currency" style="color:#0f766e;">' . number_format((float)$r['selling_price'], 0, ',', '.') . ' ₫</td>';
        echo '<td class="currency">' . number_format($costVal, 0, ',', '.') . ' ₫</td>';
        echo '<td class="currency">' . number_format($sellVal, 0, ',', '.') . ' ₫</td>';
        echo '<td class="text-center">' . ($lastSale ? date('d/m/Y H:i', strtotime($lastSale)) : '—') . '</td>';
        echo '<td class="text-center ' . $statusClass . '">' . htmlspecialchars($statusText) . '</td>';
        echo '<td class="text-center">' . (+$r['is_active'] ? '<span style="color:#16a34a;">Đang bán</span>' : '<span style="color:#94a3b8;">Ngừng bán</span>') . '</td>';
        echo '<td>' . htmlspecialchars($store['name']) . '</td>';
        echo '<td class="text-center">' . date('d/m/Y H:i', strtotime($r['created_at'])) . '</td>';
        echo '</tr>';
    }

    if ($currentCat !== null) {
        echo '<tr style="background-color:#f8fafc;font-weight:bold;">';
        echo '<td colspan="4" class="text-right" style="color:#0f766e;">Tổng nhóm [' . htmlspecialchars($currentCat) . '] (' . $catCount . ' SP):</td>';
        echo '<td class="num" style="color:#0f766e;">' . $catQty . '</td>';
        echo '<td></td>';
        echo '<td></td>';
        echo '<td class="currency" style="color:#0f766e;">' . number_format($catCost, 0, ',', '.') . ' ₫</td>';
        echo '<td class="currency" style="color:#0f766e;">' . number_format($catSelling, 0, ',', '.') . ' ₫</td>';
        echo '<td colspan="5"></td>';
        echo '</tr>';
    }

    echo '<tr class="sum-row">';
    echo '<td colspan="4" class="text-right" style="font-size:12pt;">TỔNG CỘNG TOÀN CHI NHÁNH (' . count($rows) . ' SP):</td>';
    echo '<td class="num" style="font-size:12pt;color:#0f766e;">' . $totalQty . '</td>';
    echo '<td></td>';
    echo '<td></td>';
    echo '<td class="currency" style="font-size:12pt;color:#b91c1c;">' . number_format($totalCost, 0, ',', '.') . ' ₫</td>';
    echo '<td class="currency" style="font-size:12pt;color:#0f766e;">' . number_format($totalSelling, 0, ',', '.') . ' ₫</td>';
    echo '<td colspan="5"></td>';
    echo '</tr>';

    echo '</tbody>';
    echo '</table>';
    echo '</body>';
    echo '</html>';
    exit;
}

if ($action === 'export.inventory') {
    require_admin();
    $ids = allowed_store_ids();
    audit('EXPORT_INVENTORY', 'INVENTORY', null);
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="akm-ton-kho-'.date('Ymd-His').'.csv"');
    echo "\xEF\xBB\xBF";
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Chi nhánh', 'Mã chi nhánh', 'Tên sản phẩm', 'Danh mục', 'Tồn kho thực tế', 'Giá vốn', 'Thành tiền giá vốn'], ',', '"', '');
    $rows = query('SELECT s.name store_name, s.code store_code, p.name product_name, COALESCE(c.name, "") cat_name, COALESCE(i.quantity, 0) quantity, p.cost_price, (COALESCE(i.quantity, 0) * p.cost_price) total_cost FROM stores s CROSS JOIN products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN inventories i ON i.store_id=s.id AND i.product_id=p.id WHERE s.is_active=1 AND p.is_active=1 AND s.id IN('.placeholders(count($ids)).') ORDER BY s.code, p.name', $ids)->fetchAll();
    foreach ($rows as $r) fputcsv($out, array_values($r), ',', '"', '');
    fclose($out);
    exit;
}

if ($action === 'export.orders') {
    require_admin();
    $ids = allowed_store_ids();
    audit('EXPORT_ORDERS', 'ORDER', null);
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="akm-hoa-don-'.date('Ymd-His').'.csv"');
    echo "\xEF\xBB\xBF";
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Mã hóa đơn', 'Chi nhánh', 'Thu ngân', 'Khách hàng', 'SĐT khách', 'Tổng tiền', 'Giảm giá', 'Khách trả', 'Trạng thái', 'Ngày tạo'], ',', '"', '');
    $rows = query('SELECT o.order_code, s.name store_name, u.full_name staff_name, o.customer_name, o.customer_phone, o.total_amount, o.discount_amount, o.paid_amount, o.status, o.created_at FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE o.store_id IN('.placeholders(count($ids)).') ORDER BY o.id DESC', $ids)->fetchAll();
    foreach ($rows as $r) fputcsv($out, array_values($r), ',', '"', '');
    fclose($out);
    exit;
}

if ($action === 'export.backup_sql') {
    require_admin();
    audit('EXPORT_BACKUP_SQL', 'DATABASE', null);
    header('Content-Type: application/sql; charset=UTF-8');
    header('Content-Disposition: attachment; filename="akm_pos_backup_'.date('Ymd_His').'.sql"');
    echo "-- AKM POS Database Full Backup\n";
    echo "-- Exported at: " . date('Y-m-d H:i:s') . "\n";
    echo "-- Host: " . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\n";
    echo "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n";
    
    $tables = query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $t) {
        $create = query("SHOW CREATE TABLE `$t`")->fetch(PDO::FETCH_ASSOC);
        echo "-- Structure for `$t`\n";
        echo "DROP TABLE IF EXISTS `$t`;\n";
        echo ($create['Create Table'] ?? '') . ";\n\n";
        
        $rows = query("SELECT * FROM `$t`")->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            echo "-- Data for `$t` (" . count($rows) . " rows)\n";
            foreach (array_chunk($rows, 50) as $chunk) {
                $cols = array_map(fn($c) => "`$c`", array_keys($chunk[0]));
                $valuesList = [];
                foreach ($chunk as $row) {
                    $vals = array_map(function($v) {
                        if ($v === null) return 'NULL';
                        return db()->quote($v);
                    }, array_values($row));
                    $valuesList[] = '(' . implode(',', $vals) . ')';
                }
                echo "INSERT INTO `$t` (" . implode(',', $cols) . ") VALUES\n" . implode(",\n", $valuesList) . ";\n";
            }
            echo "\n";
        }
    }
    echo "SET FOREIGN_KEY_CHECKS = 1;\n-- Backup Completed.\n";
    exit;
}

if ($action === 'system.restore_backup') {
    $u = require_admin();
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Không nhận được file sao lưu SQL');
    $sqlContent = file_get_contents($_FILES['file']['tmp_name']);
    if (!$sqlContent || trim($sqlContent) === '') fail('File sao lưu rỗng');
    
    db()->beginTransaction();
    try {
        db()->exec("SET FOREIGN_KEY_CHECKS = 0;");
        db()->exec($sqlContent);
        db()->exec("SET FOREIGN_KEY_CHECKS = 1;");
        audit('SYSTEM_RESTORE', 'DATABASE', null, null, ['file' => $_FILES['file']['name']], "Phục hồi cơ sở dữ liệu từ file: " . $_FILES['file']['name']);
        db()->commit();
        json_response(['success' => true, 'message' => 'Đã phục hồi dữ liệu thành công từ bản sao lưu SQL!']);
    } catch (Throwable $e) {
        db()->rollBack();
        throw $e;
    }
}

