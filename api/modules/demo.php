<?php
if ($action === 'system.repair_encoding') {
    require_admin();
    $tables = db()->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    db()->exec('SET FOREIGN_KEY_CHECKS=0');
    try {
        foreach ($tables as $table) {
            if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) continue;
            db()->exec("ALTER TABLE `$table` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }
    } finally {
        db()->exec('SET FOREIGN_KEY_CHECKS=1');
    }
    audit('ENCODING_REPAIR', 'SYSTEM', null, null, ['tables' => count($tables)], 'Chuẩn hóa UTF-8 cho database');
    json_response(['tables' => count($tables), 'message' => 'Đã chuẩn hóa toàn bộ bảng sang utf8mb4.']);
}

if ($action === 'system.seed_demo') {
    $admin = require_admin();
    // Shared hosting thường giới hạn request khá ngắn; seed được tối ưu theo lô và có thể chạy lại an toàn.
    @set_time_limit(120);
    @ignore_user_abort(true);
    if ((int)query("SELECT config_value FROM settings WHERE config_key='demo_seed_version'")->fetchColumn() >= 3) {
        json_response(['already_seeded' => true, 'message' => 'Dữ liệu demo mở rộng đã được tạo trước đó.']);
    }
    db()->beginTransaction();
    try {
        $stores = [
            ['AKM01', 'AKM Mobile - Chi nhánh Trung Tâm', '12 Nguyễn Huệ, Quận 1, TP.HCM', '028 7300 1001'],
            ['AKM02', 'AKM Mobile - Chi nhánh Gò Vấp', '88 Quang Trung, Gò Vấp, TP.HCM', '028 7300 1002'],
            ['AKM03', 'AKM Mobile - Chi nhánh Thủ Đức', '156 Võ Văn Ngân, Thủ Đức, TP.HCM', '028 7300 1003'],
            ['AKM04', 'AKM Mobile - Chi nhánh Bình Thạnh', '225 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', '028 7300 1004'],
        ];
        $storeIds = [];
        foreach ($stores as $s) {
            query('INSERT INTO stores(code,name,address,phone,is_active) VALUES(?,?,?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name),address=VALUES(address),phone=VALUES(phone),is_active=1', $s);
            $storeIds[$s[0]] = (int)query('SELECT id FROM stores WHERE code=?', [$s[0]])->fetchColumn();
        }

        $categories = ['Điện thoại', 'Phụ kiện', 'Cường lực', 'Ốp lưng', 'Cáp sạc', 'Củ sạc', 'Sạc dự phòng', 'Linh kiện', 'Tai nghe', 'Đồng hồ thông minh', 'Thiết bị lưu trữ'];
        $categoryIds = [];
        foreach ($categories as $i => $name) {
            $id = query('SELECT id FROM categories WHERE name=? LIMIT 1', [$name])->fetchColumn();
            if (!$id) { query('INSERT INTO categories(name,sort_order,is_active) VALUES(?,?,1)', [$name, $i + 1]); $id = db()->lastInsertId(); }
            $categoryIds[$name] = (int)$id;
        }

        $products = [
            ['DEMO-IP15-128-BLK','893850000101','iPhone 15 128GB - Đen','Điện thoại',18990000,0],
            ['DEMO-IP15PM-256','893850000102','iPhone 15 Pro Max 256GB','Điện thoại',28990000,0],
            ['DEMO-SS-S24-256','893850000103','Samsung Galaxy S24 256GB','Điện thoại',19990000,1],
            ['DEMO-OP-R12-128','893850000104','OPPO Reno12 128GB','Điện thoại',9990000,1],
            ['DEMO-CL-IP15','893850000201','Cường lực iPhone 15 chống nhìn trộm','Cường lực',120000,1],
            ['DEMO-CL-S24','893850000202','Cường lực Samsung S24 Full màn','Cường lực',150000,1],
            ['DEMO-OL-IP15-CLR','893850000301','Ốp lưng iPhone 15 trong suốt','Ốp lưng',180000,1],
            ['DEMO-OL-S24-SIL','893850000302','Ốp lưng Samsung S24 silicone','Ốp lưng',220000,1],
            ['DEMO-CAP-USBC','893850000401','Cáp sạc USB-C to USB-C 1m','Cáp sạc',250000,1],
            ['DEMO-SAC-20W','893850000402','Củ sạc nhanh 20W PD','Củ sạc',390000,1],
            ['DEMO-PIN-IP13','893850000501','Pin thay thế iPhone 13','Linh kiện',850000,0],
            ['DEMO-MH-IP13','893850000502','Màn hình OLED iPhone 13','Linh kiện',2450000,0],
            ['DEMO-IP16-128','893850000105','iPhone 16 128GB - Xanh','Điện thoại',21990000,0],
            ['DEMO-IP16P-256','893850000106','iPhone 16 Pro 256GB Titan','Điện thoại',30990000,0],
            ['DEMO-IP14-128','893850000107','iPhone 14 128GB - Tím','Điện thoại',15990000,1],
            ['DEMO-SS-A55-256','893850000108','Samsung Galaxy A55 256GB','Điện thoại',10490000,1],
            ['DEMO-SS-ZFLIP6','893850000109','Samsung Galaxy Z Flip6 256GB','Điện thoại',23990000,1],
            ['DEMO-XI-RN13-256','893850000110','Xiaomi Redmi Note 13 256GB','Điện thoại',5990000,1],
            ['DEMO-OP-A3-128','893850000111','OPPO A3 128GB','Điện thoại',5490000,1],
            ['DEMO-VI-V40-256','893850000112','vivo V40 Lite 256GB','Điện thoại',8490000,1],
            ['DEMO-CL-IP16','893850000203','Cường lực iPhone 16 Ceramic','Cường lực',180000,1],
            ['DEMO-CL-IP16P','893850000204','Cường lực iPhone 16 Pro chống nhìn trộm','Cường lực',220000,1],
            ['DEMO-CL-A55','893850000205','Cường lực Samsung A55 Full Glue','Cường lực',130000,1],
            ['DEMO-CL-RN13','893850000206','Cường lực Redmi Note 13','Cường lực',100000,1],
            ['DEMO-OL-IP16-MAG','893850000303','Ốp lưng iPhone 16 MagSafe','Ốp lưng',350000,1],
            ['DEMO-OL-IP16P-LEA','893850000304','Ốp da iPhone 16 Pro','Ốp lưng',420000,1],
            ['DEMO-OL-A55','893850000305','Ốp lưng Samsung A55 chống sốc','Ốp lưng',190000,1],
            ['DEMO-OL-RN13','893850000306','Ốp lưng Redmi Note 13 nhám','Ốp lưng',150000,1],
            ['DEMO-CAP-LIGHT','893850000403','Cáp Lightning bọc dù 1.2m','Cáp sạc',220000,1],
            ['DEMO-CAP-3IN1','893850000404','Cáp sạc đa năng 3 trong 1','Cáp sạc',290000,1],
            ['DEMO-SAC-30W','893850000405','Củ sạc GaN 30W','Củ sạc',550000,1],
            ['DEMO-SAC-65W','893850000406','Củ sạc GaN 65W hai cổng','Củ sạc',890000,1],
            ['DEMO-PBANK-10K','893850000407','Sạc dự phòng AKM Power 10.000mAh PD','Sạc dự phòng',690000,1],
            ['DEMO-PBANK-20K','893850000408','Sạc dự phòng AKM Power 20.000mAh 22.5W','Sạc dự phòng',990000,1],
            ['DEMO-TWS-AKM','893850000601','Tai nghe Bluetooth AKM Buds','Tai nghe',790000,1],
            ['DEMO-AIRPODS-3','893850000602','Apple AirPods 3','Tai nghe',4390000,0],
            ['DEMO-SS-BUDS-FE','893850000603','Samsung Galaxy Buds FE','Tai nghe',1690000,1],
            ['DEMO-WATCH-SE','893850000701','Apple Watch SE GPS 40mm','Đồng hồ thông minh',5990000,1],
            ['DEMO-WATCH-FIT3','893850000702','Samsung Galaxy Fit3','Đồng hồ thông minh',1290000,1],
            ['DEMO-WATCH-XIAOMI','893850000703','Xiaomi Redmi Watch 4','Đồng hồ thông minh',1990000,1],
            ['DEMO-USB-64','893850000801','USB 3.2 64GB','Thiết bị lưu trữ',250000,1],
            ['DEMO-USB-128','893850000802','USB Type-C 128GB','Thiết bị lưu trữ',490000,1],
            ['DEMO-MSD-128','893850000803','Thẻ nhớ microSD 128GB','Thiết bị lưu trữ',390000,1],
            ['DEMO-MSD-256','893850000804','Thẻ nhớ microSD 256GB','Thiết bị lưu trữ',720000,1],
        ];
        $productIds = [];
        foreach ($products as $p) {
            query('INSERT INTO products(category_id,sku,barcode,name,selling_price,description,allow_discount,is_active) VALUES(?,?,?,?,?,"Dữ liệu trải nghiệm AKM POS",?,1) ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),barcode=VALUES(barcode),name=VALUES(name),selling_price=VALUES(selling_price),allow_discount=VALUES(allow_discount),is_active=1', [$categoryIds[$p[3]],$p[0],$p[1],$p[2],$p[4],$p[5]]);
            $productIds[$p[0]] = (int)query('SELECT id FROM products WHERE sku=?', [$p[0]])->fetchColumn();
        }

        $skuList = array_column($products, 0);
        $existingRows = query('SELECT store_id,product_id,quantity FROM inventories WHERE store_id IN('.placeholders(count($storeIds)).') AND product_id IN('.placeholders(count($productIds)).')', array_merge(array_values($storeIds),array_values($productIds)))->fetchAll();
        $existing = [];
        foreach ($existingRows as $row) $existing[$row['store_id'].':'.$row['product_id']] = (int)$row['quantity'];
        $inventoryValues = []; $inventoryParams = []; $ledgerValues = []; $ledgerParams = [];
        foreach (array_keys($storeIds) as $storeIndex => $storeCode) {
            foreach ($skuList as $i => $sku) {
                $isPhone = $products[$i][3] === 'Điện thoại';
                $unavailable = ($storeIndex === 1 && $i % 4 === 0) || ($storeIndex === 2 && $i % 5 === 1) || ($storeIndex === 3 && $i % 6 === 2) || ($storeIndex === 0 && $i % 11 === 10);
                $target = $unavailable ? 0 : ($isPhone ? 2 + (($i * 3 + $storeIndex) % 8) : 8 + (($i * 7 + $storeIndex * 5) % 38));
                if (!$unavailable && ($i + $storeIndex) % 13 === 0) $target = 2;
                $pid = $productIds[$skuList[$i]]; $sid = $storeIds[$storeCode]; $before = $existing[$sid.':'.$pid] ?? 0;
                $inventoryValues[] = '(?,?,?)'; array_push($inventoryParams,$sid,$pid,$target);
                if ($before !== $target) {
                    $ledgerValues[] = '(?,?,?,?,?,?,?,?,?,?)';
                    array_push($ledgerParams,$sid,$pid,'INITIAL_IMPORT',$target-$before,$before,$target,'DEMO',null,(int)$admin['id'],'Khởi tạo dữ liệu demo');
                }
            }
        }
        query('INSERT INTO inventories(store_id,product_id,quantity) VALUES '.implode(',',$inventoryValues).' ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)', $inventoryParams);
        if ($ledgerValues) query('INSERT INTO stock_ledger(store_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,created_by,reason) VALUES '.implode(',',$ledgerValues), $ledgerParams);

        $orders = [
            ['DEMO-HD-001','AKM01','DEMO-IP15-128-BLK',1,'BANK_TRANSFER',18990000],
            ['DEMO-HD-002','AKM01','DEMO-CL-IP15',2,'CASH',240000],
            ['DEMO-HD-003','AKM02','DEMO-SAC-20W',1,'CARD',390000],
            ['DEMO-HD-004','AKM03','DEMO-OL-S24-SIL',2,'CASH',440000],
            ['DEMO-HD-005','AKM04','DEMO-SAC-20W',1,'BANK_TRANSFER',390000],
            ['DEMO-HD-006','AKM01','DEMO-IP16-128',1,'CARD',21990000],
            ['DEMO-HD-007','AKM02','DEMO-CL-A55',3,'CASH',390000],
            ['DEMO-HD-008','AKM03','DEMO-TWS-AKM',2,'BANK_TRANSFER',1580000],
            ['DEMO-HD-009','AKM04','DEMO-PBANK-20K',1,'CARD',990000],
            ['DEMO-HD-010','AKM01','DEMO-OL-IP16-MAG',2,'CASH',700000],
            ['DEMO-HD-011','AKM02','DEMO-SS-A55-256',1,'BANK_TRANSFER',10490000],
            ['DEMO-HD-012','AKM03','DEMO-CAP-3IN1',3,'CASH',870000],
            ['DEMO-HD-013','AKM04','DEMO-WATCH-XIAOMI',1,'CARD',1990000],
            ['DEMO-HD-014','AKM01','DEMO-SAC-65W',2,'BANK_TRANSFER',1780000],
            ['DEMO-HD-015','AKM02','DEMO-MSD-128',2,'CASH',780000],
            ['DEMO-HD-016','AKM03','DEMO-USB-64',4,'CASH',1000000],
            ['DEMO-HD-017','AKM04','DEMO-AIRPODS-3',1,'CARD',4390000],
            ['DEMO-HD-018','AKM01','DEMO-CL-IP16',2,'CASH',360000],
            ['DEMO-HD-019','AKM02','DEMO-OP-A3-128',1,'BANK_TRANSFER',5490000],
            ['DEMO-HD-020','AKM03','DEMO-WATCH-XIAOMI',1,'CARD',1990000],
        ];
        foreach ($orders as $index => $o) {
            if (query('SELECT id FROM orders WHERE order_code=?',[$o[0]])->fetchColumn()) continue;
            $pid=$productIds[$o[2]];$sid=$storeIds[$o[1]];$product=query('SELECT * FROM products WHERE id=?',[$pid])->fetch();
            query('INSERT INTO orders(order_code,store_id,user_id,subtotal,discount_amount,total_amount,status,created_at) VALUES(?,?,?,?,0,?,"COMPLETED",DATE_SUB(NOW(),INTERVAL ? DAY))',[$o[0],$sid,$admin['id'],$o[5],$o[5],$index]);
            $oid=(int)db()->lastInsertId();
            query('INSERT INTO order_items(order_id,product_id,sku_snapshot,product_name_snapshot,unit_price,quantity,discount_amount,total_amount) VALUES(?,?,?,?,?,?,0,?)',[$oid,$pid,$product['sku'],$product['name'],$product['selling_price'],$o[3],$o[5]]);
            query('INSERT INTO payments(order_id,method,amount) VALUES(?,?,?)',[$oid,$o[4],$o[5]]);
            move_stock($sid,$pid,-$o[3],'SALE','ORDER',$oid,(int)$admin['id'],'Giao dịch demo');
        }

        if (!query("SELECT id FROM stock_transfers WHERE transfer_code='DEMO-CK-001'")->fetchColumn()) {
            query('INSERT INTO stock_transfers(transfer_code,from_store_id,to_store_id,requested_by,approved_by,status,request_note,requested_at,approved_at) VALUES("DEMO-CK-001",?,?,?,?,"COMPLETED","Bổ sung phụ kiện bán chạy",DATE_SUB(NOW(),INTERVAL 1 DAY),NOW())',[$storeIds['AKM02'],$storeIds['AKM01'],$admin['id'],$admin['id']]);
            $tid=(int)db()->lastInsertId();$pid=$productIds['DEMO-CL-S24'];
            query('INSERT INTO stock_transfer_items(transfer_id,product_id,quantity) VALUES(?,?,5)',[$tid,$pid]);
            move_stock($storeIds['AKM02'],$pid,-5,'TRANSFER_OUT','TRANSFER',$tid,(int)$admin['id'],'Điều chuyển demo');
            move_stock($storeIds['AKM01'],$pid,5,'TRANSFER_IN','TRANSFER',$tid,(int)$admin['id'],'Điều chuyển demo');
        }

        $repairs = [
            ['DEMO-SC-001','AKM01','Nguyễn Minh Anh','0901000001','iPhone 13 Pro','Máy rơi, vỡ mặt kính','Thay màn hình','REPAIRING',1],
            ['DEMO-SC-002','AKM02','Trần Quốc Bảo','0901000002','Samsung Galaxy S22','Pin tụt nhanh','Kiểm tra và thay pin','WAITING_PARTS',2],
            ['DEMO-SC-003','AKM03','Lê Thùy Dương','0901000003','OPPO Reno8','Không nhận sạc','Kiểm tra chân sạc','WAITING_PICKUP',0],
            ['DEMO-SC-004','AKM04','Phạm Hoàng Nam','0901000004','iPhone 12','Loa rè','Vệ sinh và thay loa','RECEIVED',3],
        ];
        foreach($repairs as $r){if(query('SELECT id FROM repair_cases WHERE repair_code=?',[$r[0]])->fetchColumn())continue;query('INSERT INTO repair_cases(repair_code,store_id,technician_id,customer_name,customer_phone,device_name,device_condition,repair_request,status,received_at,expected_return_at) VALUES(?,?,?,?,?,?,?,?,?,DATE_SUB(NOW(),INTERVAL ? DAY),DATE_ADD(NOW(),INTERVAL 2 DAY))',[$r[0],$storeIds[$r[1]],$admin['id'],$r[2],$r[3],$r[4],$r[5],$r[6],$r[7],$r[8]]);}

        query('INSERT INTO settings(config_key,config_value) VALUES("demo_seeded","1") ON DUPLICATE KEY UPDATE config_value="1"');
        query('INSERT INTO settings(config_key,config_value) VALUES("demo_seed_version","3") ON DUPLICATE KEY UPDATE config_value="3"');
        query('INSERT INTO settings(config_key,config_value) VALUES("low_stock_threshold","5") ON DUPLICATE KEY UPDATE config_value=config_value');
        query('INSERT INTO settings(config_key,config_value) VALUES("slow_moving_days","7") ON DUPLICATE KEY UPDATE config_value=config_value');
        audit('DEMO_SEED','SYSTEM',null,null,['stores'=>4,'products'=>44,'orders'=>20,'repairs'=>4],'Khởi tạo dữ liệu trải nghiệm mở rộng');
        db()->commit();
        json_response(['stores'=>4,'products'=>44,'orders'=>20,'repairs'=>4,'message'=>'Đã tạo dữ liệu demo mở rộng thành công.']);
    } catch (Throwable $e) { db()->rollBack(); throw $e; }
}

if ($action === 'system.import_products_kv') {
    $admin = require_admin();
    @set_time_limit(180);
    @ignore_user_abort(true);

    $sqlFile = dirname(__DIR__, 2) . '/database/products_kv_seed.sql';
    if (!is_file($sqlFile)) {
        fail('Không tìm thấy tệp products_kv_seed.sql', 404);
    }

    db()->beginTransaction();
    try {
        $sql = file_get_contents($sqlFile);
        $queries = array_filter(array_map('trim', explode(";\n", $sql)), fn($q) => $q !== '' && !str_starts_with($q, '--'));
        
        foreach ($queries as $q) {
            if ($q !== '') {
                db()->exec($q);
            }
        }

        $prodCount = (int)query('SELECT COUNT(*) FROM products WHERE is_active=1')->fetchColumn();
        $catCount = (int)query('SELECT COUNT(*) FROM categories WHERE is_active=1')->fetchColumn();
        $stockCount = (int)query('SELECT COALESCE(SUM(quantity),0) FROM inventories')->fetchColumn();

        audit('IMPORT_PRODUCTS_KV', 'SYSTEM', null, null, ['products' => $prodCount, 'categories' => $catCount, 'stock' => $stockCount], 'Đồng bộ 100 sản phẩm thực tế từ KiotViet');
        db()->commit();

        json_response([
            'products' => $prodCount,
            'categories' => $catCount,
            'stock' => $stockCount,
            'message' => "Đã đồng bộ thành công dữ liệu 100 sản phẩm thực tế từ KiotViet ($prodCount sản phẩm, $stockCount tồn kho)."
        ]);
    } catch (Throwable $e) {
        db()->rollBack();
        throw $e;
    }
}

