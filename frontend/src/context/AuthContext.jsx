import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Setup localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile on launch
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Failed to load user profile:', err.friendlyMessage);
        setToken(''); // Reset token if invalid
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      setToken(res.data.token);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.friendlyMessage || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      setToken(res.data.token);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.friendlyMessage || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE, profileData);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.friendlyMessage || 'Profile update failed.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
