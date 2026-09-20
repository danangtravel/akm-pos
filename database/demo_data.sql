INSERT INTO categories(name,sort_order) VALUES ('Điện thoại',1),('Phụ kiện',2),('Linh kiện',3);
INSERT INTO products(category_id,sku,barcode,name,selling_price,allow_discount) VALUES
((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1),'CL-IP15','893000000001','Cường lực iPhone 15',50000,1),
((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1),'CB-USBC','893000000002','Cáp sạc USB-C',150000,1),
((SELECT id FROM categories WHERE name='Linh kiện' LIMIT 1),'MH-IP13','893000000003','Màn hình iPhone 13',1800000,0);
