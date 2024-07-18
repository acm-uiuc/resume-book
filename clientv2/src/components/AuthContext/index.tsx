import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useMsal } from '@azure/msal-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import {
  AuthenticationResult,
  InteractionRequiredAuthError,
  InteractionStatus,
} from '@azure/msal-browser';
import { MantineProvider } from '@mantine/core';
import FullScreenLoader from './LoadingScreen';

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
  const {
    isLoading,
    isAuthenticated,
    user,
    logout: kindeLogout,
    getToken: getKindeToken,
    getPermission: getKindePermission,
  } = useKindeAuth();

  const [userData, setUserData] = useState<AuthContextData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !userData) {
      const isRecruiter = getKindePermission('recruiter:resume-book').isGranted;
      if (!isRecruiter) {
        setUserData(null);
        setIsLoggedIn(false);
        window.location.href = '/';
      } else {
        setUserData({
          email: user?.email!,
          name: `${user?.given_name} ${user?.family_name}`,
          authenticationMethod: AuthSourceEnum.LOCAL,
          role: AuthRoleEnum.RECRUITER,
        });
        setIsLoggedIn(true);
      }
    }
  }, [isAuthenticated, isLoading, user, userData, getKindePermission]);

  useEffect(() => {
    const handleRedirect = async () => {
      const response = await instance.handleRedirectPromise();
      if (response) {
        handleMsalResponse(response);
      } else if (accounts.length > 0) {
        // User is already logged in, set the state
        const [lastName, firstName] = accounts[0].name?.split(',')!;
        setUserData({
          email: accounts[0].username,
          name: `${firstName} ${lastName}`,
          authenticationMethod: AuthSourceEnum.MSAL,
          role: AuthRoleEnum.STUDENT,
        });
        setIsLoggedIn(true);
      }
    };

    if (inProgress === InteractionStatus.None) {
      handleRedirect();
    }
  }, [inProgress, accounts, instance]);

  const handleMsalResponse = useCallback((response: AuthenticationResult) => {
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
  }, []);

  const getToken = useCallback(async () => {
    if (!userData) {
      return null;
    }
    if (userData?.authenticationMethod === AuthSourceEnum.MSAL) {
      try {
        const msalAccounts = instance.getAllAccounts();
        if (msalAccounts.length > 0) {
          const silentRequest = {
            account: msalAccounts[0],
            scopes: ['.default'], // Adjust scopes as needed
          };
          const tokenResponse = await instance.acquireTokenSilent(silentRequest);
          return tokenResponse.accessToken;
        }
        throw new Error('More than one account found, cannot proceed.');
      } catch (error) {
        console.error('Silent token acquisition failed.', error);
        if (error instanceof InteractionRequiredAuthError) {
          // Fallback to interaction when silent token acquisition fails
          try {
            const interactiveRequest = {
              scopes: ['.default'], // Adjust scopes as needed
              redirectUri: '/login', // Redirect URI after login
            };
            const tokenResponse: any = await instance.acquireTokenRedirect(interactiveRequest);
            return tokenResponse.accessToken;
          } catch (interactiveError) {
            console.error('Interactive token acquisition failed.', interactiveError);
            throw interactiveError;
          }
        } else {
          throw error;
        }
      }
    }
    if (userData?.authenticationMethod === AuthSourceEnum.LOCAL) {
      return getKindeToken();
    }
    throw new Error('Unknown authentication method.');
  }, [userData, instance, getKindeToken]);

  const loginMsal = useCallback(() => {
    instance.loginRedirect();
  }, [instance]);

  const logout = useCallback(async () => {
    if (userData?.authenticationMethod === AuthSourceEnum.MSAL) {
      await instance.logoutRedirect();
      setIsLoggedIn(false);
      setUserData(null);
    } else {
      if (isAuthenticated && !isLoading) {
        console.log('logging out');
        kindeLogout();
      }
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [instance, isAuthenticated, isLoading, kindeLogout, userData]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, loginMsal, logout, getToken }}>
      {isLoading || inProgress !== InteractionStatus.None ? (
        <MantineProvider>
          <FullScreenLoader />
        </MantineProvider>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
