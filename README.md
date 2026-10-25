# E-Commerce Order Management System — Microservices Platform

Production-grade microservices architecture for e-commerce, built with
Spring Boot 3.2, Spring Cloud 2023, and Java 17.

## What's inside

This project is an **enhanced version** of a base specification (see
[`SPECIFICATION.md`](SPECIFICATION.md) for the gap analysis). It implements
the original 3 business services (Product, Inventory, Order) plus all the
infrastructure a real-world deployment needs.

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **eureka-server** | 8761 | Service registry (Spring Cloud Netflix Eureka) |
| **config-server** | 8888 | Centralized configuration (Spring Cloud Config) |
| **api-gateway** | 8080 | Single entry point + JWT validation (Spring Cloud Gateway) |
| **auth-service** | 8081 | User registration, login, JWT issuance (HS256) |
| **product-service** | 8082 | Product catalog (DDD aggregate: Product) |
| **inventory-service** | 8084 | Stock levels (DDD aggregate: InventoryItem) |
| **order-service** | 8083 | Orders (DDD aggregate: Order) — calls Inventory via Feign + Resilience4j |

### Architecture diagram

```
                      ┌──────────────────────┐
                      │   API Gateway (:8080)│
                      │  (Spring Cloud Gw)   │
                      └──────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Auth Service│         │ Product Svc  │         │  Order Svc   │
│   (:8081)    │         │   (:8082)    │         │   (:8083)    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │ Feign
       │                        │                        │ (Resilience4j)
       │                        ▼                        ▼
       │                 ┌──────────────┐         ┌──────────────┐
       │                 │Inventory Svc │◄────────│ checks stock│
       │                 │   (:8084)    │         └──────────────┘
       │                 └──────┬───────┘
       │                        │
       ▼                        ▼
┌──────────────────────────────────────────┐
│     Eureka Server (:8761)  +  Config     │
│     Server (:8888)  +  Zipkin (:9411)    │
└──────────────────────────────────────────┘
```

## Tech stack

| Concern | Choice |
|---------|--------|
| Language | Java 17 |
| Framework | Spring Boot 3.2, Spring Cloud 2023 |
| Database | PostgreSQL 15 (production), H2 in-memory (development) |
| DB migrations | Flyway |
| API docs | Springdoc OpenAPI 3 (Swagger UI) |
| Testing | JUnit 5, Mockito, AssertJ |
| Security | Spring Security, JWT (jjwt) |
| Inter-service | OpenFeign + Resilience4j (replaces deprecated Hystrix) |
| Observability | Actuator, Micrometer, SLF4J/Logback |

---

# Getting Started

## Prerequisites

