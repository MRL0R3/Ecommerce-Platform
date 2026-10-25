# E-Commerce Platform — Upgrade Plan

> [!NOTE]
> This plan is based on a thorough analysis of the entire codebase — every Java file, every React component, every config file. Items are organized by priority and grouped into phases.

---

## Current State Summary

The platform is a **functional prototype** with solid foundations:
- ✅ Microservices architecture with proper bounded contexts
- ✅ Service discovery, centralized config, API gateway
- ✅ JWT auth with role-based access (USER/ADMIN)
- ✅ Clean React frontend with TypeScript, TanStack Query, react-hook-form
- ✅ DDD-style domain models with business invariants

**But it has critical gaps that prevent real-world use:**
- 🔴 Security vulnerabilities (hardcoded secrets, localStorage tokens)
- 🔴 N+1 API call problems causing massive over-fetching
- 🔴 Dashboard stats are hardcoded, not real data
- 🔴 No mobile responsiveness
- 🔴 No user management UI (admin can't manage users)
- 🔴 No analytics or reporting

---

## Phase 1: Critical Fixes 🔴
*Priority: IMMEDIATE | Effort: 2-3 days*

### 1.1 Security — JWT Secret Externalization
**Problem:** JWT signing secret is hardcoded in `application.yml` across `auth-service` and `api-gateway`.
**Fix:**
- Move secret to environment variable `JWT_SECRET`
- Update [application.yml](file:///C:/Users/LOQ/ecommerce-platform/auth-service/src/main/resources/application.yml) → `jwt.secret: ${JWT_SECRET}`
- Update [application.yml](file:///C:/Users/LOQ/ecommerce-platform/api-gateway/src/main/resources/application.yml) → same
- Add `.env` file to `.gitignore`

### 1.2 Security — Token Storage Migration
**Problem:** Frontend stores JWT in `localStorage` (XSS vulnerable).
**Fix:**
- Move to `HttpOnly` + `Secure` + `SameSite` cookie set by the API Gateway
- Update [AuthContext.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/context/AuthContext.tsx) to stop reading `localStorage`
- Update [api/index.ts](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/api/index.ts) to use `withCredentials: true` instead of `Authorization` header
- Add CORS config to gateway for cookie support

### 1.3 Frontend — Fix N+1 API Calls
**Problem:** [InventoryPage.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/pages/InventoryPage.tsx) fetches 100 products, then makes an individual HTTP request **per product** to get inventory. Same pattern in [OrdersPage.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/pages/OrdersPage.tsx).
**Fix (Backend):**
- Add `GET /api/v1/inventory/bulk?productIds=id1,id2,...` to `InventoryController`
- Add `GET /api/v1/products/bulk?ids=id1,id2,...` to `ProductController`
**Fix (Frontend):**
- Replace the `for` loop with a single bulk fetch call
- Use React Query's `useQueries` for parallel fetching if needed

### 1.4 Password Minimum Length Fix
**Problem:** [RegisterRequest.java](file:///C:/Users/LOQ/ecommerce-platform/auth-service/src/main/java/com/ecommerce/auth/dto/RegisterRequest.java) was changed to `min = 6` but the [RegisterPage.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/pages/RegisterPage.tsx) Zod schema still says `min(6)`. These should both be `min(8)` for security.
**Fix:** Align both to `min(8)`.

### 1.5 Process Stability — Script Fixes
**Problem:** `start-dev.sh` Maven commands run in Git Bash using the WSL Maven repository (`/home/ahmad/.m2`) which differs from the Windows Maven repository (`C:\Users\LOQ\.m2`). This causes intermittent "artifact not found" build failures.
**Fix:**
- Add `export MAVEN_OPTS` and explicit `M2_HOME` to `start-dev.sh`
- Or switch to running pre-built JARs: `java -jar target/*.jar --spring.profiles.active=dev`

---

## Phase 2: Backend Upgrades 🟡
*Priority: HIGH | Effort: 1-2 weeks*

### 2.1 Event-Driven Architecture (Replace Feign for Critical Paths)
**Problem:** [OrderService.java](file:///C:/Users/LOQ/ecommerce-platform/order-service/src/main/java/com/ecommerce/order/service/OrderService.java) calls Inventory via synchronous Feign during order creation. If Inventory Service is down, orders fail completely.
**Upgrade:**
- Add Spring Cloud Stream + RabbitMQ (or Kafka)
- Order Service publishes `OrderCreatedEvent`
- Inventory Service subscribes, reserves stock, publishes `StockReservedEvent`
- Implement the Saga pattern for distributed transactions

#### Files to Create/Modify
| Action | File |
|---|---|
| [NEW] | `order-service/src/.../event/OrderCreatedEvent.java` |
| [NEW] | `inventory-service/src/.../event/StockReservedEvent.java` |
| [MODIFY] | `order-service/src/.../service/OrderService.java` |
| [MODIFY] | `docker-compose.yml` — add RabbitMQ service |

### 2.2 API Pagination & Sorting Standardization
**Problem:** Backend supports pagination via `PagedResponse<T>`, but frontend ignores it (hardcodes `page=0, size=50`).
**Upgrade:**
- Standardize all list endpoints to accept `?page=0&size=20&sort=createdAt,desc`
- Return consistent `PagedResponse` with `totalElements`, `totalPages`, `currentPage`
- Frontend `Table.tsx` already supports pagination props — wire them up

### 2.3 Caching Layer
**Upgrade:**
- Add Redis for product catalog caching (products change infrequently)
- Cache inventory counts with short TTL (5-10s)
- Use `@Cacheable` / `@CacheEvict` annotations

### 2.4 Observability Stack
**Upgrade:**
- Zipkin is in `docker-compose.yml` but not configured in services
- Add Spring Boot Actuator + Micrometer metrics export
- Add structured logging with correlation IDs (trace-id propagation)
- Integrate with Prometheus + Grafana for dashboards

### 2.5 Admin-Only Endpoint Protection
**Problem:** Currently, any authenticated user can create/delete products or manage inventory. The gateway injects `X-User-Role` but downstream services don't enforce it.
**Fix:**
- Add `@PreAuthorize("hasRole('ADMIN')")` to write endpoints in Product, Inventory, and Order controllers
- Create a shared `SecurityContextFilter` in `common-lib` that reads `X-User-Role` header

### 2.6 User Management Endpoints
**Problem:** No way to list users, update roles, or disable accounts.
**Upgrade (auth-service):**
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/users` | List all users (ADMIN only) |
| GET | `/api/v1/users/{id}` | Get user profile |
| PUT | `/api/v1/users/{id}/role` | Change user role (ADMIN only) |
| DELETE | `/api/v1/users/{id}` | Disable/delete user (ADMIN only) |

### 2.7 Dashboard Analytics Endpoints
**Problem:** Dashboard stats are hardcoded in the frontend.
**Upgrade:**
| Method | Path | Service | Returns |
|---|---|---|---|
| GET | `/api/v1/products/count` | Product | Total product count |
| GET | `/api/v1/orders/stats` | Order | Total orders, revenue, status breakdown |
| GET | `/api/v1/users/count` | Auth | Total user count |
| GET | `/api/v1/orders/recent` | Order | Last 10 orders for activity feed |

---

## Phase 3: Frontend Upgrades 🟡
*Priority: HIGH | Effort: 1-2 weeks*

### 3.1 Responsive Mobile Layout
**Problem:** [Layout.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/components/Layout.tsx) has a fixed `w-64` sidebar and `ml-64` main content. Completely broken on mobile.
**Upgrade:**
- Add hamburger menu toggle button (visible on `md:hidden`)
- Sidebar becomes an overlay drawer on mobile with backdrop
- Main content goes full-width on small screens
- Bottom navigation bar for mobile (Dashboard, Products, Orders, Settings)

### 3.2 Real Dashboard with Live Data
**Problem:** [DashboardPage.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/pages/DashboardPage.tsx) shows hardcoded stats.
**Upgrade:**
- Connect to the new analytics endpoints (Phase 2.7)
- Add real-time charts using `recharts` or `chart.js`:
  - Revenue over time (line chart)
  - Orders by status (pie/donut chart)
  - Top-selling products (bar chart)
  - Low stock alerts (table)
- Recent activity feed showing latest orders

### 3.3 Working Pagination
**Problem:** `Table.tsx` renders page buttons but clicking does nothing.
**Upgrade:**
- Wire `currentPage` state to API calls via React Query's `keepPreviousData`
- Add page size selector (10, 25, 50)
- Show "Showing 1-10 of 247 results" text

### 3.4 Dark Mode (Complete Implementation)
**Problem:** [Layout.tsx](file:///C:/Users/LOQ/ecommerce-platform/admin-dashboard/src/components/Layout.tsx) has a dark mode toggle that switches React state but has no CSS implementation.
**Upgrade:**
- Add `darkMode: 'class'` to `tailwind.config.js`
- Add `dark:` variants to all components
- Persist preference in `localStorage`
- Respect `prefers-color-scheme` system setting

### 3.5 Role-Based UI
**Problem:** Admin and regular users see the same UI. No user management page.
**Upgrade:**
- Hide "Products > Create/Delete" from non-admin users
- Hide "Inventory > Adjust" from non-admin users
- Add admin-only sidebar items (User Management, Settings)
- Use the existing `hasRole()` from `AuthContext`

### 3.6 Accessibility (a11y)
**Problems identified:**
- Modal dialogs don't trap focus
- Icon-only buttons lack `aria-label`
- No keyboard navigation for sidebar
- No `role="dialog"` on modals
**Upgrade:**
- Add focus-trap to all modals (use `@headlessui/react` or manual implementation)
- Add `aria-label` to all icon buttons
- Add `role`, `aria-modal`, `aria-labelledby` to dialog containers
- Ensure all interactive elements are keyboard accessible

---

## Phase 4: New User-Facing Dashboard UI 🟢
*Priority: MEDIUM | Effort: 2-4 weeks*

This phase adds entirely new pages and features to make the admin dashboard a complete tool.

### 4.1 User Management Page (Admin Only)
**Route:** `/users`

```
┌─────────────────────────────────────────────────────┐
│ User Management                        [+ Invite]   │
├─────────────────────────────────────────────────────┤
│ 🔍 Search users...           Filter: [All Roles ▼] │
├─────┬───────────┬──────────────┬────────┬───────────┤
│ #   │ Username  │ Email        │ Role   │ Actions   │
├─────┼───────────┼──────────────┼────────┼───────────┤
│ 1   │ admin1    │ admin@ex.com │ ADMIN  │ [Edit][×] │
│ 2   │ user1     │ user@ex.com  │ USER   │ [Edit][×] │
├─────┴───────────┴──────────────┴────────┴───────────┤
│                  « 1  2  3  4  5 »                  │
└─────────────────────────────────────────────────────┘
```

**Features:**
- List all users with search and role filter
- Inline role change (dropdown → save)
- Disable/enable accounts
- Invite new user via email

### 4.2 Analytics Dashboard
**Route:** `/analytics`

```
┌─────────────────────────────────────────────────────┐
│ Analytics                    [Last 7 Days ▼]        │
├──────────────────────┬──────────────────────────────┤
│ ┌──────┐ ┌──────┐   │  Revenue Over Time           │
│ │ $12K │ │ 347  │   │  ┌───────────────────────┐   │
│ │ Rev. │ │Orders│   │  │ 📈 Line Chart         │   │
│ └──────┘ └──────┘   │  └───────────────────────┘   │
│ ┌──────┐ ┌──────┐   │                              │
│ │  89  │ │  12  │   │  Orders by Status             │
│ │Prods │ │Users │   │  ┌───────────────────────┐   │
│ └──────┘ └──────┘   │  │ 🍩 Donut Chart        │   │
├──────────────────────┴──────────────────────────────┤
│ Top Products              │ Low Stock Alerts         │
│ ┌───────────────────────┐ │ ┌─────────────────────┐ │
│ │ 📊 Bar Chart          │ │ │ ⚠️ Widget (qty: 3) │ │
│ │                       │ │ │ ⚠️ Gadget (qty: 1) │ │
│ └───────────────────────┘ │ └─────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 4.3 Settings Page
**Route:** `/settings`

**Sections:**
- **Profile:** Change username, email, password
- **Appearance:** Dark mode toggle, compact/comfortable density
- **Notifications:** Email alerts for low stock, new orders
- **API Keys:** Generate and manage API tokens (future)

### 4.4 Customer Storefront (Public)
**Route:** `/store` (separate app or section)

A customer-facing shop UI is out of scope for the admin dashboard but would be the natural next step:
- Product browsing with categories and search
- Shopping cart
- Checkout flow
- Order history (for logged-in customers)

### 4.5 Notification Center
**In-app notification system:**
- Bell icon in the top bar with unread count badge
- Dropdown panel showing recent events:
  - "New order #1234 received"
  - "Product Widget is low on stock (3 remaining)"
  - "User john_doe registered"
- Mark as read / Mark all read
- Eventually backed by WebSocket for real-time push

---

## Phase 5: DevOps & Quality 🟢
*Priority: MEDIUM | Effort: 1-2 weeks*

### 5.1 CI/CD Pipeline
- GitHub Actions workflow: build → test → Docker image → deploy
- Run `mvn verify` on all modules
- Run `npm run build` + `npm run lint` on frontend
- Publish Docker images to registry

### 5.2 Testing
**Current state:** No meaningful tests exist.
**Upgrade:**
- Backend: JUnit 5 + Mockito unit tests for all Service classes
- Backend: Testcontainers integration tests for Repository layer
- Frontend: Vitest + React Testing Library for components
- E2E: Playwright for critical flows (login → create product → place order)

### 5.3 API Rate Limiting
- Add rate limiting at the gateway level (Spring Cloud Gateway `RequestRateLimiter` filter)
- 100 req/min for authenticated users, 10 req/min for unauthenticated

### 5.4 Environment Configurations
- Proper `.env.example` with all required variables
- Separate `application-staging.yml` and `application-prod.yml`
- Kubernetes manifests or Helm charts for cloud deployment

---

## Implementation Priority Matrix

| # | Item | Priority | Effort | Impact |
|---|---|---|---|---|
| 1.1 | JWT Secret Externalization | 🔴 Critical | 1h | Security |
| 1.2 | Token Storage Migration | 🔴 Critical | 4h | Security |
| 1.3 | Fix N+1 API Calls | 🔴 Critical | 4h | Performance |
| 1.5 | Script Stability | 🔴 Critical | 2h | DX |
| 2.6 | User Management API | 🟡 High | 4h | Feature |
| 2.7 | Dashboard Analytics API | 🟡 High | 4h | Feature |
| 3.1 | Responsive Layout | 🟡 High | 6h | UX |
| 3.2 | Real Dashboard Stats | 🟡 High | 6h | Feature |
| 3.3 | Working Pagination | 🟡 High | 3h | UX |
| 2.5 | Role-Based Auth | 🟡 High | 4h | Security |
| 3.4 | Dark Mode | 🟡 High | 4h | UX |
| 4.1 | User Management Page | 🟢 Medium | 8h | Feature |
| 4.2 | Analytics Dashboard | 🟢 Medium | 12h | Feature |
| 4.5 | Notification Center | 🟢 Medium | 8h | Feature |
| 2.1 | Event-Driven Architecture | 🟢 Medium | 3-5d | Architecture |
| 5.2 | Testing Suite | 🟢 Medium | 3-5d | Quality |
| 4.3 | Settings Page | 🟢 Medium | 6h | Feature |
| 2.3 | Redis Caching | 🔵 Low | 1d | Performance |
| 2.4 | Observability Stack | 🔵 Low | 2d | Ops |
| 5.1 | CI/CD Pipeline | 🔵 Low | 1d | DevOps |

---

## Open Questions

> [!IMPORTANT]
> **Which phases should I implement?** I can start with Phase 1 (critical fixes) immediately, or you can pick specific items from any phase. What's your priority?

> [!IMPORTANT]
> **Customer Storefront:** Do you want a customer-facing shopping UI, or should I focus only on the admin dashboard?

> [!IMPORTANT]
> **Message Queue Choice:** For event-driven architecture (Phase 2.1), do you prefer RabbitMQ (simpler, already in Spring ecosystem) or Apache Kafka (higher throughput, better for event sourcing)?

> [!IMPORTANT]
> **Charting Library:** For the analytics dashboard (Phase 4.2), do you prefer `recharts` (React-native, lightweight) or `chart.js` via `react-chartjs-2` (more chart types)?
