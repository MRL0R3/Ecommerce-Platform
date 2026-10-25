import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
  X,
  Menu,
} from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/services', icon: Settings, label: 'Services' },
  ];

  const renderNavContent = () => (
    <div className="p-6 h-full flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3] to-[#0056CC] rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1D1D1F] mt-3">E-Commerce</h1>
            <p className="text-sm text-[#1D1D1F]/60">Admin Dashboard</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (!item.exact && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-[#0071E3]/10 text-[#0071E3]'
                    : 'text-[#1D1D1F]/60 hover:bg-white/60 hover:text-[#1D1D1F]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-200/50 pt-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/60">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0071E3] to-[#0056CC] rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-[#1D1D1F] truncate">{user.username}</p>
              <p className="text-[10px] text-[#1D1D1F]/50 capitalize">{user.role || 'User'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="p-1.5">
              <LogOut className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F5F5F7] ${darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 glass-sidebar z-30">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl z-50 shadow-2xl md:hidden"
            >
              {renderNavContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 ml-0 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#F5F5F7]/85 backdrop-blur-xl border-b border-gray-200/50">
          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger Button on Mobile */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-xl text-[#1D1D1F] hover:bg-white/60 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F]">
                {navItems.find(i => location.pathname === i.to || (!i.exact && location.pathname.startsWith(i.to)))?.label || 'Dashboard'}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)}>
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
