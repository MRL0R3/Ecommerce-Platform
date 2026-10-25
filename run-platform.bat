@echo off
title E-Commerce Platform Launcher
cd /d "C:\Users\LOQ\ecommerce-platform"

echo ===================================================
echo   Starting E-Commerce Microservices and Dashboard
echo ===================================================

set JAVA_CMD="C:\Users\LOQ\tools\jdk-17.0.19+10\bin\java.exe"

echo [1/8] Starting Eureka Server (8761)...
start "Eureka-Server" /min %JAVA_CMD% -Xms48m -Xmx160m -jar eureka-server\target\eureka-server-2.0.0.jar --spring.profiles.active=dev
ping 127.0.0.1 -n 3 >nul

echo [2/8] Starting Config Server (8888)...
start "Config-Server" /min %JAVA_CMD% -Xms48m -Xmx160m -jar config-server\target\config-server-2.0.0.jar --spring.profiles.active=dev,native
ping 127.0.0.1 -n 2 >nul

echo [3/8] Starting Auth Service (8081)...
start "Auth-Service" /min %JAVA_CMD% -Xms48m -Xmx160m -jar auth-service\target\auth-service-2.0.0.jar --spring.profiles.active=dev

echo [4/8] Starting Product Service (8082)...
start "Product-Service" /min %JAVA_CMD% -Xms48m -Xmx160m -jar product-service\target\product-service-2.0.0.jar --spring.profiles.active=dev

echo [5/8] Starting Inventory Service (8084)...
start "Inventory-Service" /min %JAVA_CMD% -Xms48m -Xmx160m -jar inventory-service\target\inventory-service-2.0.0.jar --spring.profiles.active=dev

echo [6/8] Starting Order Service (8083)...
start "Order-Service" /min %JAVA_CMD% -Xms48m -Xmx160m -jar order-service\target\order-service-2.0.0.jar --spring.profiles.active=dev
ping 127.0.0.1 -n 2 >nul

echo [7/8] Starting API Gateway (8080)...
start "API-Gateway" /min %JAVA_CMD% -Xms48m -Xmx160m -jar api-gateway\target\api-gateway-2.0.0.jar --spring.profiles.active=dev

echo [8/8] Starting Frontend Dashboard (3000)...
cd admin-dashboard
start "Admin-Dashboard" /min cmd.exe /c "npm.cmd run dev -- --host --port 3000"
cd ..

echo.
echo ===================================================
echo   All 8 Services Running!
echo   Frontend Dashboard: http://localhost:3000
echo   Eureka Registry:    http://localhost:8761
echo   API Gateway:        http://localhost:8080
echo ===================================================
echo.
ping 127.0.0.1 -n 3 >nul
start http://localhost:3000
