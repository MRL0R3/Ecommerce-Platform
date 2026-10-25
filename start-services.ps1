# PowerShell Startup Script for E-Commerce Platform
$ErrorActionPreference = "SilentlyContinue"

$baseDir = "C:\Users\LOQ\ecommerce-platform"
$javaExe = "C:\Users\LOQ\tools\jdk-17.0.19+10\bin\java.exe"
$npmCmd  = "C:\Program Files\nodejs\npm.cmd"

Set-Location $baseDir

New-Item -ItemType Directory -Path "$baseDir\logs" -Force | Out-Null
$pidFile = "$baseDir\logs\services.pids"
"" > $pidFile

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Starting E-Commerce Platform Microservices" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$services = @(
    @{ Name = "eureka-server"; Jar = "eureka-server\target\eureka-server-2.0.0.jar"; Port = 8761; Profile = "dev" },
    @{ Name = "config-server"; Jar = "config-server\target\config-server-2.0.0.jar"; Port = 8888; Profile = "dev,native" },
    @{ Name = "auth-service"; Jar = "auth-service\target\auth-service-2.0.0.jar"; Port = 8081; Profile = "dev" },
    @{ Name = "product-service"; Jar = "product-service\target\product-service-2.0.0.jar"; Port = 8082; Profile = "dev" },
    @{ Name = "inventory-service"; Jar = "inventory-service\target\inventory-service-2.0.0.jar"; Port = 8084; Profile = "dev" },
    @{ Name = "order-service"; Jar = "order-service\target\order-service-2.0.0.jar"; Port = 8083; Profile = "dev" },
    @{ Name = "api-gateway"; Jar = "api-gateway\target\api-gateway-2.0.0.jar"; Port = 8080; Profile = "dev" }
)

foreach ($s in $services) {
    Write-Host "Starting $($s.Name) on port $($s.Port)..." -ForegroundColor Yellow
    $logFile = "$baseDir\logs\$($s.Name).log"
    $jarPath = "$baseDir\$($s.Jar)"
    
    $proc = Start-Process -FilePath $javaExe -ArgumentList "-Xms48m", "-Xmx160m", "-jar", "`"$jarPath`"", "--spring.profiles.active=$($s.Profile)" -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru -WindowStyle Hidden
    
    "$($proc.Id):$($s.Name):$($s.Port)" | Out-File -FilePath $pidFile -Append
    Start-Sleep -Seconds 2
}

# Start Frontend
Write-Host "Starting Frontend (Vite) on port 3000..." -ForegroundColor Yellow
$frontendLog = "$baseDir\logs\admin-dashboard.log"
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$npmCmd`" run dev -- --host --port 3000" -WorkingDirectory "$baseDir\admin-dashboard" -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendLog -PassThru -WindowStyle Hidden

"$($frontendProc.Id):admin-dashboard:3000" | Out-File -FilePath $pidFile -Append

Write-Host "`nAll processes initiated! Check logs in $baseDir\logs" -ForegroundColor Green
