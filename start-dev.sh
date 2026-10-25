#!/bin/bash

# E-Commerce Microservices Platform - Start Script (Local Dev with H2)
# This script starts all 7 services using H2 in-memory databases
# No PostgreSQL required!
#
# For Windows users: Use Git Bash or WSL to run this script
# Alternatively, start each service manually in separate PowerShell terminals

set -e

echo "=========================================="
echo "Starting E-Commerce Microservices Platform"
echo "=========================================="
echo ""

# Define colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "${RED}Error: Java is not installed or not in PATH${NC}"
    echo "Please install Java 17+ and add to PATH"
    exit 1
fi

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "${RED}Error: Maven is not installed or not in PATH${NC}"
    echo "Please install Maven 3.9+ and add to PATH"
    exit 1
fi

echo "Checking Java version..."
java -version 2>&1 | head -1
echo ""

echo "Checking Maven version..."
mvn -version | head -1
echo ""

# Define services and ports
SERVICES=(
    "eureka-server:8761:dev"
    "config-server:8888:dev,native"
    "api-gateway:8080:dev"
    "auth-service:8081:dev"
    "product-service:8082:dev"
    "inventory-service:8084:dev"
    "order-service:8083:dev"
)

# Start each service in background
echo "Starting services..."
echo ""
mkdir -p ./logs

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service port profile <<< "$service_info"
    
    echo -n "Starting $service on port $port... "
    
    if [ -n "$profile" ]; then
        # Has profile
        mvn -pl $service spring-boot:run -Dspring-boot.run.profiles=$profile > ./logs/$service.log 2>&1 &
    else
        # No profile
        mvn -pl $service spring-boot:run > ./logs/$service.log 2>&1 &
    fi
    
    # Get the PID
    PID=$!
    echo "$PID"
    
    # Store PID and service info
    echo "$PID:$service:$port" >> ./logs/services.pid
    
done

echo ""
echo "${YELLOW}Services are starting up... This may take 30-60 seconds${NC}"
echo ""

# Wait for all services to start
SLEEP_TIME=45
for ((i=1; i<=$SLEEP_TIME; i++)); do
    echo -n "."
    sleep 1
done
echo ""
echo ""

echo "Starting Admin Dashboard..."
cd admin-dashboard
npm run dev > ../logs/admin-dashboard.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID"
echo "$FRONTEND_PID:admin-dashboard:3000" >> ../logs/services.pid
cd ..

# Check which services are running
echo "Checking service status..."
echo ""

ALL_RUNNING=true
for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service port profile <<< "$service_info"
    
    if nc -z localhost $port 2>/dev/null; then
        echo "${GREEN}✓${NC} $service: http://localhost:$port"
    else
        echo "${YELLOW}✗${NC} $service: http://localhost:$port (not responding)"
        ALL_RUNNING=false
    fi
done

# Check Frontend
if nc -z localhost 3000 2>/dev/null; then
    echo "${GREEN}✓${NC} admin-dashboard: http://localhost:3000"
else
    echo "${YELLOW}✗${NC} admin-dashboard: http://localhost:3000 (not responding)"
    ALL_RUNNING=false
fi

echo ""

if [ "$ALL_RUNNING" = true ]; then
    echo "${GREEN}All services and frontend are running!${NC}"
else
    echo "${YELLOW}Some services may still be starting up. Check logs in ./logs/ ${NC}"
fi

echo ""
echo "=========================================="
echo "Platform Access Points"
echo "=========================================="
echo "Admin Dashboard:      http://localhost:3000"
echo "Eureka Dashboard:     http://localhost:8761"
echo "API Gateway:         http://localhost:8080"
echo "Auth Swagger:        http://localhost:8081/swagger-ui.html"
echo "Product Swagger:     http://localhost:8082/swagger-ui.html"
echo "Inventory Swagger:   http://localhost:8084/swagger-ui.html"
echo "Order Swagger:       http://localhost:8083/swagger-ui.html"
echo ""
echo "=========================================="
echo "To stop all services: ./stop-dev.sh"
echo "=========================================="

# Wait forever to keep background processes alive when run as a daemon
wait
