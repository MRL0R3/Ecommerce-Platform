import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '@/api';
import { User, AuthResponse } from '@/types';

// Auth Context Types
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string | string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check authentication on mount
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        setToken(storedToken);
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse error
          }
        }
        
        // Fetch fresh profile from /api/v1/auth/me
        try {
          const res = await apiClient.get<User>('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.data && res.data.username) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          // If token is invalid/expired, it will be handled by response interceptor
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', {
        username,
        password,
      });
      
      const { token, role, user: resUser } = response.data;
      const initialUser: User = resUser || {
        id: '',
        username: response.data.username || username,
        email: '',
        role: (role as any) || 'USER',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(initialUser));
      
      setToken(token);
      setUser(initialUser);

      try {
        const meRes = await apiClient.get<User>('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.data && meRes.data.username) {
          setUser(meRes.data);
          localStorage.setItem('user', JSON.stringify(meRes.data));
        }
      } catch {
        // Fallback user already set
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', {
        username,
        email,
        password,
      });
      
      const { token, role, user: resUser } = response.data;
      const initialUser: User = resUser || {
        id: '',
        username: response.data.username || username,
        email: email || '',
        role: (role as any) || 'USER',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(initialUser));
      
      setToken(token);
      setUser(initialUser);

      try {
        const meRes = await apiClient.get<User>('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.data && meRes.data.username) {
          setUser(meRes.data);
          localStorage.setItem('user', JSON.stringify(meRes.data));
        }
      } catch {
        // Fallback user already set
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    hasRole,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role Guard Component
export const RoleGuard = ({ 
  children, 
  roles,
  fallback = null
}: { 
  children: ReactNode; 
  roles: string | string[];
  fallback?: ReactNode;
}) => {
  const { hasRole } = useAuth();
  
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

