import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health/eureka': {
        target: 'http://localhost:8761',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
      '/health/gateway': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
      '/health/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
      '/health/product': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
      '/health/inventory': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
      '/health/order': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
    },
  },
});
