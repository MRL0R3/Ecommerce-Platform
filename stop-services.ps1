# Stop Script for E-Commerce Platform
$baseDir = "C:\Users\LOQ\ecommerce-platform"
$pidFile = "$baseDir\logs\services.pids"

if (Test-Path $pidFile) {
    $lines = Get-Content $pidFile
    foreach ($line in $lines) {
        if ($line -match "^(\d+):(.*):(\d+)$") {
            $pidToKill = $matches[1]
            $name = $matches[2]
            Write-Host "Stopping $name (PID $pidToKill)..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# Also kill any orphaned java processes running our jars
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*ecommerce*2.0.0.jar*" } | ForEach-Object {
    Write-Host "Stopping orphaned java process $($_.ProcessId)..." -ForegroundColor Red
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "All services stopped." -ForegroundColor Green
