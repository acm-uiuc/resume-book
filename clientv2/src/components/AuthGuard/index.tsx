import React, { ReactNode } from 'react';
import { AuthRoleEnum, useAuth } from '../AuthContext';

interface AuthGuardProps {
  role?: AuthRoleEnum;
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ role, children }) => {
  const { isLoggedIn, userData } = useAuth();
  if (!isLoggedIn) {
    return null;
  }
  if (isLoggedIn && userData) {
    if ((role && userData.role === role) || !role) {
      return children;
    }
  }
  return null;
};
