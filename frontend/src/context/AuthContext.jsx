import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('canteenx_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(data => {
          setUser(data.user);
          setWalletBalance(data.walletBalance);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (loginKey, password) => {
    const data = await api.login(loginKey, password);
    localStorage.setItem('canteenx_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('canteenx_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('canteenx_token');
    setToken(null);
    setUser(null);
    setWalletBalance(0);
  };

  const updateBalance = (newBalance) => {
    setWalletBalance(newBalance);
  };

  return (
    <AuthContext.Provider value={{ user, token, walletBalance, loading, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
