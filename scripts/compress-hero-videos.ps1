# Compress the two hero videos with VP9 to roughly 3–5 MB each while keeping
# the audio track. Run this once from the project root:
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\compress-hero-videos.ps1
#
# Prereq: ffmpeg must be on PATH. Fastest install on Windows:
#   winget install --id Gyan.FFmpeg
# or download a static build from https://www.gyan.dev/ffmpeg/builds/ and add
# the `bin` folder to PATH.

$ErrorActionPreference = "Stop"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "ffmpeg is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install with:" -ForegroundColor Yellow
    Write-Host "  winget install --id Gyan.FFmpeg"
    Write-Host "or grab a static build from https://www.gyan.dev/ffmpeg/builds/"
    exit 1
}

$sourceDesktop = "public\WOMP_Short_4K.webm"
$sourceMobile  = "public\WOMP_Short_Vertical1_4K-2.webm"

if (-not (Test-Path $sourceDesktop)) { Write-Error "Missing $sourceDesktop"; exit 1 }
if (-not (Test-Path $sourceMobile))  { Write-Error "Missing $sourceMobile";  exit 1 }

# Rename in place — we compress into new temp files then swap, so the URLs
# referenced from Index.tsx keep working without a code change.
$tmpDesktop = "public\WOMP_Short_4K.compressed.webm"
$tmpMobile  = "public\WOMP_Short_Vertical1_4K-2.compressed.webm"

Write-Host ""
Write-Host "Compressing DESKTOP hero (target ~4 MB, 1920p, keep audio)..." -ForegroundColor Cyan
# CRF 34 is a solid quality-vs-size trade-off for VP9 background video.
# -deadline good balances speed and compression. -cpu-used 2 = quality bias.
# Opus audio at 96k is transparent for spoken word / music beds.
ffmpeg -y -i $sourceDesktop `
    -c:v libvpx-vp9 -crf 34 -b:v 0 `
    -vf "scale='min(1920,iw)':-2" `
    -deadline good -cpu-used 2 -row-mt 1 `
    -c:a libopus -b:a 96k `
    -movflags +faststart `
    $tmpDesktop

Write-Host ""
Write-Host "Compressing MOBILE hero (target ~2.5 MB, 720p vertical, keep audio)..." -ForegroundColor Cyan
ffmpeg -y -i $sourceMobile `
    -c:v libvpx-vp9 -crf 34 -b:v 0 `
    -vf "scale=-2:'min(1280,ih)'" `
    -deadline good -cpu-used 2 -row-mt 1 `
    -c:a libopus -b:a 96k `
    -movflags +faststart `
    $tmpMobile

# Swap: keep the originals as .original.webm for a rollback safety net.
Write-Host ""
Write-Host "Swapping files (originals kept as *.original.webm)..." -ForegroundColor Green
Move-Item -Force $sourceDesktop "public\WOMP_Short_4K.original.webm"
Move-Item -Force $sourceMobile  "public\WOMP_Short_Vertical1_4K-2.original.webm"
Move-Item -Force $tmpDesktop    $sourceDesktop
Move-Item -Force $tmpMobile     $sourceMobile

Write-Host ""
Write-Host "Done. New sizes:" -ForegroundColor Green
Get-Item $sourceDesktop, $sourceMobile | Select-Object Name, @{n="Size(MB)"; e={[math]::Round($_.Length/1MB, 2)}}
Write-Host ""
Write-Host "If quality looks bad, delete the compressed files and restore:" -ForegroundColor Yellow
Write-Host "  Move-Item -Force public\WOMP_Short_4K.original.webm public\WOMP_Short_4K.webm"
Write-Host "  Move-Item -Force public\WOMP_Short_Vertical1_4K-2.original.webm public\WOMP_Short_Vertical1_4K-2.webm"