### Required Tools
| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ (Temurin recommended) | [Adoptium](https://adoptium.net/) |
| Maven | 3.9.16+ | [Apache Maven](https://maven.apache.org/) |
| Docker | 20.10+ (optional for containerized deployment) | [Docker Desktop](https://www.docker.com/) |

### Environment Setup (Windows)
```bash
# Set JAVA_HOME (Windows-style path)
set JAVA_HOME=C:\Users\LOQ\tools\jdk-17.0.19+10
set MAVEN_HOME=C:\Users\LOQ\tools\apache-maven-3.9.16
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

# Or in PowerShell
$env:JAVA_HOME = "C:\Users\LOQ\tools\jdk-17.0.19+10"
$env:PATH = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:PATH"
```

---

# Running the Project

## Option 1: Local Development (H2 In-Memory - NO DATABASE NEEDED)

This is the **easiest way to get started** - uses H2 in-memory databases, no PostgreSQL required.

### Step 1: Build the project
```bash
# From project root
cd C:\Users\LOQ\ecommerce-platform

# Build all modules (one-time)
mvn clean install -DskipTests
```

### Step 2: Start all services (7 separate terminal windows)

**Terminal 1 - Eureka Server:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl eureka-server spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started EurekaServerApplication`

**Terminal 2 - Config Server:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl config-server spring-boot:run -Dspring-boot.run.profiles=dev,native
```
Wait for: `Started ConfigServerApplication`

**Terminal 3 - API Gateway:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl api-gateway spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started GatewayApplication`

**Terminal 4 - Auth Service:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl auth-service spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started AuthServiceApplication`

**Terminal 5 - Product Service:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl product-service spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started ProductServiceApplication`

**Terminal 6 - Inventory Service:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl inventory-service spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started InventoryServiceApplication`

**Terminal 7 - Order Service:**
```bash
cd C:\Users\LOQ\ecommerce-platform
mvn -pl order-service spring-boot:run -Dspring-boot.run.profiles=dev
```
Wait for: `Started OrderServiceApplication`

### Step 3: Verify all services are running
```bash
# Check all ports
for port in 8761 8888 8080 8081 8082 8084 8083; do
  (echo >/dev/tcp/localhost/$port) 2>/dev/null && echo "Port $port: OPEN" || echo "Port $port: CLOSED"
done
```

All ports should show **OPEN**.

---

## Option 2: Docker Compose (Production-like with PostgreSQL)

### Step 1: Build Docker images
```bash
cd C:\Users\LOQ\ecommerce-platform

# First, build JARs locally
mvn clean package -DskipTests

# Then build Docker images
docker build --build-arg SERVICE=eureka-server -t ecommerce/eureka-server -f Dockerfile.service .
docker build --build-arg SERVICE=config-server -t ecommerce/config-server -f Dockerfile.service .
docker build --build-arg SERVICE=api-gateway -t ecommerce/api-gateway -f Dockerfile.service .
docker build --build-arg SERVICE=auth-service -t ecommerce/auth-service -f Dockerfile.service .
docker build --build-arg SERVICE=product-service -t ecommerce/product-service -f Dockerfile.service .
docker build --build-arg SERVICE=inventory-service -t ecommerce/inventory-service -f Dockerfile.service .
docker build --build-arg SERVICE=order-service -t ecommerce/order-service -f Dockerfile.service .
```

### Step 2: Start the stack
```bash
cd C:\Users\LOQ\ecommerce-platform
docker compose up -d
```

### Step 3: Verify
```bash
docker compose ps
# All 9 containers should be "Up (healthy)"
```

---

## Option 3: Using Start/Stop Scripts (Local Dev)

### Start all services
```bash
# On Linux/Mac or Git Bash
cd C:\Users\LOQ\ecommerce-platform
./start-dev.sh
```

### Stop all services
```bash
./stop-dev.sh
```

---

# Access Points

Once running, access these URLs:

| URL | Service | Description |
|-----|---------|-------------|
| `http://localhost:8761` | Eureka | Service registry dashboard |
| `http://localhost:8080` | API Gateway | Main entry point |
| `http://localhost:8080/actuator/health` | Gateway | Health check |
| `http://localhost:8081/swagger-ui.html` | Auth | Swagger UI |
| `http://localhost:8082/swagger-ui.html` | Product | Swagger UI |
| `http://localhost:8083/swagger-ui.html` | Order | Swagger UI |
| `http://localhost:8084/swagger-ui.html` | Inventory | Swagger UI |
| `http://localhost:8081/h2-console` | Auth | H2 Console (dev only) |
| `http://localhost:8082/h2-console` | Product | H2 Console (dev only) |
| `http://localhost:8083/h2-console` | Order | H2 Console (dev only) |
| `http://localhost:8084/h2-console` | Inventory | H2 Console (dev only) |

**H2 Console Credentials:**
- URL: `http://localhost:<port>/h2-console`
- JDBC URL: `jdbc:h2:mem:<dbname>`
- Username: `sa`
- Password: (leave empty)

---

# API Usage Examples

## Authentication Flow

### Register a new user
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInMs": 3600000,
  "username": "john_doe",
  "role": "USER"
}
```

### Login to get JWT token
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securePassword123"}' | jq -r .token)

echo "Your JWT token: $TOKEN"
```

---

## Product Management

### Create a product (requires JWT)
```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "LAPTOP-PRO-001",
    "name": "Professional Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "currency": "USD",
    "category": "Electronics"
  }'
```

**Required fields:** `sku`, `name`, `price`, `currency`, `category`

**Response:**
```json
{
  "id": "a1b2c3d4-5678-90ef-ghij-klmnopqrstuv",
  "sku": "LAPTOP-PRO-001",
  "name": "Professional Laptop",
  "description": "High-performance laptop for professionals",
  "price": 1299.99,
  "currency": "USD",
  "category": "Electronics",
  "active": false,
  "createdAt": "2026-08-02T10:00:00Z",
  "updatedAt": "2026-08-02T10:00:00Z"
}
```

### List all products (paginated)
```bash
# Get first page (default: 20 items per page)
curl -X GET http://localhost:8080/api/v1/products

# With pagination and filtering
curl -X GET "http://localhost:8080/api/v1/products?page=0&size=10&category=Electronics"
```

### Get a specific product
```bash
PRODUCT_ID="a1b2c3d4-5678-90ef-ghij-klmnopqrstuv"
curl -X GET http://localhost:8080/api/v1/products/$PRODUCT_ID
```

### Update a product
```bash
curl -X PUT http://localhost:8080/api/v1/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Laptop Name",
    "price": 1199.99,
    "active": true
  }'
```

### Delete a product
```bash
curl -X DELETE http://localhost:8080/api/v1/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Inventory Management

### Set stock for a product
```bash
curl -X PUT http://localhost:8080/api/v1/inventory/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 100
  }'
```

**Response:**
```json
{
  "productId": "a1b2c3d4-5678-90ef-ghij-klmnopqrstuv",
  "quantity": 100,
  "reserved": 0,
  "available": 100
}
```

### Get stock for a product
```bash
curl -X GET http://localhost:8080/api/v1/inventory/$PRODUCT_ID
```

---

## Order Management

### Place a new order
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "'$PRODUCT_ID'",
        "quantity": 2
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "x1y2z3a4-5678-90ef-ghij-klmnopqrstuv",
  "customerId": "john_doe",
  "status": "PENDING",
  "totalAmount": 2599.98,
  "currency": "USD",
  "items": [
    {
      "productId": "a1b2c3d4-5678-90ef-ghij-klmnopqrstuv",
      "productName": "Professional Laptop",
      "unitPrice": 1299.99,
      "quantity": 2,
      "subtotal": 2599.98
    }
  ],
  "createdAt": "2026-08-02T10:00:00Z",
  "updatedAt": "2026-08-02T10:00:00Z"
}
```

### Get order by ID
```bash
ORDER_ID="x1y2z3a4-5678-90ef-ghij-klmnopqrstuv"
curl -X GET http://localhost:8080/api/v1/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

### List all orders
```bash
curl -X GET http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

# Complete End-to-End Test

Here's a complete script to test the entire platform:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

# Step 1: Register a user
echo "=== Step 1: Register user ==="
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}')
USERNAME=$(echo $REGISTER_RESPONSE | jq -r .username)
echo "Registered user: $USERNAME"

