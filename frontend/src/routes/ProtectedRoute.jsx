import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const notifiedAuthRef = useRef(false);
  const notifiedRoleRef = useRef(false);

  const hasRoleAccess =
    !allowedRoles || (user?.role && allowedRoles.includes(user.role));

  useEffect(() => {
    if (!loading && !isAuthenticated && !notifiedAuthRef.current) {
      notifiedAuthRef.current = true;
      toast.error('Please sign in to continue.');
    } else if (
      !loading &&
      isAuthenticated &&
      allowedRoles &&
      !hasRoleAccess &&
      !notifiedRoleRef.current
    ) {
      notifiedRoleRef.current = true;
      toast.error('Access denied for your account role.');
    }
  }, [loading, isAuthenticated, allowedRoles, hasRoleAccess]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasRoleAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
