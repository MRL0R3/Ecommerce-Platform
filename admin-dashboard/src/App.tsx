import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy loaded pages
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProductsPage = React.lazy(() => import('@/pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const InventoryPage = React.lazy(() => import('@/pages/InventoryPage').then(module => ({ default: module.InventoryPage })));
const OrdersPage = React.lazy(() => import('@/pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const UsersPage = React.lazy(() => import('@/pages/UsersPage').then(module => ({ default: module.UsersPage })));
const ServiceMonitor = React.lazy(() => import('@/pages/ServiceMonitor').then(module => ({ default: module.ServiceMonitor })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 rounded-full border-4 border-[#0071E3] border-t-transparent animate-spin" />
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Layout><ServiceMonitor /></Layout></ProtectedRoute>} />
          
          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
