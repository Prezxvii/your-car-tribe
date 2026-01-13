import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const userString = localStorage.getItem('user');
  let isAdmin = false;

  if (userString) {
    try {
      const userData = JSON.parse(userString);
      isAdmin = userData.role === 'admin';
    } catch (e) {
      isAdmin = false;
    }
  }

  // If admin, render the child routes (the Admin Dashboard)
  // If not admin, redirect to homepage
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;