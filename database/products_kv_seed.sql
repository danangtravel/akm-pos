-- =========================================================
-- Dữ liệu thực tế 100 sản phẩm từ KiotViet (Products_KV.csv)
-- Hệ thống AKM POS - Đồng bộ Danh mục, Sản phẩm, Tồn kho, Ảnh CDN
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- 1. DANH MỤC SẢN PHẨM
INSERT INTO categories (name, sort_order, is_active) VALUES ('Phụ kiện', 1, 1) ON DUPLICATE KEY UPDATE is_active=1;
INSERT INTO categories (name, sort_order, is_active) VALUES ('Cáp sạc', 2, 1) ON DUPLICATE KEY UPDATE is_active=1;
INSERT INTO categories (name, sort_order, is_active) VALUES ('Sạc dự phòng', 3, 1) ON DUPLICATE KEY UPDATE is_active=1;
INSERT INTO categories (name, sort_order, is_active) VALUES ('Cường lực', 4, 1) ON DUPLICATE KEY UPDATE is_active=1;
INSERT INTO categories (name, sort_order, is_active) VALUES ('Vi tính', 5, 1) ON DUPLICATE KEY UPDATE is_active=1;
INSERT INTO categories (name, sort_order, is_active) VALUES ('Gậy tự sướng', 6, 1) ON DUPLICATE KEY UPDATE is_active=1;

