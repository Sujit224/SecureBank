import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 🟢 BYPASS: We initialize the state with a DUMMY USER object.
  // This tricks the app into thinking we are already logged in.
  const [user, setUser] = useState({
    id: 1,
    email: 'demo@bank.com',
    full_name: 'Alex Developer',
    role: 'user',             // 👈 CHANGE THIS to 'admin' to see the Admin Dashboard
    account_number: 'ACC123456789'
  });

  const [token, setToken] = useState('mock_dev_token');
  const [loading, setLoading] = useState(false); // No loading needed

  // We keep the login function in case you want to switch users later
  const login = async (email, password, role) => {
    setLoading(true);
    const response = await apiService.login(email, password, role);
    setToken(response.access_token);
    setUser(response.user);
    setLoading(false);
  };

  // Modified logout: It just reloads the page to reset the demo user
  const logout = () => {
    alert("Simulation: Logging out... (Reloading Demo User)");
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);