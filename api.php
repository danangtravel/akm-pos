<?php
require __DIR__ . '/api/core/boot.php';

$action = $_GET['action'] ?? '';
try {
    if ($action === 'auth.login') {
        $d=body(); require_fields($d,['email','password']);
        $u=query('SELECT * FROM users WHERE email=? AND is_active=1',[strtolower(trim($d['email']))])->fetch();
        if(!$u || !password_verify($d['password'],$u['password'])) fail('Email hoặc mật khẩu không đúng',401);
        session_regenerate_id(true);
        $_SESSION['user_id']=$u['id'];
        csrf_token();
        issue_remember_token((int)$u['id']);
        audit('LOGIN','USER',(int)$u['id'],null,null,'Đăng nhập');
        json_response(['user'=>current_user(),'csrf'=>csrf_token()]);
    }
    if ($action === 'auth.logout') {
        require_auth();
        verify_csrf();
        revoke_remember_token();
        if (session_status() === PHP_SESSION_ACTIVE) @session_destroy();
        json_response(true);
    }
    if ($action === 'auth.me') json_response(['user'=>require_auth(),'csrf'=>csrf_token()]);
    require_auth(); verify_csrf();

    if ($action === 'bootstrap') {
        $ids=allowed_store_ids(); $stores=$ids?query('SELECT * FROM stores WHERE id IN('.placeholders(count($ids)).') ORDER BY code',$ids)->fetchAll():[];
        json_response(['user'=>current_user(),'csrf'=>csrf_token(),'stores'=>$stores]);
    }
    if ($action === 'stores.list') { json_response(query('SELECT * FROM stores WHERE is_active=1 ORDER BY code')->fetchAll()); }
    if ($action === 'stores.save') { require_admin(); $d=body(); require_fields($d,['code','name']); if(!empty($d['id'])) { query('UPDATE stores SET code=?,name=?,address=?,phone=?,is_active=? WHERE id=?',[trim($d['code']),trim($d['name']),$d['address']??null,$d['phone']??null,(int)($d['is_active']??1),(int)$d['id']]); $id=(int)$d['id']; } else { query('INSERT INTO stores(code,name,address,phone) VALUES(?,?,?,?)',[trim($d['code']),trim($d['name']),$d['address']??null,$d['phone']??null]); $id=(int)db()->lastInsertId(); } audit('STORE_SAVE','STORE',$id,null,$d); json_response(['id'=>$id]); }
    if ($action === 'categories.list') json_response(query("SELECT c.*,(SELECT a.file_path FROM attachments a WHERE a.entity_type='CATEGORY' AND a.entity_id=c.id ORDER BY a.id DESC LIMIT 1) image_path FROM categories c ORDER BY c.sort_order,c.name")->fetchAll());
    if ($action === 'categories.save') { require_admin();$d=body();require_fields($d,['name']);$parent=!empty($d['parent_id'])?(int)$d['parent_id']:null;if(!empty($d['id'])&&(int)$d['id']===$parent)fail('Nhóm sản phẩm không thể là nhóm cha của chính nó');if(!empty($d['id'])){$id=(int)$d['id'];query('UPDATE categories SET parent_id=?,name=?,sort_order=?,is_active=? WHERE id=?',[$parent,trim($d['name']),(int)($d['sort_order']??0),(int)($d['is_active']??1),$id]);}else{query('INSERT INTO categories(parent_id,name,sort_order,is_active) VALUES(?,?,?,?)',[$parent,trim($d['name']),(int)($d['sort_order']??0),(int)($d['is_active']??1)]);$id=(int)db()->lastInsertId();}audit('CATEGORY_SAVE','CATEGORY',$id,null,$d);json_response(['id'=>$id]); }
    if ($action === 'categories.delete') { require_admin();$d=body();$id=(int)($d['id']??0);if(!$id)fail('Nhóm sản phẩm không hợp lệ');$used=(int)query('SELECT COUNT(*) FROM products WHERE category_id=?',[$id])->fetchColumn();$children=(int)query('SELECT COUNT(*) FROM categories WHERE parent_id=?',[$id])->fetchColumn();if($used||$children)fail($used?'Không thể xóa nhóm đang có sản phẩm':'Hãy xóa hoặc chuyển các nhóm con trước');$old=query('SELECT * FROM categories WHERE id=?',[$id])->fetch();if(!$old)fail('Không tìm thấy nhóm sản phẩm',404);query('DELETE FROM categories WHERE id=?',[$id]);audit('CATEGORY_DELETE','CATEGORY',$id,$old,null);json_response(true); }
    if ($action === 'products.list') {
        [$limit,$offset]=page_params(); $term='%'.trim($_GET['q']??'').'%' ; $store=(int)($_GET['store_id']??0); if($store) assert_store($store);
        $cat=(int)($_GET['category_id']??0);
        $brand=trim((string)($_GET['brand']??''));
        $all=!empty($_GET['all']);
        $where=$all ? '(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.brand LIKE ?)' : 'p.is_active=1 AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.brand LIKE ?)';
        if($cat) $where .= ' AND p.category_id=' . $cat;
        if($brand !== '') $where .= ' AND p.brand=' . db()->quote($brand);
        $sortOrder = 'p.name ASC';
        $sort = $_GET['sort'] ?? '';
        if ($sort === 'name_desc') $sortOrder = 'p.name DESC';
        elseif ($sort === 'price_asc') $sortOrder = 'p.selling_price ASC';
        elseif ($sort === 'price_desc') $sortOrder = 'p.selling_price DESC';
        elseif ($sort === 'cost_asc') $sortOrder = 'p.cost_price ASC';
        elseif ($sort === 'cost_desc') $sortOrder = 'p.cost_price DESC';
        elseif ($sort === 'stock_desc') $sortOrder = 'quantity DESC, p.name ASC';
        elseif ($sort === 'stock_asc') $sortOrder = 'quantity ASC, p.name ASC';
        elseif ($sort === 'date_desc') $sortOrder = 'p.created_at DESC, p.id DESC';
        elseif ($sort === 'date_asc') $sortOrder = 'p.created_at ASC, p.id ASC';

        if ($store) {
            $sql="SELECT p.*,c.name category_name,COALESCE(NULLIF(p.image_url,''),(SELECT a.file_path FROM attachments a WHERE a.entity_type='PRODUCT' AND a.entity_id=p.id ORDER BY a.id DESC LIMIT 1)) image_path,COALESCE(i.quantity,0) quantity FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN inventories i ON i.product_id=p.id AND i.store_id=? WHERE $where ORDER BY $sortOrder LIMIT ? OFFSET ?";
            $params=[$store,$term,$term,$term,$term,$limit,$offset];
        } else {
            $allowedIds = allowed_store_ids();
            $subPh = $allowedIds ? placeholders(count($allowedIds)) : '0';
            $sql="SELECT p.*,c.name category_name,COALESCE(NULLIF(p.image_url,''),(SELECT a.file_path FROM attachments a WHERE a.entity_type='PRODUCT' AND a.entity_id=p.id ORDER BY a.id DESC LIMIT 1)) image_path,(SELECT COALESCE(SUM(i.quantity),0) FROM inventories i WHERE i.product_id=p.id AND i.store_id IN($subPh)) quantity FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE $where ORDER BY $sortOrder LIMIT ? OFFSET ?";
            $params=array_merge($allowedIds, [$term,$term,$term,$term,$limit,$offset]);
        }
        json_response(query($sql,$params)->fetchAll());
    }
    if ($action === 'products.save') {
        $u=require_admin(); $d=body(); require_fields($d,['name','selling_price']);
        $cost=max(0,(float)($d['cost_price']??0));
        $price=max(0,(float)$d['selling_price']);
        $brand=trim((string)($d['brand']??''))?:null;
        $img=trim((string)($d['image_url']??''))?:null;
        $sku=trim((string)($d['sku']??''));
        $barcode=trim((string)($d['barcode']??''))?:null;
        $qty=isset($d['quantity'])?max(0,(int)$d['quantity']):0;
        $store=(int)($d['store_id']??0);
        if (!$store) { $allowed=allowed_store_ids(); $store=$allowed[0]??1; }

        if(!empty($d['id'])) {
            $id=(int)$d['id'];
            $old=query('SELECT * FROM products WHERE id=?',[$id])->fetch();
            if(!$old) fail('Không tìm thấy sản phẩm',404);
            if ($sku === '') $sku = $old['sku'] ?: ('SP' . str_pad((string)$id, 6, '0', STR_PAD_LEFT));
            query('UPDATE products SET category_id=?,sku=?,barcode=?,name=?,cost_price=?,selling_price=?,brand=?,image_url=?,description=?,allow_discount=?,is_active=? WHERE id=?',[$d['category_id']?:null,$sku,$barcode,trim($d['name']),$cost,$price,$brand,$img,$d['description']??null,(int)($d['allow_discount']??1),(int)($d['is_active']??1),$id]);
            if (isset($d['quantity']) && $store > 0) {
                query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,0) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id)',[$store,$id]);
                $oldQty=(int)query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=?',[$store,$id])->fetchColumn();
                if ($qty !== $oldQty) {
                    move_stock($store,$id,$qty-$oldQty,'MANUAL_ADJUSTMENT','PRODUCT',$id,(int)$u['id'],'Cập nhật số lượng tồn kho sản phẩm');
                }
            }
            $act='PRODUCT_UPDATE';
        } else {
            if ($sku === '') {
                $sku = 'SP' . date('ymd') . mt_rand(1000, 9999);
                while ((int)query('SELECT COUNT(*) FROM products WHERE sku=?', [$sku])->fetchColumn() > 0) {
                    $sku = 'SP' . date('ymd') . mt_rand(1000, 9999);
                }
            }
            query('INSERT INTO products(category_id,sku,barcode,name,cost_price,selling_price,brand,image_url,description,allow_discount) VALUES(?,?,?,?,?,?,?,?,?,?)',[$d['category_id']?:null,$sku,$barcode,trim($d['name']),$cost,$price,$brand,$img,$d['description']??null,(int)($d['allow_discount']??1)]);
            $id=(int)db()->lastInsertId();
            if ($store > 0) {
                query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,?) ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)',[$store,$id,$qty]);
                if ($qty > 0) {
                    move_stock($store,$id,$qty,'INITIAL_IMPORT','PRODUCT',$id,(int)$u['id'],'Nhập số lượng tồn kho ban đầu');
                }
            }
            $act='PRODUCT_CREATE';
        }
        audit($act,'PRODUCT',$id,null,$d);
        json_response(['id'=>$id,'sku'=>$sku]);
    }
    if ($action === 'products.delete') { require_admin();$d=body();$id=(int)($d['id']??0);$old=query('SELECT * FROM products WHERE id=?',[$id])->fetch();if(!$old)fail('Không tìm thấy sản phẩm',404);query('UPDATE products SET is_active=0 WHERE id=?',[$id]);audit('PRODUCT_DELETE','PRODUCT',$id,$old,['is_active'=>0]);json_response(true); }
    if ($action === 'inventory.list') {
        $store = (int)($_GET['store_id'] ?? 0);
        $q = '%' . trim($_GET['q'] ?? '') . '%';
        if ($store > 0) {
            assert_store($store);
            $sql = 'SELECT p.id product_id, p.sku, p.name, p.selling_price, c.name category_name, COALESCE(i.quantity,0) quantity, i.updated_at, (SELECT MAX(sl.created_at) FROM stock_ledger sl WHERE sl.store_id=? AND sl.product_id=p.id AND sl.movement_type="SALE") last_sale FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN inventories i ON i.product_id=p.id AND i.store_id=? WHERE p.is_active=1 AND (p.name LIKE ? OR p.sku LIKE ?) ORDER BY p.name';
            $params = [$store, $store, $q, $q];
        } else {
            $allowedIds = allowed_store_ids();
            $subPh = $allowedIds ? placeholders(count($allowedIds)) : '0';
            $sql = "SELECT p.id product_id, p.sku, p.name, p.selling_price, c.name category_name, (SELECT COALESCE(SUM(i.quantity),0) FROM inventories i WHERE i.product_id=p.id AND i.store_id IN($subPh)) quantity, (SELECT MAX(i.updated_at) FROM inventories i WHERE i.product_id=p.id AND i.store_id IN($subPh)) updated_at, (SELECT MAX(sl.created_at) FROM stock_ledger sl WHERE sl.product_id=p.id AND sl.movement_type='SALE' AND sl.store_id IN($subPh)) last_sale FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 AND (p.name LIKE ? OR p.sku LIKE ?) ORDER BY p.name";
            $params = array_merge($allowedIds, $allowedIds, $allowedIds, [$q, $q]);
        }
        json_response(query($sql, $params)->fetchAll());
    }
    if ($action === 'inventory.ledger') {
        $store = (int)($_GET['store_id'] ?? 0);
        if ($store > 0) {
            assert_store($store);
            $sql = 'SELECT l.*, p.sku, p.name, u.full_name, s.name store_name FROM stock_ledger l JOIN products p ON p.id=l.product_id JOIN users u ON u.id=l.created_by LEFT JOIN stores s ON s.id=l.store_id WHERE l.store_id=? ORDER BY l.id DESC LIMIT 200';
            $params = [$store];
        } else {
            $allowedIds = allowed_store_ids();
            $subPh = $allowedIds ? placeholders(count($allowedIds)) : '0';
            $sql = "SELECT l.*, p.sku, p.name, u.full_name, s.name store_name FROM stock_ledger l JOIN products p ON p.id=l.product_id JOIN users u ON u.id=l.created_by LEFT JOIN stores s ON s.id=l.store_id WHERE l.store_id IN($subPh) ORDER BY l.id DESC LIMIT 200";
            $params = $allowedIds;
        }
        json_response(query($sql, $params)->fetchAll());
    }
    if ($action === 'inventory.adjust') { $u=require_admin(); $d=body(); require_fields($d,['store_id','product_id','new_quantity','reason']); $store=(int)$d['store_id']; assert_store($store); if((int)$d['new_quantity']<0) fail('Tồn kho không thể âm'); db()->beginTransaction(); try { query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,0) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id)',[$store,(int)$d['product_id']]); $old=(int)query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=? FOR UPDATE',[$store,(int)$d['product_id']])->fetchColumn(); $delta=(int)$d['new_quantity']-$old; $m=move_stock($store,(int)$d['product_id'],$delta,'MANUAL_ADJUSTMENT','INVENTORY',null,(int)$u['id'],trim($d['reason'])); audit('STOCK_ADJUST','INVENTORY',(int)$d['product_id'],['quantity'=>$old],['quantity'=>(int)$d['new_quantity']],trim($d['reason'])); $pName=query('SELECT name FROM products WHERE id=?',[(int)$d['product_id']])->fetchColumn()?:'Sản phẩm'; $stName=query('SELECT name FROM stores WHERE id=?',[$store])->fetchColumn()?:'Kho'; $deltaSign=$delta>=0?"+$delta":"$delta"; notify('STOCK_ADJUST','Điều chỉnh tồn: '.$pName,'['.$stName.'] '.$u['full_name'].': '.$old.' ➔ '.(int)$d['new_quantity'].' ('.$deltaSign.' cái) · '.trim($d['reason']),'INFO',$store,null,'inventory',(string)$d['product_id']); db()->commit(); json_response($m); } catch(Throwable $e){db()->rollBack(); throw $e;} }
    if ($action === 'sales.create') { $u=require_auth(); $d=body(); require_fields($d,['store_id','items','payment_method']); $store=(int)$d['store_id']; assert_store($store); if(!in_array($d['payment_method'],['CASH','BANK_TRANSFER','CARD'],true)||!is_array($d['items'])||!$d['items']) fail('Dữ liệu đơn hàng không hợp lệ'); $discountEnabled=query("SELECT config_value FROM settings WHERE config_key='discount_enabled'")->fetchColumn(); $allowDiscount=($discountEnabled!=='0'); db()->beginTransaction(); try { $subtotal=0;$normalized=[]; foreach($d['items'] as $it){$p=query('SELECT * FROM products WHERE id=? AND is_active=1',[(int)$it['product_id']])->fetch(); if(!$p||($q=(int)$it['quantity'])<1) throw new RuntimeException('Sản phẩm không hợp lệ hoặc đã ngừng bán'); $origPrice=(float)$p['selling_price']; $customPrice=isset($it['custom_price'])&&is_numeric($it['custom_price'])?(float)$it['custom_price']:(isset($it['unit_price'])&&is_numeric($it['unit_price'])?(float)$it['unit_price']:$origPrice); if($customPrice < $origPrice) throw new RuntimeException('Giá bán của "'.$p['name'].'" không được thấp hơn giá niêm yết ('.number_format($origPrice,0,',','.').' ₫)'); $sellingPrice=$customPrice; $disc=max(0,(float)($it['discount_amount']??0)); if(!$allowDiscount||!$p['allow_discount'])$disc=0; $line=$sellingPrice*$q-$disc; if($line<0)throw new RuntimeException('Giảm giá không hợp lệ');$subtotal+=$sellingPrice*$q;$normalized[]=[$p,$q,$disc,$line,$it,$sellingPrice]; } $discount=array_sum(array_column($normalized,2)); $total=$subtotal-$discount;$code=code('HD'); query('INSERT INTO orders(order_code,store_id,user_id,subtotal,discount_amount,total_amount) VALUES(?,?,?,?,?,?)',[$code,$store,$u['id'],$subtotal,$discount,$total]);$oid=(int)db()->lastInsertId(); foreach($normalized as [$p,$q,$disc,$line,$it,$sellingPrice]){query('INSERT INTO order_items(order_id,product_id,sku_snapshot,product_name_snapshot,unit_price,quantity,discount_amount,serial_number,imei,total_amount) VALUES(?,?,?,?,?,?,?,?,?,?)',[$oid,$p['id'],$p['sku'],$p['name'],$sellingPrice,$q,$disc,$it['serial_number']??null,$it['imei']??null,$line]);move_stock($store,(int)$p['id'],-$q,'SALE','ORDER',$oid,(int)$u['id']);} query('INSERT INTO payments(order_id,method,amount) VALUES(?,?,?)',[$oid,$d['payment_method'],$total]);audit('CREATE_ORDER','ORDER',$oid,null,['code'=>$code,'total'=>$total]); $stName=query('SELECT name FROM stores WHERE id=?',[$store])->fetchColumn()?:'Chi nhánh'; $itemsSummary=implode(', ',array_map(fn($it)=>$it[0]['name'].' (x'.$it[1].')',array_slice($normalized,0,3))); if(count($normalized)>3) $itemsSummary.='...'; $payText=$d['payment_method']==='CASH'?'Tiền mặt':($d['payment_method']==='BANK_TRANSFER'?'Chuyển khoản':'Thẻ'); notify('SALE_NEW','Đơn mới · +'.number_format($total,0,',','.').' ₫','['.$stName.'] '.$u['full_name'].' ('.$payText.'): '.$itemsSummary,'SUCCESS',$store,null,'orders',(string)$oid); db()->commit();json_response(['id'=>$oid,'order_code'=>$code,'total'=>$total],201);}catch(Throwable $e){db()->rollBack();throw $e;} }
    if ($action === 'sales.list') {
        $ids=allowed_store_ids();
        $store=(int)($_GET['store_id']??0);
        $params=[];
        if ($store > 0) {
            assert_store($store);
            $where='o.store_id = ?';
            $params[]=$store;
        } else {
            $u=current_user();
            if ($u && $u['role']==='ADMIN') {
                $where='1=1';
            } else {
                $where=$ids?'o.store_id IN('.placeholders(count($ids)).')':'0';
                $params=$ids;
            }
        }
        $targetStore = $store > 0 ? (int)$store : 'o.store_id';
        $sql = "SELECT o.*, s.name store_name, s.code store_code, u.full_name,
                       (SELECT GROUP_CONCAT(CONCAT(oi.product_name_snapshot, ' x ', oi.quantity) ORDER BY oi.id ASC SEPARATOR ', ') FROM order_items oi WHERE oi.order_id=o.id) AS items_summary,
                       (SELECT GROUP_CONCAT(CONCAT(COALESCE(inv.quantity, 0)) ORDER BY oi.id ASC SEPARATOR ', ') FROM order_items oi LEFT JOIN inventories inv ON inv.product_id=oi.product_id AND inv.store_id=$targetStore WHERE oi.order_id=o.id) AS stock_summary,
                       (SELECT GROUP_CONCAT((SELECT GROUP_CONCAT(COALESCE(i2.quantity, 0) ORDER BY s2.id ASC SEPARATOR '|') FROM stores s2 LEFT JOIN inventories i2 ON i2.store_id=s2.id AND i2.product_id=oi.product_id WHERE s2.is_active=1) ORDER BY oi.id ASC SEPARATOR ', ') FROM order_items oi WHERE oi.order_id=o.id) AS all_stores_stock_summary,
                       (SELECT COALESCE(SUM(inv.quantity), 0) FROM order_items oi LEFT JOIN inventories inv ON inv.product_id=oi.product_id AND inv.store_id=$targetStore WHERE oi.order_id=o.id) AS current_inventory_total
                FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE $where ORDER BY o.id DESC LIMIT 200";
        json_response(query($sql, $params)->fetchAll());
    }
    if ($action === 'sales.detail') {
        $lookup=trim((string)($_GET['lookup']??$_GET['id']??''));
        $o=ctype_digit($lookup)?query('SELECT o.*,s.name store_name,s.address store_address,s.phone store_phone,u.full_name FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE o.id=?',[(int)$lookup])->fetch():query('SELECT o.*,s.name store_name,s.address store_address,s.phone store_phone,u.full_name FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.user_id WHERE o.order_code=?',[$lookup])->fetch();
        if(!$o)fail('Không tìm thấy hóa đơn',404);
        assert_store((int)$o['store_id']);
        $o['items']=query('SELECT oi.*,p.name product_current_name,p.sku product_current_sku,COALESCE((SELECT SUM(ri.quantity) FROM return_items ri WHERE ri.order_item_id=oi.id),0) returned_quantity FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?',[$o['id']])->fetchAll();
        $o['payments']=query('SELECT * FROM payments WHERE order_id=?',[$o['id']])->fetchAll();
        $o['returns']=query('SELECT r.*,u.full_name staff_name FROM returns r JOIN users u ON u.id=r.created_by WHERE r.order_id=?',[$o['id']])->fetchAll();
        json_response($o);
    }
    if ($action === 'sales.cancel') { $u=require_admin();$d=body();require_fields($d,['id','reason']);db()->beginTransaction();try{$o=query('SELECT * FROM orders WHERE id=? FOR UPDATE',[(int)$d['id']])->fetch();if(!$o||$o['status']!=='COMPLETED')throw new RuntimeException('Hóa đơn không thể hủy');if((int)query('SELECT COUNT(*) FROM returns WHERE order_id=?',[$o['id']])->fetchColumn()>0)throw new RuntimeException('Không thể hủy hóa đơn đã có phiếu trả hàng');foreach(query('SELECT product_id,quantity FROM order_items WHERE order_id=?',[$o['id']])->fetchAll() as $it)move_stock((int)$o['store_id'],(int)$it['product_id'],(int)$it['quantity'],'CANCEL_ORDER_REVERSAL','ORDER',(int)$o['id'],(int)$u['id'],$d['reason']);query('UPDATE orders SET status="CANCELLED",cancel_reason=?,cancelled_by=?,cancelled_at=NOW() WHERE id=?',[$d['reason'],$u['id'],$o['id']]);audit('CANCEL_ORDER','ORDER',(int)$o['id'],$o,['status'=>'CANCELLED'],$d['reason']);notify('ORDER_CANCELLED','Hủy đơn · -'.number_format((float)$o['total_amount'],0,',','.').' ₫',$u['full_name'].' đã hủy đơn. Lý do: '.$d['reason'],'DANGER',(int)$o['store_id'],null,'orders',(string)$o['id']);db()->commit();json_response(true);}catch(Throwable $e){db()->rollBack();throw $e;} }
    if ($action === 'returns.create') {
        $u=require_auth();$d=body();require_fields($d,['order_id','items','reason']);
        db()->beginTransaction();
        try {
            $o=query('SELECT * FROM orders WHERE id=? AND status="COMPLETED" FOR UPDATE',[(int)$d['order_id']])->fetch();
            if(!$o)throw new RuntimeException('Hóa đơn gốc không hợp lệ');
            assert_store((int)$o['store_id']);
            $code=code('TH');
            query('CREATE TABLE IF NOT EXISTS return_exchange_items (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, return_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL, quantity INT NOT NULL, unit_price DECIMAL(15,2) NOT NULL, total_amount DECIMAL(15,2) NOT NULL, FOREIGN KEY(return_id) REFERENCES returns(id), FOREIGN KEY(product_id) REFERENCES products(id)) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            query('INSERT INTO returns(return_code,order_id,store_id,created_by,reason,total_amount) VALUES(?,?,?,?,?,0)',[$code,$o['id'],$o['store_id'],$u['id'],$d['reason']]);
            $rid=(int)db()->lastInsertId();
            $calcReturnTotal=0;
            foreach($d['items'] as $x){
                $it=query('SELECT oi.*,COALESCE((SELECT SUM(ri.quantity) FROM return_items ri WHERE ri.order_item_id=oi.id),0) returned FROM order_items oi WHERE oi.id=? AND oi.order_id=?',[(int)$x['order_item_id'],$o['id']])->fetch();
                $qty=(int)$x['quantity'];
                if(!$it||$qty<1||$qty>(int)$it['quantity']-(int)$it['returned'])throw new RuntimeException('Số lượng trả không hợp lệ');
                $amount=((float)$it['total_amount']/(int)$it['quantity'])*$qty;
                $calcReturnTotal+=$amount;
                query('INSERT INTO return_items(return_id,order_item_id,product_id,quantity,amount,serial_number,imei) VALUES(?,?,?,?,?,?,?)',[$rid,$it['id'],$it['product_id'],$qty,$amount,$x['serial_number']??null,$x['imei']??null]);
                move_stock((int)$o['store_id'],(int)$it['product_id'],$qty,'RETURN','RETURN',$rid,(int)$u['id'],$d['reason']);
            }
            $calcExchangeTotal=0;
            $exchangeItems = !empty($d['exchange_items']) && is_array($d['exchange_items']) ? $d['exchange_items'] : [];
            foreach($exchangeItems as $ex){
                $epid = (int)($ex['product_id'] ?? 0);
                $eqty = (int)($ex['quantity'] ?? 0);
                if($epid <= 0 || $eqty < 1) continue;
                $exp = query('SELECT * FROM products WHERE id=? AND is_active=1', [$epid])->fetch();
                if(!$exp) throw new RuntimeException('Sản phẩm đổi không tồn tại hoặc đã ngừng bán');
                $stk = (int)query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=?', [(int)$o['store_id'], $epid])->fetchColumn();
                if($stk < $eqty) throw new RuntimeException('Kho không đủ tồn cho sản phẩm đổi "'.$exp['name'].'" (Còn '.$stk.' cái)');
                $eprice = isset($ex['unit_price']) && is_numeric($ex['unit_price']) ? (float)$ex['unit_price'] : (float)$exp['selling_price'];
                $eamount = $eprice * $eqty;
                $calcExchangeTotal += $eamount;
                query('INSERT INTO return_exchange_items(return_id,product_id,quantity,unit_price,total_amount) VALUES(?,?,?,?,?)', [$rid,$epid,$eqty,$eprice,$eamount]);
                move_stock((int)$o['store_id'], $epid, -$eqty, 'SALE', 'RETURN', $rid, (int)$u['id'], 'Xuất đổi hàng cho phiếu '.$code.': '.$d['reason']);
            }
            $netDiff = $calcReturnTotal - $calcExchangeTotal;
            $finalTotal = (isset($d['total_amount']) && is_numeric($d['total_amount'])) ? (float)$d['total_amount'] : max(0, $netDiff);
            query('UPDATE returns SET total_amount=? WHERE id=?',[$finalTotal,$rid]);
            audit('RETURN','RETURN',$rid,null,['code'=>$code,'total'=>$finalTotal,'return_total'=>$calcReturnTotal,'exchange_total'=>$calcExchangeTotal]);
            $stName = query('SELECT name FROM stores WHERE id=?', [(int)$o['store_id']])->fetchColumn() ?: 'Chi nhánh';
            $notifTitle = count($exchangeItems) > 0 ? 'Đổi hàng thành công' : 'Đổi trả hàng · ' . ($finalTotal > 0 ? 'Hoàn ' . number_format($finalTotal, 0, ',', '.') . ' ₫' : 'Đổi sản phẩm');
            $notifMsg = '['.$stName.'] '.$u['full_name'].' lập phiếu. Lý do: '.$d['reason'];
            if ($finalTotal > 0 && count($exchangeItems) > 0) $notifMsg .= ' (Hoàn lại: '.number_format($finalTotal,0,',','.').' ₫)';
            elseif ($calcExchangeTotal > $calcReturnTotal) $notifMsg .= ' (Thu thêm: '.number_format($calcExchangeTotal - $calcReturnTotal,0,',','.').' ₫)';
            notify('RETURN_CREATED', $notifTitle, $notifMsg, 'WARNING', (int)$o['store_id'], null, 'returns', (string)$rid);
            db()->commit();
            json_response(['id'=>$rid,'return_code'=>$code,'total'=>$finalTotal,'exchange_count'=>count($exchangeItems)],201);
        } catch(Throwable $e){
            db()->rollBack();
            throw $e;
        }
    }
    if ($action === 'returns.list') { $ids=allowed_store_ids();json_response($ids?query('SELECT r.*,o.order_code,s.name store_name,u.full_name FROM returns r JOIN orders o ON o.id=r.order_id JOIN stores s ON s.id=r.store_id JOIN users u ON u.id=r.created_by WHERE r.store_id IN('.placeholders(count($ids)).') ORDER BY r.id DESC',$ids)->fetchAll():[]); }
    if ($action === 'returns.detail') {
        $id=(int)($_GET['id']??0);
        $r=query('SELECT r.*,o.order_code,s.name store_name,s.address store_address,s.phone store_phone,u.full_name staff_name FROM returns r JOIN orders o ON o.id=r.order_id JOIN stores s ON s.id=r.store_id JOIN users u ON u.id=r.created_by WHERE r.id=? AND r.store_id IN('.placeholders(count(allowed_store_ids())).')',array_merge([$id],allowed_store_ids()))->fetch();
        if(!$r)fail('Không tìm thấy phiếu trả hàng',404);
        $r['items']=query('SELECT ri.*,p.name product_name,p.sku product_sku FROM return_items ri JOIN products p ON p.id=ri.product_id WHERE ri.return_id=?',[$id])->fetchAll();
        query('CREATE TABLE IF NOT EXISTS return_exchange_items (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, return_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL, quantity INT NOT NULL, unit_price DECIMAL(15,2) NOT NULL, total_amount DECIMAL(15,2) NOT NULL, FOREIGN KEY(return_id) REFERENCES returns(id), FOREIGN KEY(product_id) REFERENCES products(id)) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $r['exchange_items']=query('SELECT rei.*,p.name product_name,p.sku product_sku FROM return_exchange_items rei JOIN products p ON p.id=rei.product_id WHERE rei.return_id=?',[$id])->fetchAll();
        json_response($r);
    }
    if ($action === 'transfers.create') {
        $u=require_auth();$d=body();require_fields($d,['from_store_id','to_store_id','items']);
        $fromId=(int)$d['from_store_id']; $toId=(int)$d['to_store_id'];
        if($fromId===$toId) fail('Kho nguồn và kho đích phải khác nhau');
        $allowed=allowed_store_ids();
        if(!in_array($fromId,$allowed,true) && !in_array($toId,$allowed,true)) fail('Bạn không có quyền thao tác trên các chi nhánh này',403);
        $code=code('CK');
        query('INSERT INTO stock_transfers(transfer_code,from_store_id,to_store_id,requested_by,request_note) VALUES(?,?,?,?,?)',[$code,$fromId,$toId,$u['id'],$d['request_note']??null]);
        $id=(int)db()->lastInsertId();
        foreach($d['items'] as $it){
            $pid=(int)$it['product_id']; $qty=(int)$it['quantity'];
            if($qty<1) fail('Số lượng không hợp lệ');
            query('INSERT INTO stock_transfer_items(transfer_id,product_id,quantity) VALUES(?,?,?)',[$id,$pid,$qty]);
        }
        audit('STOCK_TRANSFER_REQUEST','TRANSFER',$id,null,$d);
        $fromName = query('SELECT name FROM stores WHERE id=?', [$fromId])->fetchColumn() ?: 'Kho xuất';
        $toName = query('SELECT name FROM stores WHERE id=?', [$toId])->fetchColumn() ?: 'Kho nhận';
        notify('STOCK_TRANSFER_REQUEST','Chuyển kho: '.$fromName.' ➔ '.$toName,$u['full_name'].' yêu cầu chuyển '.count($d['items']).' mặt hàng','INFO',$toId,null,'transfers',(string)$id);
        json_response(['id'=>$id,'transfer_code'=>$code],201);
    }
    if ($action === 'transfers.list') { $ids=allowed_store_ids(); if(!$ids)json_response([]);$p=array_merge($ids,$ids);$transfers=query('SELECT t.*,a.name from_store,b.name to_store,u.full_name requested_name,appr.full_name approved_name FROM stock_transfers t JOIN stores a ON a.id=t.from_store_id JOIN stores b ON b.id=t.to_store_id JOIN users u ON u.id=t.requested_by LEFT JOIN users appr ON appr.id=t.approved_by WHERE t.from_store_id IN('.placeholders(count($ids)).') OR t.to_store_id IN('.placeholders(count($ids)).') ORDER BY t.id DESC',$p)->fetchAll();foreach($transfers as &$tr){$tr['items']=query('SELECT ti.*,p.sku,p.name,COALESCE(i.quantity,0) from_store_stock FROM stock_transfer_items ti JOIN products p ON p.id=ti.product_id LEFT JOIN inventories i ON i.product_id=ti.product_id AND i.store_id=? WHERE ti.transfer_id=?',[(int)$tr['from_store_id'],(int)$tr['id']])->fetchAll();}json_response($transfers); }
    if ($action === 'transfers.decide') { $u=require_admin();$d=body();require_fields($d,['id','decision']);db()->beginTransaction();try{$t=query('SELECT * FROM stock_transfers WHERE id=? FOR UPDATE',[(int)$d['id']])->fetch();if(!$t||$t['status']!=='REQUESTED')throw new RuntimeException('Phiếu không còn chờ duyệt');if($d['decision']==='reject'){query('UPDATE stock_transfers SET status="REJECTED",approved_by=?,approved_at=NOW(),reject_reason=? WHERE id=?',[$u['id'],$d['reason']??'Từ chối',$t['id']]);audit('STOCK_TRANSFER_REJECT','TRANSFER',(int)$t['id']);notify('STOCK_TRANSFER_DECISION','Từ chối chuyển kho: '.$t['transfer_code'],$u['full_name'].' từ chối: '.($d['reason']??'Không duyệt'),'DANGER',(int)$t['from_store_id'],(int)$t['requested_by'],'transfers',(string)$t['id']);}elseif($d['decision']==='approve'){foreach(query('SELECT * FROM stock_transfer_items WHERE transfer_id=?',[$t['id']])->fetchAll() as $it){move_stock((int)$t['from_store_id'],(int)$it['product_id'],-(int)$it['quantity'],'TRANSFER_OUT','TRANSFER',(int)$t['id'],(int)$u['id']);move_stock((int)$t['to_store_id'],(int)$it['product_id'],(int)$it['quantity'],'TRANSFER_IN','TRANSFER',(int)$t['id'],(int)$u['id']);}query('UPDATE stock_transfers SET status="COMPLETED",approved_by=?,approved_at=NOW() WHERE id=?',[$u['id'],$t['id']]);audit('STOCK_TRANSFER_COMPLETE','TRANSFER',(int)$t['id']);notify('STOCK_TRANSFER_DECISION','Đã duyệt chuyển kho: '.$t['transfer_code'],$u['full_name'].' đã phê duyệt chuyển hàng thành công.','SUCCESS',(int)$t['to_store_id'],(int)$t['requested_by'],'transfers',(string)$t['id']);}else throw new RuntimeException('Quyết định không hợp lệ');db()->commit();json_response(true);}catch(Throwable $e){db()->rollBack();throw $e;} }
    require __DIR__ . '/api/modules/analytics.php';
    require __DIR__ . '/api/modules/demo.php';
    require __DIR__ . '/api/modules/notifications.php';
    require __DIR__ . '/api/modules/extended.php';
    require __DIR__ . '/api/modules/backup.php';
    fail('API không tồn tại',404);
} catch (PDOException $e) { fail(!empty($config['app']['debug'])?$e->getMessage():'Lỗi cơ sở dữ liệu',500); } catch (Throwable $e) { fail($e->getMessage(),422); }
