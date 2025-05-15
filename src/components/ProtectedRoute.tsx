import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'voter';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // If authentication is still being checked, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-t-blue-600 border-r-blue-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Role check if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect admin to admin dashboard and voters to voter dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/voter" />;
    }
  }
  
  // All checks passed, render the children
  return <>{children}</>;
};

export default ProtectedRoute;