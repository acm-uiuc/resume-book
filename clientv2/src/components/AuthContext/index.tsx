import React, { createContext, ReactNode, useContext, useState } from "react";

export enum AuthSourceEnum {
  MSAL,
  LOCAL,
}

export enum AuthRoleEnum {
  RECRUITER,
  STUDENT,
}

interface AuthContextDataWrapper {
  isLoggedIn: boolean;
  userData: AuthContextData | null;
  loginMsal: CallableFunction;
  loginBasic: CallableFunction;
  logout: CallableFunction;
}

export type AuthContextData = {
  email?: string;
  given_name?: string;
  family_name?: string;
  authentication_method?: AuthSourceEnum;
  role?: AuthRoleEnum;
  authToken?: string;
};

export const AuthContext = createContext({} as AuthContextDataWrapper);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<AuthContextData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const loginMsal = () => {
    setIsLoggedIn(true);
  };
  const loginBasic = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };
  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, loginMsal, loginBasic, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
