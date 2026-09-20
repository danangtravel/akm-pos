const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ps = `
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$zip = [System.IO.Compression.ZipFile]::OpenRead('AKM_POS_cPanel_Ready.zip');
foreach ($e in $zip.Entries) {
    Write-Host ('{0,-35} ({1} bytes)' -f $e.FullName, $e.Length)
}
$zip.Dispose();
`;

const tempPs = path.join(__dirname, 'temp_verify.ps1');
fs.writeFileSync(tempPs, ps, 'utf8');
try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs}"`, { stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempPs)) fs.unlinkSync(tempPs);
}
