# E-Commerce Order Management System
## Microservices Architecture — Enhanced Specification

**Version:** 2.0 (enhanced from original PDF spec v1.0 by Z.ai)
**Date:** 2026-07-25

---

## 1. Project Overview

Build a production-grade backend for an e-commerce platform handling product catalog,
inventory, and order management using a **Microservices architecture** with **Domain-Driven Design (DDD)**.

**Goal:** Demonstrate proficiency in Core Java, Spring Boot, Spring Cloud, DevOps, Security,
and Software Engineering Principles (TDD, DDD, SOLID, KISS, DRY).

### Enhancements over the original PDF spec (v1.0)

The original spec was a solid skeleton but missed several components that any real-world
ecommerce microservices system requires. The following table lists the gaps and how this
enhanced version addresses them:

| # | Gap in original spec | Enhancement added (v2.0) |
|---|----------------------|---------------------------|
| 1 | No Service Discovery — Feign cannot locate peers | **Eureka Server** (Netflix OSS, still the Spring Cloud default) |
| 2 | No single entry point for clients | **Spring Cloud Gateway** (routing, rate limiting, JWT filter) |
| 3 | No centralized configuration | **Spring Cloud Config Server** (native backend) |
| 4 | Oracle XE is licensed and heavy (~2GB image) | **PostgreSQL** — free, lighter, industry standard |
| 5 | No Auth flow — JWT mentioned but no issuer | Dedicated **Auth Service** (login + JWT issuance) |
| 6 | No API documentation | **Springdoc OpenAPI 3** (Swagger UI at /swagger-ui.html) |
| 7 | No DB versioning | **Flyway** migrations (`V1__init.sql`) |
| 8 | Hystrix is deprecated | **Resilience4j** circuit breaker + retry |
| 9 | No distributed tracing | **Micrometer Tracing + Zipkin** |
| 10 | No pagination / validation / audit fields | Spring `Pageable`, `jakarta.validation`, `@CreatedDate`/`@LastModifiedDate` |

---

## 2. Architecture & Tech Stack

| Component | Technology |
|-----------|-----------|
| Architecture | Microservices, DDD, Hexagonal layering |
| Language & Framework | Java 17, Spring Boot 3.2, Spring Cloud 2023.0 |
| Database | PostgreSQL 15 (via Docker) |
| DB Migrations | Flyway |
| API Design | RESTful APIs, OpenAPI 3 |
| Principles | OOP, SOLID, KISS, DRY, TDD/BDD |
| Testing | JUnit 5, Mockito, Testcontainers |
| Security | Spring Security, JWT (HS256) |
| Inter-service | OpenFeign + Resilience4j |
| Observability | SLF4J/Logback, Actuator, Micrometer, Zipkin |
| DevOps | Git, Docker, GitHub Actions CI |

---

## 3. System Architecture

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

---

## 4. Microservices Breakdown (DDD bounded contexts)

| Service | Port | Bounded Context | Aggregate Root |
|---------|------|-----------------|----------------|
| **eureka-server** | 8761 | Infrastructure | — |
| **config-server** | 8888 | Infrastructure | — |
| **api-gateway** | 8080 | Infrastructure | — |
| **auth-service** | 8081 | Identity & Access | User |
| **product-service** | 8082 | Catalog | Product |
| **inventory-service** | 8084 | Inventory | InventoryItem |
| **order-service** | 8083 | Ordering | Order |

---

## 5. Sprints (execution plan)

### Sprint 1 — Planning, Setup & Architecture
- Define bounded contexts (Product, Inventory, Order, Identity)
- Design REST APIs: `POST /api/v1/products`, `GET /api/v1/orders/{id}`, etc.
- Init Git repo with branches: `main`, `develop`, `feature/*`
- Parent Maven multi-module project

### Sprint 2 — Core Development & Database
- PostgreSQL via Docker
- Product / Inventory / Order Service Spring Boot apps
- Entities with JPA + auditing
- DTOs + MapStruct mappers
- Service + Controller layers (SOLID, KISS, DRY)
- Flyway migrations

### Sprint 3 — Quality & Testing
- TDD Red-Green-Refactor for Order Service
- BDD naming: `givenProductExists_whenCreateOrder_thenReturnOrderDto()`
- `@ControllerAdvice` global exception handling
- Custom exceptions: `ResourceNotFoundException`, `OutOfStockException`, etc.
- Testcontainers for integration tests

### Sprint 4 — Security & Observability
- Spring Security + JWT on each service
- Auth Service issues HS256 JWT tokens (admin + user roles)
- Gateway validates JWT, forwards `X-User-Id` / `X-User-Role`
- SLF4J structured logging
- Actuator `/actuator/health`, `/actuator/metrics`
- Micrometer + Zipkin distributed tracing

### Sprint 5 — Inter-Service Communication
- Order → Inventory via OpenFeign (registered in Eureka)
- Resilience4j circuit breaker + retry + fallback
- If Inventory is down, Order fails gracefully (no crash)

### Sprint 6 — DevOps & Deployment
- Dockerfile per service (multi-stage build)
- `docker-compose.yml` spins up everything
- GitHub Actions CI: push → `mvn clean test` → build jar → build & push Docker image

---

## 6. API Surface (summary)

### Product Service
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/products` | public | Paginated list |
| GET | `/api/v1/products/{id}` | public | Get one |
| POST | `/api/v1/products` | ADMIN | Create |
| PUT | `/api/v1/products/{id}` | ADMIN | Update |
| DELETE | `/api/v1/products/{id}` | ADMIN | Delete |

### Inventory Service
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/inventory/{productId}` | public | Stock level |
| PUT | `/api/v1/inventory/{productId}` | ADMIN | Set stock |
| POST | `/api/v1/inventory/{productId}/reduce` | internal | Reduce by qty |

### Order Service
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/orders` | USER+ | List own orders |
| GET | `/api/v1/orders/{id}` | USER+ | Get one |
| POST | `/api/v1/orders` | USER+ | Place order (calls Inventory) |

### Auth Service
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | public | Register |
| POST | `/api/v1/auth/login` | public | Login → JWT |

---

## 7. Non-Functional Requirements
- **Performance:** p95 latency < 300ms for read endpoints
- **Availability:** stateless services, horizontal scale
- **Security:** JWT HS256, password hashing (BCrypt), admin/user roles
- **Observability:** logs, metrics, traces on every service
- **Maintainability:** SOLID, small methods, MapStruct DTO separation
