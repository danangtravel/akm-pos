const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'database', 'Products_KV.csv');
const outPath = path.join(__dirname, '..', 'database', 'products_kv_seed.sql');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function parseVND(str) {
  if (!str) return 0;
  const clean = str.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

function titleCase(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const catMap = {
  'phụ kiện': 'Phụ kiện',
  'cáp sạc': 'Cáp sạc',
  'sạc dự phòng': 'Sạc dự phòng',
  'cường lực': 'Cường lực',
  'vi tính': 'Vi tính',
  'gậy tự sướng': 'Gậy tự sướng'
};

const brandMap = {
  'hoco': 'Hoco',
  'Anker': 'Anker',
  'apple': 'Apple'
};

const categories = ['Phụ kiện', 'Cáp sạc', 'Sạc dự phòng', 'Cường lực', 'Vi tính', 'Gậy tự sướng'];
const products = [];

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  if (parts.length < 5) continue;
  const rawType = parts[0]?.trim();
  const rawCat = parts[1]?.trim().toLowerCase();
  const cat = catMap[rawCat] || titleCase(parts[1]?.trim());
  const sku = parts[2]?.trim();
  const name = parts[3]?.trim();
  const rawBrand = parts[4]?.trim();
  const brand = brandMap[rawBrand] || (rawBrand ? titleCase(rawBrand) : null);
  const price = parseVND(parts[5]?.trim());
  const cost = parseVND(parts[6]?.trim());
  const stock = parseInt(parts[7]?.trim()) || 0;
  let img = parts[8]?.trim();
  if (img) {
    const urls = img.split(/[\s,;]+/).filter(u => u.startsWith('http'));
    img = urls[0] || null;
  } else {
    img = null;
  }
  const dateRaw = parts[9]?.trim();

  products.push({ sku, name, category: cat, brand, price, cost, stock, image: img, date: dateRaw });
}

let sql = '-- =========================================================\n';
sql += '-- Dữ liệu thực tế 100 sản phẩm từ KiotViet (Products_KV.csv)\n';
sql += '-- Hệ thống AKM POS - Đồng bộ Danh mục, Sản phẩm, Tồn kho, Ảnh CDN\n';
sql += '-- =========================================================\n\n';
sql += 'SET NAMES utf8mb4;\n';
sql += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

// 1. Categories
sql += '-- 1. DANH MỤC SẢN PHẨM\n';
categories.forEach((c, idx) => {
  sql += `INSERT INTO categories (name, sort_order, is_active) VALUES (${escapeSql(c)}, ${idx + 1}, 1) ON DUPLICATE KEY UPDATE is_active=1;\n`;
});
sql += '\n';

// 2. Products
sql += '-- 2. DANH SÁCH SẢN PHẨM & ẢNH CDN & GIÁ VỐN & GIÁ BÁN\n';
products.forEach(p => {
  const catSubQuery = `(SELECT id FROM categories WHERE name=${escapeSql(p.category)} LIMIT 1)`;
  sql += `INSERT INTO products (category_id, sku, barcode, name, cost_price, selling_price, brand, image_url, description, allow_discount, is_active)\n`;
  sql += `VALUES (${catSubQuery}, ${escapeSql(p.sku)}, ${escapeSql(p.sku)}, ${escapeSql(p.name)}, ${p.cost}, ${p.price}, ${escapeSql(p.brand)}, ${escapeSql(p.image)}, 'Sản phẩm nhập từ hệ thống KiotViet', 1, 1)\n`;
  sql += `ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name), cost_price=VALUES(cost_price), selling_price=VALUES(selling_price), brand=VALUES(brand), image_url=VALUES(image_url), is_active=1;\n\n`;
});

// 3. Inventories
sql += '-- 3. KHỞI TẠO TỒN KHO CHO CÁC CHI NHÁNH HIỆN CÓ\n';
products.forEach(p => {
  sql += `INSERT INTO inventories (store_id, product_id, quantity)\n`;
  sql += `SELECT s.id, p.id, ${p.stock} FROM stores s CROSS JOIN products p WHERE p.sku=${escapeSql(p.sku)}\n`;
  sql += `ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);\n`;
});

sql += '\nSET FOREIGN_KEY_CHECKS=1;\n';

fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully generated database/products_kv_seed.sql with', products.length, 'products.');
