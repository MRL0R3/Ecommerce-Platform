#!/bin/bash

# E-Commerce Microservices Platform - Stop Script
# Stops all running services started by start-dev.sh
#
# For Windows users: Use Git Bash or WSL to run this script
# Alternatively, use Task Manager to kill Java processes


echo "=========================================="
echo "Stopping E-Commerce Microservices Platform"
echo "=========================================="
echo ""

# Check if we have stored PIDs
if [ -f ./logs/services.pid ]; then
    echo "Stopping services..."
    
    # Read PIDs and kill them
    while IFS=':' read -r pid service port; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service (PID: $pid)..."
            kill $pid 2>/dev/null
            # Wait a bit for graceful shutdown
            sleep 2
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
                echo "  Force killed $service"
            else
                echo "  Stopped $service"
            fi
        fi
    done < ./logs/services.pid
    
    # Clean up
    rm -f ./logs/services.pid
    rm -f ./logs/*.log
    
    echo ""
    echo "All services stopped."
else
    echo "No running services found (or services were not started with start-dev.sh)"
    echo ""
    echo "Attempting to find and kill Java processes on service ports..."
    
    # Try to find and kill processes on known ports
    PORTS=(8761 8888 8080 8081 8082 8084 8083 3000)
    
    for port in "${PORTS[@]}"; do
        # Find PID using port (Linux/Mac)
        PID=$(lsof -ti :$port 2>/dev/null | head -1)
        if [ -n "$PID" ]; then
            echo "Found process on port $port (PID: $PID), killing..."
            kill $PID 2>/dev/null
            sleep 1
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID 2>/dev/null
            fi
        fi
    done
    
    echo ""
    echo "Cleanup complete."
fi

echo ""
echo "=========================================="
echo "Platform stopped."
echo "To start again: ./start-dev.sh"
echo "=========================================="
