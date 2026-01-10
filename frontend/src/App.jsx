import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { styles } from './styles/theme';

const Main = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={styles.container}>Loading SecureBank...</div>;
  }

  return user ? <Dashboard /> : <LoginPage />;
};

const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

export default App;