# Step 2: Login to get token
echo ""
echo "=== Step 2: Login ==="
TOKEN=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' | jq -r .token)
echo "JWT Token: ${TOKEN:0:50}..."

# Step 3: Create a product
echo ""
echo "=== Step 3: Create product ==="
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sku":"TEST-SKU-001","name":"Test Product","description":"A test product","price":99.99,"currency":"USD","category":"Test"}')
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r .id)
echo "Created product: $PRODUCT_ID"

# Step 4: Set inventory
echo ""
echo "=== Step 4: Set inventory ==="
curl -s -X PUT $BASE_URL/api/v1/inventory/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":100}"
echo ""

# Step 5: Place an order
echo "=== Step 5: Place order ==="
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":3}]}")
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r .id)
echo "Created order: $ORDER_ID"

# Step 6: Verify order
echo ""
echo "=== Step 6: Verify order ==="
curl -s -X GET $BASE_URL/api/v1/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== All tests completed successfully! ==="
```

---

# Troubleshooting

## Common Issues

### Port already in use
```bash
# Find and kill the process using the port
# On Linux/Mac:
lsof -i :8080
kill -9 <PID>

# On Windows:
netstat -ano | findstr :8080
 taskkill /PID <PID> /F
```

### Maven build fails
```bash
# Clean and rebuild
mvn clean install -DskipTests

# If dependency resolution issues:
mvn dependency:resolve
```

### Services not registering with Eureka
```bash
# Check Eureka dashboard
# http://localhost:8761

