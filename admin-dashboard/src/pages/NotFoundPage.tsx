import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F5F7]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[#FF3B30]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1D1D1F] mb-3">404</h1>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-4">Page Not Found</h2>
          <p className="text-[#1D1D1F]/60 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="w-full justify-center" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};