-- 2. DANH SÁCH SẢN PHẨM & ẢNH CDN & GIÁ VỐN & GIÁ BÁN
INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000140', 'SP000140', 'vnsky 5g', 100000, 400000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/09/04/maxpromobile/9448c7def2ff4fecbe0f4c580b9b858c.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000139', 'SP000139', 'bao da gấp - ốp', 100000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/09/04/maxpromobile/8e9ec7bccc6b4e728b79ba93369059a2.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000138', 'SP000138', '60w anker c-c', 100000, 300000, 'Anker', 'https://cdn2-retail-images.kiotviet.vn/2026/08/31/maxpromobile/e9b3ebe062a141b58f6779371dcb773e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000137', 'SP000137', 'Sim Vietnamobile', 0, 200000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/29/maxpromobile/21e6d4f9454e4ca69c6cc3fedf8a538e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000136', 'SP000136', 'Sim Local 8GB', 0, 500000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/29/maxpromobile/249734f98df44df69ce784103df43bfb.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000135', 'SP000135', 'Sim Local 5GB', 0, 400000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/29/maxpromobile/4de55db690cd4303b4e4490518db4b45.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000134', 'SP000134', 'Sim Mobiphone 1000GB', 0, 400000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/29/maxpromobile/d0cd5fe846a347d895b40fdcfd2dfd79.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000133', 'SP000133', 'Cáp dù c-c', 0, 200000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/08/29/maxpromobile/c1f3debae95b4a42be1eff8c5896f958.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000132', 'SP000132', 'bàn phím baseus k01a', 150000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/18/maxpromobile/91f2b5210bed4734bcc81c42a90ed605.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000131', 'SP000131', 'dây 3 đầu rút baseus', 150000, 550000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/18/maxpromobile/f0d264e3497b49e482fcfc426d1701b6.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000130', 'SP000130', 'dây 3 đầu c baseus', 100000, 550000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/18/maxpromobile/2fb0596387b7491db8e48331fd579c90.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000129', 'SP000129', 'dây 3 đầu usb baseus', 100000, 500000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/18/maxpromobile/04e51f2c6737402b967ca6d00b55727f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000128', 'SP000128', 'usb 2tb', 300000, 1300000, 'Hoco', 'https://cdn1-retail-images.kiotviet.vn/2026/08/18/maxpromobile/f85379c97b464000ac7f42527663ac87.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000127', 'SP000127', 's146 sdp 20.000mh', 170000, 800000, 'Hoco', 'https://cdn1-retail-images.kiotviet.vn/2026/08/11/maxpromobile/5e619d95666f4ad8af9cf85c6c492b59.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000126', 'SP000126', 'v8+ đế sạc ko dây', 120000, 650000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/11/maxpromobile/cdff72d584ef4698a8bcf83b529528fd.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000125', 'SP000125', '20w c-c ss rẻ', 50000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/08/05/maxpromobile/49b623d4ccd64687a8b9147a715856ca.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000124', 'SP000124', 'Hub tổng hợp 5 in 1', 0, 1000000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/04/maxpromobile/c0954be8441c4253975f1e2767081490.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000123', 'SP000123', 'Dây Apple wacht tổng hợp', 200000, 300000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/08/03/maxpromobile/1d9e0be4fcd546c38548ad643f8a13cf.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000122', 'SP000122', '45w annker', 500000, 1100000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/07/10/maxpromobile/207eeeeeee104cba909f0b418579a059.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000121', 'SP000121', 'cd231 sdp anker', 350000, 900000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/07/10/maxpromobile/42957955378e46a586fd571a1d5794ef.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000120', 'SP000120', '100w dây baseus cc', 100000, 350000, 'Anker', 'https://cdn2-retail-images.kiotviet.vn/2026/07/06/maxpromobile/8dfba51cdde6404d9e546ad795ca9825.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000119', 'SP000119', '20w dây baseus liningt', 300000, 300000, 'Anker', 'https://cdn2-retail-images.kiotviet.vn/2026/07/06/maxpromobile/5ca8927563d84434b5249390cb1cc43e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000118', 'SP000118', 'củ sạc anker 20w', 450000, 450000, 'Anker', 'https://cdn2-retail-images.kiotviet.vn/2026/07/06/maxpromobile/d21b1b6465c6495681864ac2103da774.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000116', 'SP000116', 'hdmi 5m', 100000, 450000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/07/01/maxpromobile/830d8681b89e47a1a2c3a668bafd6b85.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000115', 'SP000115', 'Cáp sạc macbook magsafe3', 550000, 1500000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/06/22/maxpromobile/ea3507124574471cbf6921d1a9158938.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000114', 'SP000114', '87w macbook', 500000, 900000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/06/22/maxpromobile/a2a2d937cf4c4d119d144f0711184557.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000113', 'SP000113', '61w macbook', 350000, 750000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/06/22/maxpromobile/32689754582d4b68911071229b901c78.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000111', 'SP000111', 'ổ cắm du lịch', 0, 350000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/15/maxpromobile/8d2d6cecc441477e9f552c8381ba8ca5.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000110', 'SP000110', 'airtag', 0, 1100000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/07/maxpromobile/3d0be261f5084ff7bfc87a691f67f894.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000109', 'SP000109', 'kích song wifi', 250000, 850000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/06/04/maxpromobile/66fbd36142424015aba43512c2e3a49b.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000108', 'SP000108', 's164 10.000mah', 250000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/06/04/maxpromobile/a57ad1d25e3f41a082b6970ad7099dad.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000107', 'SP000107', 'Dây đeo', 0, 200000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/01/maxpromobile/d98f486877b14d42a6f3e73cd51b02bd.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000106', 'SP000106', 'j79A', 0, 0, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/01/maxpromobile/bdbd015ce04d4c859d8a9d820ff7c0b8.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000105', 'SP000105', 'j79A', 0, 1000000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/01/maxpromobile/fad1aa68727f492abbf26407bd7732d0.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000104', 'SP000104', 'j146', 0, 650000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/06/01/maxpromobile/4370e3f8a2cb40579baf80966e765f8b.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000103', 'SP000103', 'j117a', 350000, 700000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/05/25/maxpromobile/13bce1ddc8b949fe8c4d6caf3fb9dc65.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000102', 'SP000102', 'cường lực gg fixel', 0, 150000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/05/14/maxpromobile/33fa57165ab042b6a6b50c038e2eaf23.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000101', 'SP000101', 'cường lực gg fixel', 0, 150000, NULL, NULL, 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000100', 'SP000100', 'usb 64', 250000, 550000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/05/06/maxpromobile/6dde0e67052340228b112294fea0f02a.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000099', 'SP000099', 'mini fan', 30000, 150000, 'Hoco', 'https://cdn1-retail-images.kiotviet.vn/2026/05/06/maxpromobile/a0d7416a0fbe436d84c2f4ad46107a5a.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000098', 'SP000098', 'q575tk', 450000, 950000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/05/06/maxpromobile/8523b12ed28c4c918c3802c1224efd0f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000096', 'SP000096', 'U139', 200000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/20/maxpromobile/d243fdbeef3b40bcab643a195d41f26b.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000095', 'SP000095', '3 đầu dây vải', 150000, 300000, 'Hoco', 'https://cdn1-retail-images.kiotviet.vn/2026/04/20/maxpromobile/097785d415f34f83b89d9977edad7193.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Vi tính' LIMIT 1), 'SP000094', 'SP000094', 'chuột có dây', 100000, 200000, NULL, 'https://cdn2-retail-images.kiotviet.vn/2026/04/20/maxpromobile/504de280eecd47c8a5d13db68d025b04.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000093', 'SP000093', '128', 400000, 750000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/20/maxpromobile/6c5b59ca862f45539a204301ec54e42f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000092', 'SP000092', 'cường lực androi', 20000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/675a40844da74f78aeb4c9494be3b81e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000091', 'SP000091', 'thẻ 256', 500000, 1000000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/8db3ad9f5ec8405da734ade099cb9612.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000090', 'SP000090', 'thẻ nhớ 64gb', 200000, 500000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/74b2fa1eb06d4fd08d139134d928deff.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000089', 'SP000089', 'usb 16', 100000, 400000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/05/06/maxpromobile/0a44acb558cb43d88e7b915fc59d143c.png', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000088', 'SP000088', 'pdf full đời', 20000, 200000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/1d43757dabd74ccfa6f5f416b758cfad.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000087', 'SP000087', 'dây nguồn nồi cơm', 30000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/d48873e99a254bb48ab8da495b7e8bff.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000086', 'SP000086', 'hdmi 3m', 100000, 350000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/19f3b759891b4e37bbb271eb94434bba.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000085', 'SP000085', 'mắt cam cho ip', 70000, 200000, 'Hoco', 'https://cdn1-retail-images.kiotviet.vn/2026/04/19/maxpromobile/9ca5d00e523d4e0cb29a4fafb315299f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000084', 'SP000084', 'hdmi 1,5 m', 50000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/555e35d05d30488998bb6c17aae70f8a.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000083', 'SP000083', 'cường lực màn cong', 100000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/d0301112030249f3a17c16630a951830.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000082', 'SP000082', 'gm26 quạt tản nhiệt điện thoại', 150000, 350000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/8a88881e5fb7415f98aa9d14953b9d3b.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000081', 'SP000081', 'giá đỡ xe máy +oto', 100000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/bc2b0f34eb8747f9992656d7ab594c94.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000080', 'SP000080', 'cnt 4d', 30000, 350000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/42f13393e5da4d2b8d0901db52b166c5.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000079', 'SP000079', 'cvt full', 20000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/8cc28b666d7642629035266484489f70.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000078', 'SP000078', 'cnt 2d', 20000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/26e50af594b84508837015726cd2b3f0.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000077', 'SP000077', 'sạc dự phòng iphone ko dây', 200000, 600000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/188adb8730a748ec9d1381a4236126a4.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000076', 'SP000076', 'kệ điện thoại', 50000, 200000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/65cae7a026c94d0cac4acf56318fc565.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000075', 'SP000075', '9d full đời', 20000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/266247b40c0b4230ada30d24ae2b7bff.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000074', 'SP000074', 'phát wifi', 550000, 1100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/5a4dc8329472481db3225f7852a1a308.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000073', 'SP000073', 'j79', 250000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/f9f3c44e29d44fcd848caaf826f64e2f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000072', 'SP000072', 'j160b 2000mah ko dây', 450000, 1050000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/a29ffc8cb37f400e907217d7a1e647b1.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000071', 'SP000071', 's144 200mah', 300000, 950000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/ec43865c842a4d3dae55a9b14efd7350.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000070', 'SP000070', 'j132a 2000mah', 400000, 950000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/7548bcc8170941798b3b85c655ff1c05.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000069', 'SP000069', 'thm502', 400000, 750000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/945ef9bd6a0c4ef2aa4260b8c85ba35f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Sạc dự phòng' LIMIT 1), 'SP000068', 'SP000068', 'j141', 350000, 650000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/93fce4f9ea4544a497d2db42e8cfdd2e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000067', 'SP000067', 'túi chống nước', 20000, 100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/3011f3ab7a0c47b1b5c78768b37c421f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000066', 'SP000066', 'ốp lưng trong rẻ', 20000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/19/maxpromobile/792496e77f2d49c081309be915a3f952.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000065', 'SP000065', 'tai nghe trùm', 300000, 800000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/058c82a6181747c7b9634357e295fe23.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Vi tính' LIMIT 1), 'SP000064', 'SP000064', 'd500', 350000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/044f055fbdd141668473b2df97d4a4cb.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000063', 'SP000063', 'hc34', 200000, 550000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/cd294fd7fce545e3a8ad9c3bc94e3acb.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000062', 'SP000062', 'loa vi tính', 200000, 450000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/83785db9e97f42edbec801493759e695.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000061', 'SP000061', 'hc22', 250000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/3505672ebaa349d9bd1d6c54b6da8e0c.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Gậy tự sướng' LIMIT 1), 'SP000060', 'SP000060', '3388', 200000, 500000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/07bc44db9e1f48c4bb1578320a448d1e.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Gậy tự sướng' LIMIT 1), 'SP000059', 'SP000059', 'p185', 250000, 600000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/044c313db99e4da885324375e8b9f431.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000058', 'SP000058', 'power supply 12v', 50000, 200000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/0078cffd19c5498b9b8cf8159d5820d8.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000057', 'SP000057', 'Cáp sạc macbook', 200000, 500000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/b7be0bacbebb42a3a2dbbfcc3847d959.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000056', 'SP000056', 'adaptor all in one ko có cổng sạc', 100000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/209af9cbbfd74a1d9e91e6cd8f0b6985.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000055', 'SP000055', 'adaptor all in one 6a', 250000, 650000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/76fb798e81e3463fac31fe5c35ce8f98.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000054', 'SP000054', 'ốp ipad', 150000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/1b592fe6d0af4d80bd4eb583e32ebb17.png', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cường lực' LIMIT 1), 'SP000053', 'SP000053', 'cường lực ipad full', 50000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/b85a538e0f1c473b813fe000b512c1aa.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000052', 'SP000052', '35w', 100000, 350000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/c92b641380494d229dfc4e193fc1a24d.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000051', 'SP000051', 'n1 mic go check', 300000, 1200000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/ed3570bd979e4e039f17a818af51a804.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện' LIMIT 1), 'SP000050', 'SP000050', 'kệ macbook', 200000, 400000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/4768875a0ee843a38f15e6b0f073434a.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000049', 'SP000049', 'củ 2-3', 20000, 100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/6f5d3ceb38b7421394b926e0273af9f2.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000048', 'SP000048', 'Pin cmos cr2032', 20000, 100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/8a01e0169b1e426cbd433a40ae2ee9e0.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000047', 'SP000047', 'dây c rẻ', 20000, 100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/61b45fc3c7a54606bbc98a92fd4b272f.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000046', 'SP000046', 'dây micro rẻ', 20000, 100000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/171ab61c49a14b8684df8796fc2d3c3a.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000045', 'SP000045', 'củ rẻ usb ip+ss', 50000, 150000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/9d5a1048784d413d80774e1a9ab07863.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000044', 'SP000044', '2m 5a ss rin', 150000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/b1a51569263449bcbaf256e1d1281631.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000043', 'SP000043', '20w rin ip', 200000, 450000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/595fb908988e4f85b3ef1a5aa0ed44e8.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000042', 'SP000042', '20w rin c-c', 200000, 450000, 'Apple', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/a5ebd80e87454f07be4387bda95d7acd.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000041', 'SP000041', '20w rin ip linghning', 150000, 350000, 'Apple', 'https://cdn1-retail-images.kiotviet.vn/2026/04/18/maxpromobile/3dd6e1d9b4674e8888f899d981bba0bf.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000040', 'SP000040', 'củ ss rin usb', 100000, 250000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/fc019ff55dd944c587a2ce977973efe6.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000039', 'SP000039', '45w ss rin', 250000, 500000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/bc8c96d851a3402bad2d855c322b9363.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)
VALUES ((SELECT id FROM categories WHERE name='Cáp sạc' LIMIT 1), 'SP000038', 'SP000038', '20w ss rin', 150000, 300000, 'Hoco', 'https://cdn2-retail-images.kiotviet.vn/2026/04/18/maxpromobile/bef8e35a05ad44c9ba275224bd778512.jpeg', 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;

-- 3. KHỞI TẠO TỒN KHO CHO CÁC CHI NHÁNH HIỆN CÓ
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000140'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 13 FROM stores s CROSS JOIN products p WHERE p.sku='SP000139'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000138'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 14 FROM stores s CROSS JOIN products p WHERE p.sku='SP000137'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 8 FROM stores s CROSS JOIN products p WHERE p.sku='SP000136'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 7 FROM stores s CROSS JOIN products p WHERE p.sku='SP000135'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000134'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 30 FROM stores s CROSS JOIN products p WHERE p.sku='SP000133'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000132'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000131'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000130'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000129'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000128'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 7 FROM stores s CROSS JOIN products p WHERE p.sku='SP000127'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000126'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 20 FROM stores s CROSS JOIN products p WHERE p.sku='SP000125'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000124'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 24 FROM stores s CROSS JOIN products p WHERE p.sku='SP000123'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000122'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 18 FROM stores s CROSS JOIN products p WHERE p.sku='SP000121'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000120'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000119'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000118'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 6 FROM stores s CROSS JOIN products p WHERE p.sku='SP000116'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000115'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000114'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000113'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 15 FROM stores s CROSS JOIN products p WHERE p.sku='SP000111'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000110'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000109'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 18 FROM stores s CROSS JOIN products p WHERE p.sku='SP000108'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 10 FROM stores s CROSS JOIN products p WHERE p.sku='SP000107'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000106'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000105'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000104'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 10 FROM stores s CROSS JOIN products p WHERE p.sku='SP000103'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 17 FROM stores s CROSS JOIN products p WHERE p.sku='SP000102'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000101'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 9 FROM stores s CROSS JOIN products p WHERE p.sku='SP000100'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000099'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000098'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 7 FROM stores s CROSS JOIN products p WHERE p.sku='SP000096'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 9 FROM stores s CROSS JOIN products p WHERE p.sku='SP000095'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 10 FROM stores s CROSS JOIN products p WHERE p.sku='SP000094'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 19 FROM stores s CROSS JOIN products p WHERE p.sku='SP000093'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 172 FROM stores s CROSS JOIN products p WHERE p.sku='SP000092'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 20 FROM stores s CROSS JOIN products p WHERE p.sku='SP000091'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000090'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000089'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 100 FROM stores s CROSS JOIN products p WHERE p.sku='SP000088'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000087'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 5 FROM stores s CROSS JOIN products p WHERE p.sku='SP000086'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 54 FROM stores s CROSS JOIN products p WHERE p.sku='SP000085'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 12 FROM stores s CROSS JOIN products p WHERE p.sku='SP000084'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 9 FROM stores s CROSS JOIN products p WHERE p.sku='SP000083'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000082'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 6 FROM stores s CROSS JOIN products p WHERE p.sku='SP000081'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 144 FROM stores s CROSS JOIN products p WHERE p.sku='SP000080'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 215 FROM stores s CROSS JOIN products p WHERE p.sku='SP000079'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 371 FROM stores s CROSS JOIN products p WHERE p.sku='SP000078'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 4 FROM stores s CROSS JOIN products p WHERE p.sku='SP000077'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000076'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 505 FROM stores s CROSS JOIN products p WHERE p.sku='SP000075'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000074'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000073'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000072'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000071'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000070'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000069'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000068'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000067'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 147 FROM stores s CROSS JOIN products p WHERE p.sku='SP000066'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000065'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000064'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000063'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000062'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000061'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 3 FROM stores s CROSS JOIN products p WHERE p.sku='SP000060'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 4 FROM stores s CROSS JOIN products p WHERE p.sku='SP000059'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 4 FROM stores s CROSS JOIN products p WHERE p.sku='SP000058'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000057'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000056'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000055'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 6 FROM stores s CROSS JOIN products p WHERE p.sku='SP000054'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 4 FROM stores s CROSS JOIN products p WHERE p.sku='SP000053'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 0 FROM stores s CROSS JOIN products p WHERE p.sku='SP000052'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000051'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000050'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 147 FROM stores s CROSS JOIN products p WHERE p.sku='SP000049'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 44 FROM stores s CROSS JOIN products p WHERE p.sku='SP000048'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 10 FROM stores s CROSS JOIN products p WHERE p.sku='SP000047'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 13 FROM stores s CROSS JOIN products p WHERE p.sku='SP000046'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 23 FROM stores s CROSS JOIN products p WHERE p.sku='SP000045'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 1 FROM stores s CROSS JOIN products p WHERE p.sku='SP000044'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 23 FROM stores s CROSS JOIN products p WHERE p.sku='SP000043'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 4 FROM stores s CROSS JOIN products p WHERE p.sku='SP000042'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 15 FROM stores s CROSS JOIN products p WHERE p.sku='SP000041'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000040'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 2 FROM stores s CROSS JOIN products p WHERE p.sku='SP000039'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
INSERT INTO inventories (store_id, product_id, quantity)
SELECT s.id, p.id, 6 FROM stores s CROSS JOIN products p WHERE p.sku='SP000038'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

SET FOREIGN_KEY_CHECKS=1;
