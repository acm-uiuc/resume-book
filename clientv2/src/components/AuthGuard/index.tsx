import React, { createContext, ReactNode, useContext, useState } from "react";
import { useAuth } from "../AuthContext";

interface AuthGuardProps {
  role?: string;
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ role, children }) => {
  const { isLoggedIn, userData } = useAuth();
  if (!isLoggedIn) {
    return null;
  }
  if (isLoggedIn && userData) {
    if (role && userData.role === role) {
      return children;
    } else {
      return null;
    }
  }
};