# Verify services are running
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:8084/actuator/health
```

### Docker build fails
```bash
# Ensure Docker Desktop is running
# Clean Docker system
docker system prune -a --volumes

# Rebuild images
docker compose build --no-cache
```

---

# Project structure

```
ecommerce-platform/
├── pom.xml                       # parent POM (multi-module Maven)
├── docker-compose.yml            # bring up everything
├── Dockerfile.service            # generic per-service Dockerfile
├── SPECIFICATION.md              # enhanced spec (gap analysis vs original PDF)
├── .github/workflows/ci.yml      # GitHub Actions: build, test, push images
├── docker/init-databases.sql     # creates the 4 DBs on first start
│
├── common-lib/                   # shared exceptions, error envelope, paged response
├── eureka-server/                # service registry
├── config-server/                # centralized config (native backend)
├── api-gateway/                  # routing + JWT filter
├── auth-service/                 # register, login, JWT issuance
├── product-service/              # catalog bounded context
├── inventory-service/            # inventory bounded context
└── order-service/                # ordering bounded context (Feign + Resilience4j)
```

Each business service follows the same layered (hexagonal) structure:

```
service/
├── src/main/java/com/ecommerce/<svc>/
│   ├── <Svc>Application.java        # @SpringBootApplication entry point
│   ├── config/                      # OpenAPI, Security beans
│   ├── controller/                  # REST controllers (inbound adapters)
│   ├── dto/                         # request/response DTOs
│   ├── domain/                      # JPA entities (aggregate roots) + repositories
│   ├── mapper/                      # MapStruct entity ↔ DTO mappers
│   ├── service/                     # application service layer
│   └── client/  (order only)        # Feign clients
├── src/main/resources/
│   ├── application.yml              # service config
│   ├── application-dev.yml          # H2 in-memory dev config
│   └── db/migration/V1__init.sql    # Flyway migration
└── src/test/java/                   # BDD-named unit tests
```

---

# Design principles applied

- **DDD** — each service owns one bounded context (Product, Inventory, Order, Identity)
- **SOLID** — single responsibility per layer (controller / service / repository / mapper)
- **KISS** — no premature abstractions, small focused methods
- **DRY** — shared `common-lib` for exceptions, error envelope, paged response
- **TDD/BDD** — tests written first, BDD naming `givenX_whenY_thenZ`
- **Encapsulation** — entity invariants enforced in domain methods (e.g. `Product.setPrice`, `InventoryItem.reserve`)

---

# Configuration Profiles

## Production Profile (Default)
- Uses **PostgreSQL** database
- Requires PostgreSQL server running on port 5432
- Uses Flyway for database migrations
- Services register with Eureka
- Config Server provides centralized configuration

## Development Profile (`dev`)
- Uses **H2 in-memory** database
- No PostgreSQL required
- Flyway **disabled** (H2 auto-creates tables from JPA entities)
- Services still register with Eureka
- Perfect for local development and testing

To use dev profile:
```bash
mvn -pl <service> spring-boot:run -Dspring-boot.run.profiles=dev
```

---

# CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

1. On push/PR: `mvn clean compile` → `mvn test` → `mvn package`
2. On push to `main`: build & push Docker images to Docker Hub (matrix of 4 services)

---

# Security Configuration

## JWT Configuration
All services use the same JWT secret for token signing and verification.

**Secret:** `ecommerce-jwt-secret-key-256-bits-minimum-length`
**Algorithm:** HS256
**Expiration:** 1 hour (3600000 ms)

## CSRF Protection
CSRF is **disabled** for API endpoints to allow POST/PUT/DELETE requests without CSRF tokens.
This is safe for stateless JWT-based APIs.

---

# Database Schema

## PostgreSQL (Production)

### Databases
- `auth_db` - Auth service
- `product_db` - Product service
- `inventory_db` - Inventory service
- `order_db` - Order service

### Connection Details
- **Host:** localhost
- **Port:** 5432
- **Username:** ecommerce
- **Password:** ecommerce

## H2 (Development)
Each service uses its own in-memory H2 database:
- Auth: `jdbc:h2:mem:authdb`
- Product: `jdbc:h2:mem:productdb`
- Inventory: `jdbc:h2:mem:inventorydb`
- Order: `jdbc:h2:mem:orderdb`

---

# License

MIT
