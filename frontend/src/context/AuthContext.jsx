// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired here if needed
        setUser({ username: decoded.sub, role: decoded.role, token });
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('aiWelcomeClosed'); // Reset welcome message
    const decoded = jwtDecode(token);
    setUser({ username: decoded.sub, role: decoded.role, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('aiWelcomeClosed'); // Reset welcome message
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);