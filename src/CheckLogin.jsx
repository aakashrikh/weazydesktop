import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContextProvider';

export const CheckLogin = ({ children }) => {
  const location = useLocation();
  const { is_login } = React.useContext(AuthContext);

  if (is_login) {
    return <Navigate to="/" state={{ path: location.pathname }} />;
  }

  return children;
};
