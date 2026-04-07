import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const initAuth = async () => {
      const storedUser = localStorage.getItem('splitwise_user');
      const token = localStorage.getItem('splitwise_token');
      
      if (storedUser && token) {
        try {
          // Verify token with backend
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('splitwise_user');
          localStorage.removeItem('splitwise_token');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token } = response.data;
    
    localStorage.setItem('splitwise_user', JSON.stringify(userData));
    localStorage.setItem('splitwise_token', token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { user: userData, token } = response.data;
    
    localStorage.setItem('splitwise_user', JSON.stringify(userData));
    localStorage.setItem('splitwise_token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('splitwise_user');
    localStorage.removeItem('splitwise_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};