// Types for the E-Commerce Admin Dashboard

// Service Health
export interface ServiceHealth {
  status: 'UP' | 'DOWN';
  responseTime: number;
  service: string;
  port: number;
  url: string;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs?: number;
  username?: string;
  role?: string;
  user?: User;
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
}

// Inventory types
export interface InventoryItem {
  id?: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface SetStockRequest {
  productId: string;
  quantity: number;
}

// Order types
export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
}

export interface ProductCountStats {
  totalProducts: number;
  byCategory?: Record<string, number>;
}

export interface UserCountStats {
  totalUsers: number;
}

// Pagination
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
