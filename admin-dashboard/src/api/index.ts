import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import {
  ServiceHealth,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  InventoryItem,
  SetStockRequest,
  Order,
  CreateOrderRequest,
  OrderStats,
  ProductCountStats,
  UserCountStats,
  User,
  AuthResponse,
  PagedResponse,
} from '@/types';

// Create axios instance with base URL
const apiBaseURL = 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Service URLs
export const SERVICE_LINKS = {
  eureka: 'http://localhost:8761',
  gateway: 'http://localhost:8080',
  auth: 'http://localhost:8081/swagger-ui.html',
  product: 'http://localhost:8082/swagger-ui.html',
  order: 'http://localhost:8083/swagger-ui.html',
  inventory: 'http://localhost:8084/swagger-ui.html',
};

// Service health check
export const checkServiceHealth = async (signal?: AbortSignal): Promise<ServiceHealth[]> => {
  const services = [
    { name: 'Eureka Server', port: 8761, url: 'http://localhost:8761' },
    { name: 'API Gateway', port: 8080, url: 'http://localhost:8080' },
    { name: 'Auth Service', port: 8081, url: 'http://localhost:8081' },
    { name: 'Product Service', port: 8082, url: 'http://localhost:8082' },
    { name: 'Inventory Service', port: 8084, url: 'http://localhost:8084' },
    { name: 'Order Service', port: 8083, url: 'http://localhost:8083' },
  ];

  const results: ServiceHealth[] = [];
  for (const service of services) {
    signal?.throwIfAborted();
    const start = Date.now();
    try {
      await axios.get(service.url, { timeout: 2000, signal });
      results.push({
        status: 'UP',
        responseTime: Date.now() - start,
        service: service.name,
        port: service.port,
        url: service.url,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.name === 'CanceledError' || signal?.aborted) {
        throw err;
      }
      results.push({
        status: 'DOWN',
        responseTime: 0,
        service: service.name,
        port: service.port,
        url: service.url,
      });
    }
  }
  return results;
};

// Product API
export const productApi = {
  getAll: (page: number = 0, size: number = 20): Promise<AxiosResponse<PagedResponse<Product> | Product[]>> => {
    return apiClient.get(`/api/v1/products?page=${page}&size=${size}`);
  },
  getById: (id: string): Promise<AxiosResponse<Product>> => {
    return apiClient.get(`/api/v1/products/${id}`);
  },
  getBulk: (ids: string[]): Promise<AxiosResponse<Product[]>> => {
    return apiClient.get(`/api/v1/products/bulk?ids=${ids.join(',')}`);
  },
  getCountStats: (): Promise<AxiosResponse<ProductCountStats>> => {
    return apiClient.get('/api/v1/products/count');
  },
  create: (data: CreateProductRequest): Promise<AxiosResponse<Product>> => {
    return apiClient.post('/api/v1/products', data);
  },
  update: (id: string, data: UpdateProductRequest): Promise<AxiosResponse<Product>> => {
    return apiClient.put(`/api/v1/products/${id}`, data);
  },
  delete: (id: string): Promise<AxiosResponse<void>> => {
    return apiClient.delete(`/api/v1/products/${id}`);
  },
};

// Inventory API
export const inventoryApi = {
  getAll: (): Promise<AxiosResponse<InventoryItem[]>> => {
    return apiClient.get('/api/v1/inventory');
  },
  getByProductId: (productId: string): Promise<AxiosResponse<InventoryItem>> => {
    return apiClient.get(`/api/v1/inventory/${productId}`);
  },
  getBulkStock: (productIds: string[]): Promise<AxiosResponse<InventoryItem[]>> => {
    return apiClient.get(`/api/v1/inventory/bulk?productIds=${productIds.join(',')}`);
  },
  setStock: (productId: string, data: SetStockRequest): Promise<AxiosResponse<InventoryItem>> => {
    return apiClient.put(`/api/v1/inventory/${productId}`, data);
  },
  reserve: (productId: string, quantity: number): Promise<AxiosResponse<InventoryItem>> => {
    return apiClient.post(`/api/v1/inventory/${productId}/reserve`, { quantity });
  },
  deduct: (productId: string, quantity: number): Promise<AxiosResponse<InventoryItem>> => {
    return apiClient.post(`/api/v1/inventory/${productId}/deduct`, { quantity });
  },
};

// Order API
export const orderApi = {
  getAll: (page: number = 0, size: number = 20): Promise<AxiosResponse<PagedResponse<Order> | Order[]>> => {
    return apiClient.get(`/api/v1/orders?page=${page}&size=${size}`);
  },
  getById: (id: string): Promise<AxiosResponse<Order>> => {
    return apiClient.get(`/api/v1/orders/${id}`);
  },
  getStats: (): Promise<AxiosResponse<OrderStats>> => {
    return apiClient.get('/api/v1/orders/stats');
  },
  getRecent: (): Promise<AxiosResponse<Order[]>> => {
    return apiClient.get('/api/v1/orders/recent');
  },
  create: (data: CreateOrderRequest): Promise<AxiosResponse<Order>> => {
    return apiClient.post('/api/v1/orders', data);
  },
  updateStatus: (id: string, status: string): Promise<AxiosResponse<Order>> => {
    return apiClient.patch(`/api/v1/orders/${id}/status`, { status });
  },
};

// Auth API
export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post('/api/v1/auth/login', { username, password });
  },
  register: (username: string, email: string, password: string, role?: string): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post('/api/v1/auth/register', { username, email, password, role });
  },
  me: (): Promise<AxiosResponse<User>> => {
    return apiClient.get('/api/v1/auth/me');
  },
  getUserCount: (): Promise<AxiosResponse<UserCountStats>> => {
    return apiClient.get('/api/v1/auth/users/count');
  },
  getUsers: (): Promise<AxiosResponse<User[]>> => {
    return apiClient.get('/api/v1/auth/users');
  },
  updateRole: (id: string, role: string): Promise<AxiosResponse<User>> => {
    return apiClient.put(`/api/v1/auth/users/${id}/role`, { role });
  },
  deleteUser: (id: string): Promise<AxiosResponse<void>> => {
    return apiClient.delete(`/api/v1/auth/users/${id}`);
  },
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    try {
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export { apiClient };
