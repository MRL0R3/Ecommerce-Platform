import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { checkServiceHealth, orderApi, productApi, authApi } from '@/api';
import { Card } from '@/components/Card';
import { Users, Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

export const DashboardPage = () => {
  const { data: services = [] } = useQuery({
    queryKey: ['serviceHealth'],
    queryFn: async ({ signal }) => {
      try {
        return await checkServiceHealth(signal);
      } catch {
        return [
          { status: 'DOWN', responseTime: 0, service: 'Eureka Server', port: 8761, url: 'http://localhost:8761' },
          { status: 'DOWN', responseTime: 0, service: 'API Gateway', port: 8080, url: 'http://localhost:8080' },
          { status: 'DOWN', responseTime: 0, service: 'Auth Service', port: 8081, url: 'http://localhost:8081' },
          { status: 'DOWN', responseTime: 0, service: 'Product Service', port: 8082, url: 'http://localhost:8082' },
          { status: 'DOWN', responseTime: 0, service: 'Inventory Service', port: 8084, url: 'http://localhost:8084' },
          { status: 'DOWN', responseTime: 0, service: 'Order Service', port: 8083, url: 'http://localhost:8083' },
        ] as any[];
      }
    },
    refetchInterval: 30000,
  });

  // Live Metrics Queries
  const { data: orderStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: async () => {
      try {
        const res = await orderApi.getStats();
        return res.data;
      } catch {
        return { totalOrders: 0, totalRevenue: 0, byStatus: {} };
      }
    },
    refetchInterval: 30000,
  });

  const { data: productStats } = useQuery({
    queryKey: ['productCountStats'],
    queryFn: async () => {
      try {
        const res = await productApi.getCountStats();
        return res.data;
      } catch {
        return { totalProducts: 0 };
      }
    },
    refetchInterval: 30000,
  });

  const { data: userStats } = useQuery({
    queryKey: ['userCountStats'],
    queryFn: async () => {
      try {
        const res = await authApi.getUserCount();
        return res.data;
      } catch {
        return { totalUsers: 0 };
      }
    },
    refetchInterval: 30000,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      try {
        const res = await orderApi.getRecent();
        return res.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const stats = {
    totalProducts: productStats?.totalProducts ?? 0,
    totalOrders: orderStats?.totalOrders ?? 0,
    totalUsers: userStats?.totalUsers ?? 0,
    totalRevenue: orderStats?.totalRevenue ? Number(orderStats.totalRevenue) : 0,
  };

  const getStatusColor = (status: 'UP' | 'DOWN') => {
    return status === 'UP' ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]';
  };

  const allServicesUp = services.length > 0 && services.every(s => s.status === 'UP');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">Dashboard</h1>
          <p className="text-[#1D1D1F]/60 mt-1">Live overview of your microservices e-commerce platform.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${allServicesUp ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
          {allServicesUp ? 'All Systems Operational' : 'Some Services Down'}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card hoverEffect className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0071E3]/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-[#0071E3]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D1D1F]">{stats.totalProducts.toLocaleString()}</p>
                <p className="text-sm text-[#1D1D1F]/60">Total Products</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card hoverEffect className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#34C759]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#34C759]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D1D1F]">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-[#1D1D1F]/60">Total Revenue</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card hoverEffect className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF9F0A]/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#FF9F0A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D1D1F]">{stats.totalOrders.toLocaleString()}</p>
                <p className="text-sm text-[#1D1D1F]/60">Total Orders</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card hoverEffect className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5856D6]/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#5856D6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D1D1F]">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-[#1D1D1F]/60">Total Users</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Order Breakdown */}
      {recentOrders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0071E3]" /> Recent Orders
              </h2>
              <span className="text-xs text-[#1D1D1F]/60">Live feed</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[#1D1D1F]/60">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer ID</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.slice(0, 5).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                      <td className="py-2.5 font-mono text-xs text-[#1D1D1F]/70">{order.customerId.slice(0, 8)}...</td>
                      <td className="py-2.5 font-semibold">${Number(order.totalAmount).toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#0071E3]">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Service Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Service Status & Discovery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.service}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card hoverEffect className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F]">{service.service}</h3>
                    <p className="text-xs text-[#1D1D1F]/50">Port: {service.port}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#1D1D1F]/60">Response Time</p>
                    <p className="text-lg font-bold text-[#1D1D1F]">
                      {service.responseTime > 0 ? `${service.responseTime}ms` : '--'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${service.status === 'UP' ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
