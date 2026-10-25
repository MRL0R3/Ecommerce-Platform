@echo off
echo Stopping E-Commerce Platform...
taskkill /F /FI "WINDOWTITLE eq Eureka-Server*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Config-Server*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Auth-Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Product-Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Inventory-Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Order-Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq API-Gateway*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Admin-Dashboard*" /T >nul 2>&1
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*ecommerce*2.0.0.jar*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1
echo All services stopped.
