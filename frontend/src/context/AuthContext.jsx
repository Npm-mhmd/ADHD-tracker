import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      // Seed from cache for an instant render, then verify with the server.
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }

      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch {
        // Invalid/expired token — clear the stale session.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const persistSession = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authAPI.login({ email, password });
        const { token, user: userData } = response.data;
        persistSession(token, userData);
        return { success: true, user: userData };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed',
        };
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const response = await authAPI.register(userData);
        const { token, user: newUser } = response.data;
        persistSession(token, newUser);
        return { success: true, user: newUser };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Registration failed',
        };
      }
    },
    [persistSession]
  );

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated, login, register, logout, updateUser }),
    [user, loading, isAuthenticated, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
