<?php
function move_stock(int $storeId,int $productId,int $delta,string $type,string $refType,?int $refId,int $userId,string $reason=''): array {
    query('INSERT INTO inventories(store_id,product_id,quantity) VALUES(?,?,0) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id)',[$storeId,$productId]);
    $row=query('SELECT quantity FROM inventories WHERE store_id=? AND product_id=? FOR UPDATE',[$storeId,$productId])->fetch();
    $before=(int)$row['quantity']; $after=$before+$delta;
    if($after<0) throw new RuntimeException('Tồn kho không đủ cho sản phẩm #' . $productId);
    query('UPDATE inventories SET quantity=? WHERE store_id=? AND product_id=?',[$after,$storeId,$productId]);
    query('INSERT INTO stock_ledger(store_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,created_by,reason) VALUES(?,?,?,?,?,?,?,?,?,?)',[$storeId,$productId,$type,$delta,$before,$after,$refType,$refId,$userId,$reason]);
    return ['before'=>$before,'after'=>$after,'change'=>$delta];
}
