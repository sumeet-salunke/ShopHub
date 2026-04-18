import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, privateApi, setupInterceptors } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // store access token in memory
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  // Setup interceptors once context is initialized
  useEffect(() => {
    setupInterceptors(
      () => token,
      (newToken) => setToken(newToken),
      handleLogout
    );
  }, [token, handleLogout]);

  // Initial Check (try to get profile and refresh token if needed)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Just calling refresh token automatically sets HttpOnly cookie if successful
        const { data } = await api.post('/auth/refresh-token');
        setToken(data.accessToken);
        // After getting token, fetch user profile
        const profileRes = await api.get('/auth/profile', {
            headers: {
                Authorization: `Bearer ${data.accessToken}`
            }
        });
        setUser(profileRes.data.user);
      } catch (err) {
        // Ignore error if not logged in initially
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.accessToken);

    const profileRes = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${data.accessToken}` }
    });
    setUser(profileRes.data.user);
    addToast('Logged in successfully', 'success');
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    addToast('Registration successful! Please check your email to verify.', 'success');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) {
      console.error(err);
    }
    handleLogout();
    addToast('Logged out', 'success');
  };

  const deleteAccount = async () => {
    await privateApi.delete('/auth/users/me');
    handleLogout();
    addToast('Account deleted', 'success');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, deleteAccount, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
