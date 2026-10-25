# E-Commerce Admin Dashboard

A premium Apple-inspired admin dashboard for managing the Spring Boot microservices e-commerce platform.

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router DOM** - Routing
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running e-commerce backend services (ports 8080-8084)

### Installation

```bash
cd admin-dashboard
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
admin-dashboard/
├── src/
│   ├── api/              # API client and service endpoints
│   │   └── index.ts      # All API calls (auth, products, inventory, orders)
│   │
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx    # Apple-style button
│   │   ├── Card.tsx      # Glassmorphism card
│   │   ├── Input.tsx     # Styled input field
│   │   └── Layout.tsx    # Main layout with sidebar
│   │
│   ├── context/          # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   │
│   ├── pages/            # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── ServiceMonitor.tsx
│   │
│   ├── types/            # TypeScript types
│   │   └── index.ts      # All type definitions
│   │
│   ├── App.tsx           # Main app with routes
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind + custom styles
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.js
├── tailwind.config.js
└── .env                 # Environment variables
```

## API Configuration

The dashboard connects to the API Gateway at `http://localhost:8080` by default.

To change the base URL, update the `.env` file:

```
VITE_API_BASE_URL=http://your-gateway-url:8080
```

## Features

### Authentication
- JWT token management
- Login/Register pages
- Protected routes
- Automatic token injection in requests

### Dashboard
- Service health monitoring
- Real-time status updates
- Statistics overview

### Products
- List all products
- Search and filter
- Create, Update, Delete
- Inventory status display

### Inventory
- Stock level management
- Low stock warnings
- Add/Remove stock
- Real-time refresh

### Orders
- Order list with status
- Order details drawer
- Customer information
- Item breakdown

### Service Monitor
- Real-time health checks
- Quick access to all services
- Copy-to-clipboard for URLs

## Design Principles

### Apple-Inspired UI
- Glassmorphism cards with backdrop blur
- Soft shadows and rounded corners (20-28px)
- Clean typography with SF Pro style
- Minimalistic spacing
- Smooth transitions and animations

### Color Palette
- Background: `#F5F5F7`
- Card: `rgba(255,255,255,0.7)` with backdrop blur
- Primary: `#0071E3`
- Success: `#34C759`
- Warning: `#FF9F0A`
- Danger: `#FF3B30`
- Text: `#1D1D1F`

### Animations
- Framer Motion for smooth transitions
- Spring animations for natural feel
- Staggered animations for lists
- Hover effects on interactive elements

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | DashboardPage | Main dashboard with stats |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/products` | ProductsPage | Product management |
| `/inventory` | InventoryPage | Inventory management |
| `/orders` | OrdersPage | Order management |
| `/services` | ServiceMonitor | Service health monitor |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | API Gateway URL |

## License

MIT
