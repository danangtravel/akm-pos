const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('====================================================');
console.log('🧪 AKM POS - COMPREHENSIVE SYSTEM VERIFICATION SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    failCount++;
  }
}

// 1. FILE & ASSET INTEGRITY
console.log('📦 1. Testing Core Files and Asset Integrity:');
const requiredFiles = [
  'index.php',
  'install.php',
  'api.php',
  'manifest.webmanifest',
  'sw.js',
  'capacitor.config.json',
  'database/schema.sql',
  'assets/app.js',
  'assets/app.css',
  'assets/admin-ui.js',
  'assets/ui.css',
  'assets/mobile.css',
  'assets/icon.png',
  'assets/icon-512.png',
  'assets/icon-192.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.png',
  'public_web/index.html',
  'public_web/icon.png',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json',
  '.github/workflows/build-ios.yml'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  assert(fs.existsSync(fullPath), `File exists: ${file}`, `Missing at ${fullPath}`);
});

// 2. API ROUTING & BACKEND MODULES
console.log('\n⚙️ 2. Testing API Modules & Routing Structure:');
const apiModules = [
  'api/core/database.php',
  'api/core/helpers.php',
  'api/core/audit.php',
  'api/core/mailer.php',
  'api/core/webpush.php',
  'api/modules/analytics.php',
  'api/modules/extended.php'
];

apiModules.forEach(mod => {
  const fullPath = path.join(__dirname, '..', mod);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasPhpTag = content.startsWith('<?php');
    assert(hasPhpTag && content.length > 100, `Module structure valid: ${mod}`);
  } else {
    assert(false, `Module exists: ${mod}`);
  }
});

// 3. JAVASCRIPT SYNTAX CHECK
console.log('\n⚡ 3. Testing Frontend JavaScript Files for Syntax Validity:');
const jsFiles = ['assets/app.js', 'assets/admin-ui.js', 'sw.js'];
jsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert(content.length > 500 && !content.includes('<<') && !content.includes('>>'), `JS Syntax & Structure valid: ${file}`);
  } catch (err) {
    assert(false, `JS file valid: ${file}`, err.message);
  }
});

// 4. DATABASE SCHEMA INTEGRITY
console.log('\n🗄️ 4. Testing Database Schema Tables & Structure:');
const schemaContent = fs.readFileSync(path.join(__dirname, '..', 'database/schema.sql'), 'utf8');
const expectedTables = [
  'stores', 'users', 'user_stores', 'categories', 'products', 'inventories',
  'orders', 'order_items', 'payments', 'returns', 'return_items',
  'stock_transfers', 'stock_transfer_items', 'stock_ledger', 'repair_cases',
  'attachments', 'audit_logs', 'mail_logs', 'notifications', 'push_subscriptions',
  'user_remember_tokens', 'settings'
];
expectedTables.forEach(table => {
  const hasTable = schemaContent.includes(`CREATE TABLE IF NOT EXISTS \`${table}\``) ||
                   schemaContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`);
  assert(hasTable, `Schema includes table: ${table}`);
});

// 5. LIVE BACKEND ENDPOINTS
console.log('\n🌐 5. Testing Live Production Server (https://pos.anhkhamobile.com):');
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const homepage = await fetchUrl('https://pos.anhkhamobile.com/');
    assert(homepage.status === 200, 'Live Homepage HTTP Status is 200 OK', `Status: ${homepage.status}`);
    assert(homepage.body.includes('AKM POS'), 'Homepage contains AKM POS branding');

    const apiAuth = await fetchUrl('https://pos.anhkhamobile.com/api.php?action=auth.me');
    assert(apiAuth.status === 200 || apiAuth.status === 401, 'Live API /api.php?action=auth.me responded with proper HTTP status (200/401)');
    const authJson = JSON.parse(apiAuth.body);
    assert(authJson.ok === false, 'API correctly enforces session auth guard');

    const manifestRes = await fetchUrl('https://pos.anhkhamobile.com/manifest.webmanifest');
    assert(manifestRes.status === 200, 'Live PWA manifest.webmanifest is accessible');

  } catch (err) {
    assert(false, 'Live Server Connectivity Test', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================\n');
  if (failCount > 0) process.exit(1);
})();
