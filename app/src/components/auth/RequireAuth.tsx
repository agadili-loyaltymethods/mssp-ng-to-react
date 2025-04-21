
import { useAuthService } from '@/hooks/useAuthService';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';

export const RequireAuth: React.FC = () => {
  const { isAuthenticated$ } = useAuthService();
  const location = useLocation();

  if (!isAuthenticated$) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
