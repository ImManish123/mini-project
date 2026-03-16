import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const fallbackToken = localStorage.getItem('token');
        if (!parsed?.token && fallbackToken) {
          setUser({ ...parsed, token: fallbackToken });
        } else {
          setUser(parsed);
        }
      }
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    const token = userData?.token || userData?.accessToken || userData?.jwt || userData?.data?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';
  const isWorker = () => user?.role === 'WORKER';
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isCustomer, isWorker, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
