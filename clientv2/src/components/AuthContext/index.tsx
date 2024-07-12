import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { AuthenticationResult, InteractionStatus } from "@azure/msal-browser";

export enum AuthSourceEnum {
  MSAL,
  LOCAL,
}

export enum AuthRoleEnum {
  RECRUITER,
  STUDENT,
}

export function roleToString(e?: AuthRoleEnum) {
  switch (e) {
    case AuthRoleEnum.RECRUITER:
      return "Recruiter"
    case AuthRoleEnum.STUDENT:
      return "Student"
    default:
      return "Unknown"
  }
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
  name?: string;
  authenticationMethod?: AuthSourceEnum;
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

  const { instance, inProgress, accounts } = useMsal();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response) {
          handleMsalResponse(response);
        } else if (accounts.length > 0) {
          // User is already logged in, set the state
          setUserData({
            email: accounts[0].username,
            name: accounts[0].name,
            authenticationMethod: AuthSourceEnum.MSAL,
            role: AuthRoleEnum.STUDENT,
          });
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (inProgress === InteractionStatus.None) {
      handleRedirect();
    }
  }, [inProgress, accounts, instance]);

  const handleMsalResponse = (response: AuthenticationResult) => {
    if (response) {
      const account = response.account;
      if (account) {
        setUserData({
          email: account.username,
          name: account.name,
          authenticationMethod: AuthSourceEnum.MSAL,
          role: AuthRoleEnum.STUDENT,
          authToken: response.accessToken,
        });
        setIsLoggedIn(true);
      }
    }
  };

  const loginMsal = () => {
    instance.loginRedirect();
  };

  const loginBasic = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    if (userData?.authenticationMethod === AuthSourceEnum.MSAL) {
      instance?.logoutRedirect().then(() => {
        setIsLoggedIn(false);
        setUserData(null);
      });
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, loginMsal, loginBasic, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};