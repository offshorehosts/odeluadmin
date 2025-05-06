import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyApiKey } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const apiKey = localStorage.getItem('adminApiKey');
      if (apiKey) {
        try {
          const result = await verifyApiKey(apiKey);
          setIsAuthenticated(result.success);
        } catch (err) {
          console.error('Auth check failed:', err);
          setIsAuthenticated(false);
          localStorage.removeItem('adminApiKey');
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (apiKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyApiKey(apiKey);
      if (result.success) {
        localStorage.setItem('adminApiKey', apiKey);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(result.message || 'Invalid API key');
        return false;
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminApiKey');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);