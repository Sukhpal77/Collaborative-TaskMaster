import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ element }) {
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return element; 
}

export default PrivateRoute;