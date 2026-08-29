# Run this script as Administrator:
#   Right-click PowerShell → Run as administrator
#   cd "E:\2sri nokri\shawn"
#   .\scripts\enable-mongodb-replica.ps1

$ErrorActionPreference = "Stop"

$cfgPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"
if (-not (Test-Path $cfgPath)) {
    Write-Error "MongoDB config not found at $cfgPath"
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "This script must edit C:\Program Files\MongoDB\...\mongod.cfg" -ForegroundColor Yellow
    Write-Host "Cursor's terminal is NOT Administrator. Use one of these options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option A — Admin PowerShell (recommended for Compass on port 27017):" -ForegroundColor Cyan
    Write-Host "  1. Press Windows key, type PowerShell"
    Write-Host "  2. Right-click Windows PowerShell -> Run as administrator"
    Write-Host "  3. cd `"E:\2sri nokri\shawn`""
    Write-Host "  4. .\scripts\enable-mongodb-replica.ps1"
    Write-Host ""
    Write-Host "  Or right-click scripts\setup-mongodb-admin.bat -> Run as administrator"
    Write-Host ""
    Write-Host "Option B — No admin (dev MongoDB on port 27018):" -ForegroundColor Cyan
    Write-Host "  .\scripts\start-mongodb-dev.ps1"
    Write-Host "  Then update DATABASE_URL in .env to port 27018 and run npm run db:setup"
    Write-Host ""
    exit 1
}

$content = Get-Content $cfgPath -Raw
if ($content -match 'replSetName:\s*rs0') {
    Write-Host "Replica set already configured in mongod.cfg"
} else {
    $content = $content -replace '#replication:', "replication:`r`n  replSetName: rs0"
    Set-Content -Path $cfgPath -Value $content -Encoding UTF8
    Write-Host "Added replication.replSetName: rs0 to mongod.cfg"
}

Write-Host "Restarting MongoDB service..."
Restart-Service MongoDB
Start-Sleep -Seconds 4

$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
    npm run db:init-replica
    Write-Host ""
    Write-Host "Waiting for replica set primary..."
    Start-Sleep -Seconds 5
    npm run db:seed
    Write-Host ""
    Write-Host "Done. Login: admin@letsgobuffalo.com / Demo123!"
} finally {
    Pop-Location
}
