import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useMsal } from '@azure/msal-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { AuthenticationResult, InteractionStatus } from '@azure/msal-browser';

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
      return 'Recruiter';
    case AuthRoleEnum.STUDENT:
      return 'Student';
    default:
      return 'Unknown';
  }
}

interface AuthContextDataWrapper {
  isLoggedIn: boolean;
  userData: AuthContextData | null;
  loginMsal: CallableFunction;
  logout: CallableFunction;
  getToken: CallableFunction;
}

export type AuthContextData = {
  email?: string;
  name?: string;
  authenticationMethod?: AuthSourceEnum;
  role?: AuthRoleEnum;
};

export const AuthContext = createContext({} as AuthContextDataWrapper);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { instance, inProgress, accounts } = useMsal();
  const {isLoading, isAuthenticated, user, logout: kindeLogout, getToken: getKindeToken} = useKindeAuth();
  
  const [userData, setUserData] = useState<AuthContextData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>((isAuthenticated || accounts.length > 0) && !isLoading);
  if (isAuthenticated && !isLoading && !userData) {
    setUserData({
      email: user?.email!,
      name: `${user?.given_name} ${user?.family_name}`,
      authenticationMethod: AuthSourceEnum.LOCAL,
      role: AuthRoleEnum.RECRUITER
    })
    setIsLoggedIn(true);
  }

  useEffect(() => {
    const handleRedirect = async () => {
      const response = await instance.handleRedirectPromise();
      if (response) {
        handleMsalResponse(response);
      } else if (accounts.length > 0) {
        // User is already logged in, set the state
        setUserData({
          email: accounts[0].username,
          name: accounts[0].name,
          authenticationMethod: AuthSourceEnum.MSAL,
          role: AuthRoleEnum.STUDENT
        });
        setIsLoggedIn(true);
      }
    };

    if (inProgress === InteractionStatus.None) {
      handleRedirect();
    }
  }, [inProgress, accounts, instance]);

  const handleMsalResponse = (response: AuthenticationResult) => {
    if (response) {
      const { account } = response;
      if (account) {
        setUserData({
          email: account.username,
          name: account.name,
          authenticationMethod: AuthSourceEnum.MSAL,
          role: AuthRoleEnum.STUDENT,
        });
        setIsLoggedIn(true);
      }
    }
  };

  const getToken = async () => {
    if (!userData) {
      return null;
    }
    if (userData?.authenticationMethod === AuthSourceEnum.MSAL) {
      return null;
    } else if (userData?.authenticationMethod === AuthSourceEnum.LOCAL) {
      return await getKindeToken();
    } else {
      throw new Error("Unknown authentication method.")
    }
  }
  const loginMsal = () => {
    instance.loginRedirect();
  };

  const logout = async () => {
    if (userData?.authenticationMethod === AuthSourceEnum.MSAL) {
      instance?.logoutRedirect().then(() => {
        setIsLoggedIn(false);
        setUserData(null);
      });
    } else {
      if (isAuthenticated && !isLoading) {
        kindeLogout();
      }
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, loginMsal, logout, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
