# Start MongoDB with replica set — NO Administrator required.
# Uses a project-local data folder and port 27018 (avoids the Windows service on 27017).
#
# Usage (normal PowerShell):
#   cd "E:\2sri nokri\shawn"
#   .\scripts\start-mongodb-dev.ps1

$ErrorActionPreference = "Stop"

$mongodCandidates = @(
  "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
  "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
  "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
)

$mongod = $mongodCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $mongod) {
  Write-Error "mongod.exe not found. Install MongoDB or adjust paths in start-mongodb-dev.ps1"
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$dataPath = Join-Path $projectRoot ".mongodb-dev"
$logPath = Join-Path $dataPath "mongod.log"
$port = 27018

New-Item -ItemType Directory -Force -Path $dataPath | Out-Null

$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "MongoDB dev instance already listening on port $port."
} else {
  Write-Host "Starting MongoDB with replica set on port $port..."
  Start-Process -FilePath $mongod -ArgumentList @(
    "--replSet", "rs0",
    "--port", "$port",
    "--dbpath", "`"$dataPath`"",
    "--bind_ip", "127.0.0.1",
    "--logpath", "`"$logPath`""
  ) -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

$uri = "mongodb://127.0.0.1:$port"
Write-Host "Initializing replica set (if needed)..."
Push-Location $projectRoot
try {
  $env:DATABASE_URL = "$uri/letsgobuffalo?directConnection=true"
  for ($i = 1; $i -le 5; $i++) {
    npm run db:init-replica
    if ($LASTEXITCODE -eq 0) { break }
    Write-Host "Retrying replica init ($i/5)..."
    Start-Sleep -Seconds 2
  }
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not initialize replica set on port $port"
  }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Dev MongoDB is ready."
Write-Host "Update .env DATABASE_URL to:"
Write-Host "  DATABASE_URL=`"mongodb://127.0.0.1:$port/letsgobuffalo?directConnection=true`""
Write-Host ""
Write-Host "Then run: npm run db:setup"
