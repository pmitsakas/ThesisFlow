import React, { createContext, useState, useContext, useEffect } from 'react';
import { dissertationAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveDissertation, setHasActiveDissertation] = useState(false);
  const [checkingDissertation, setCheckingDissertation] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      if (userData.role === 'student') {
        checkActiveDissertation();
      }
    }
    setLoading(false);
  }, []);

  const checkActiveDissertation = async () => {
    try {
      setCheckingDissertation(true);
      const response = await dissertationAPI.getMyDissertations();
      const activeDissertation = response.data.data.find(d => d.status === 'assigned');
      setHasActiveDissertation(!!activeDissertation);
    } catch (err) {
      console.error('Failed to check dissertation status:', err);
      setHasActiveDissertation(false);
    } finally {
      setCheckingDissertation(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    if (userData.role === 'student') {
      checkActiveDissertation();
    }
  };

  const logout = () => {
    setUser(null);
    setHasActiveDissertation(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    hasActiveDissertation,
    checkingDissertation,
    refreshDissertationStatus: checkActiveDissertation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};