// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading security check...</div>;

  // 1. Not logged in? Go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged in but wrong role? (e.g. User trying to access Admin)
  if (allowedRole && user.role !== allowedRole) {
    alert("Access Denied: You do not have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  // 3. Allowed! Render the page.
  return children;
};

export default ProtectedRoute;