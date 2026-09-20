const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const zipPath = path.join(rootDir, 'AKM_POS_cPanel_Ready.zip');

// Backup old zip if needed
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const filesToInclude = [
  'api/core/audit.php',
  'api/core/auth.php',
  'api/core/boot.php',
  'api/core/database.php',
  'api/core/helpers.php',
  'api/core/mailer.php',
  'api/core/stock_engine.php',
  'api/core/webpush.php',
  'api/modules/analytics.php',

  'api/modules/backup.php',
  'api/modules/demo.php',
  'api/modules/extended.php',
  'api/modules/notifications.php',
  'assets/admin-ui.js',
  'assets/app.css',
  'assets/app.js',
  'assets/icon.svg',
  'assets/icon.png',
  'assets/icon-512.png',
  'assets/icon-192.png',
  'assets/apple-touch-icon.png',
  'assets/favicon.png',
  'assets/mobile.css',
  'assets/mountain-bg.svg',
  'assets/ui.css',
  'backups/.htaccess',
  'config/.htaccess',
  'config/config.example.php',
  'cron/bootstrap.php',
  'cron/cron_autobackup.php',
  'cron/cron_daily_report.php',
  'cron/cron_repair_reminders.php',
  'cron/cron_slow_moving.php',
  'database/schema.sql',
  'database/demo_data.sql',
  'database/import_template.csv',
  'database/products_kv_seed.sql',
  'database/Products_KV.csv',
  'sessions/.htaccess',
  'sessions/index.html',
  'uploads/.htaccess',
  '.htaccess',
  'api.php',
  'DEPLOYMENT_CHECKLIST.md',
  'index.php',
  'install.php',
  'manifest.webmanifest',
  'README.md',
  'DESIGN.md',
  'sw.js'
];

console.log('Packing', filesToInclude.length, 'files into AKM_POS_cPanel_Ready.zip...');

// Check all files exist
for (const rel of filesToInclude) {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) {
    console.error('Missing file:', rel);
    process.exit(1);
  }
}

// Use powershell to create zip archive
const psScript = `
Add-Type -AssemblyName System.IO.Compression;
Add-Type -AssemblyName System.IO.Compression.FileSystem;

$zipFile = '${zipPath.replace(/\\/g, '\\\\')}';
$zip = [System.IO.Compression.ZipFile]::Open($zipFile, [System.IO.Compression.ZipArchiveMode]::Create);

$files = @(
${filesToInclude.map(f => `  '${f.replace(/\//g, '\\\\')}'`).join(',\n')}
);

$root = '${rootDir.replace(/\\/g, '\\\\')}';

foreach ($rel in $files) {
    $full = Join-Path $root $rel;
    $entryName = $rel.Replace('\\\\', '/');
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null;
}

$zip.Dispose();
Write-Host 'Zip packaging completed successfully.';
`;

const tempPs = path.join(__dirname, 'temp_pack.ps1');
fs.writeFileSync(tempPs, psScript, 'utf8');

try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs}"`, { stdio: 'inherit' });
  fs.unlinkSync(tempPs);
  const stats = fs.statSync(zipPath);
  console.log(`Success! ${zipPath} size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (e) {
  console.error('Packing failed:', e.message);
  process.exit(1);
}
