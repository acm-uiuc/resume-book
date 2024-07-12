import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./components/AuthContext";
import { MsalProvider } from "@azure/msal-react";
import { Configuration,  PublicClientApplication } from "@azure/msal-browser";


const configuration: Configuration = {
  auth: {
      clientId: "5178a6b1-f46d-40a2-b550-1389b9316446",
      authority: "https://login.microsoftonline.com/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e",
  },
  cache: { 
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

const pca = new PublicClientApplication(configuration);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MsalProvider instance={pca}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </MsalProvider>
);
