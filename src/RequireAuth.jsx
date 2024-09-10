import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContextProvider';

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { is_login, user } = React.useContext(AuthContext);

  if (!is_login) {
    // return <Navigate to="/loginpassword" state={{ path: location.pathname }} />;
    return <Navigate to="/login" state={{ path: location.pathname }} />;
  }

  if (user.subscription_expire == 0) {
    return <Navigate to="/subscription" state={{ path: location.pathname }} />;
  }

  return children;
};
