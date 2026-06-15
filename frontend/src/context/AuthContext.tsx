'use client'; // Required since we are using React state and effects

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Look for the cookie manually in the browser since fetch doesn't auto-send cookies 
        // to a different port without strict CORS config. 
        // Since the cookie is set by our client-side Javascript, we can read it directly!
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        const token = getCookie('token');

        if (!token) {
          setLoading(false);
          return;
        }

        // We explicitly send the token in the Authorization header to avoid CORS credential issues
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token invalid or expired
          document.cookie = `token=; path=/; max-age=0`;
        }
      } catch (error) {
        console.error('Session check failed', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (token: string, userData: User) => {
    document.cookie = `token=${token}; path=/; max-age=604800`; // 7 days
    setUser(userData);
    window.location.href = '/browse';
  };

  const logout = () => {
    document.cookie = `token=; path=/; max-age=0`;
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
