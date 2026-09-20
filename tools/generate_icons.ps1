Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\TDCOMPUTER\.gemini\antigravity-ide\brain\02f52132-63eb-4718-8797-57bf0e1590ba\akm_pos_icon_1789901171139.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Save-ResizedPng($targetPath, $width, $height) {
    $parentDir = Split-Path -Parent $targetPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
    }
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $width, $height)
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $targetPath ($width x $height)"
}

Save-ResizedPng "f:\Antigravity\AKM POS\ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png" 1024 1024
Save-ResizedPng "f:\Antigravity\AKM POS\assets\icon.png" 1024 1024
Save-ResizedPng "f:\Antigravity\AKM POS\assets\icon-512.png" 512 512
Save-ResizedPng "f:\Antigravity\AKM POS\assets\icon-192.png" 192 192
Save-ResizedPng "f:\Antigravity\AKM POS\assets\apple-touch-icon.png" 180 180
Save-ResizedPng "f:\Antigravity\AKM POS\assets\favicon.png" 64 64
Save-ResizedPng "f:\Antigravity\AKM POS\public_web\icon.png" 512 512

$srcImg.Dispose()
Write-Host "All icons generated successfully!"
