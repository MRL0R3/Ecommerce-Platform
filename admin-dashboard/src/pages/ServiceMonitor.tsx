import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { checkServiceHealth, copyToClipboard, SERVICE_LINKS } from '@/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckCircle, XCircle, Clipboard, ExternalLink } from 'lucide-react';

export const ServiceMonitor = () => {
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
    refetchInterval: 10000,
  });

  const getStatusColor = (status: 'UP' | 'DOWN') => {
    return status === 'UP' ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]';
  };

  const allServicesUp = services.every(s => s.status === 'UP');

  const handleCopy = async (url: string) => {
    try {
      await copyToClipboard(url);
    } catch {
      // Fallback for older browsers
      navigator.clipboard.writeText(url);
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Service Monitor</h1>
        <p className="text-[#1D1D1F]/60 mt-1">Real-time health status of all microservices</p>
      </div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl ${allServicesUp ? 'bg-[#34C759]/10' : 'bg-[#FF3B30]/10'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allServicesUp ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`}>
            {allServicesUp ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1D1D1F]">
              {allServicesUp ? 'All Services Online' : 'Some Services Offline'}
            </h2>
            <p className="text-sm text-[#1D1D1F]/60">
              {services.filter(s => s.status === 'UP').length}/{services.length} services operational
            </p>
          </div>
        </div>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.service}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverEffect className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#1D1D1F]">{service.service}</h3>
                  <p className="text-xs text-[#1D1D1F]/50">Port: {service.port}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
                >
                  {service.status}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[#1D1D1F]/60">Response Time</p>
                  <p className="text-lg font-bold text-[#1D1D1F]">
                    {service.responseTime > 0 ? `${service.responseTime}ms` : '--'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${service.status === 'UP' ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(service.url)}
                >
                  <Clipboard className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpen(service.url)}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(SERVICE_LINKS).map(([key, url]) => (
            <Card key={key} hoverEffect className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1D1D1F] capitalize">{key}</h3>
                  <p className="text-sm text-[#1D1D1F]/50 truncate">{url}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(url)}
                  >
                    <Clipboard className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpen(url)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
