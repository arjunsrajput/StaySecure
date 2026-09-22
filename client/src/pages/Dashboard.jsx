import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect based on role
  const roleRoutes = {
    ADMIN: '/admin/dashboard',
    CUSTOMER: '/customer/dashboard',
    ROOM_MANAGER: '/room-manager/dashboard',
    APPROVAL_MANAGER: '/approval/dashboard',
    ACCOUNTANT: '/accountant/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
    AUDITOR: '/auditor/dashboard',
  };

  const redirectPath = roleRoutes[user?.role] || '/';

  return <Navigate to={redirectPath} replace />;
};

export default Dashboard;
