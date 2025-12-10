import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, type AdminProfile } from '../api/auth';


interface AuthContextType {
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // If test admin params present in URL, use them for local testing
        if (typeof window !== 'undefined' && window.location.search) {
          const sp = new URLSearchParams(window.location.search);
          if (sp.get('testAdmin') === '1') {
            const username = sp.get('username') || 'admin';
            const token = sp.get('token') || 'test-admin-token';
            localStorage.setItem('accessToken', token);
            const profile = { id: 0, username, role: 'ADMIN' } as AdminProfile;
            setUser(profile);
            // remove query params from URL
            const u = new URL(window.location.href);
            u.search = '';
            window.history.replaceState({}, '', u.toString());
            setIsLoading(false);
            return;
          }
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const profile = await authApi.getProfile();
            setUser(profile);
          } catch (error) {
            console.error("Failed to fetch profile:", error);
            localStorage.removeItem('accessToken');
          }
        }
      } catch (e) {
        console.error('Auth init error', e);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('accessToken', token);
    const profile = await authApi.getProfile();
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
