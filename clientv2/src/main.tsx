import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import App from './App';
import { AuthProvider } from './components/AuthContext';

const msalConfiguration: Configuration = {
  auth: {
    clientId: '5178a6b1-f46d-40a2-b550-1389b9316446',
    authority: 'https://login.microsoftonline.com/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e',
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/logout`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

const pca = new PublicClientApplication(msalConfiguration);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <KindeProvider
    clientId="fdacad7aea554755844105f5606da0f6"
    domain="https://auth.acm.illinois.edu"
    redirectUri={window.location.origin}
    logoutUri={`${window.location.origin}/logout`}
  >
    <MsalProvider instance={pca}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MsalProvider>
  </KindeProvider>
);
