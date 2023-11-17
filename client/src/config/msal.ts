import { Configuration, PublicClientApplication } from "@azure/msal-browser";

const TENANT_ID = process.env.NEXT_PUBLIC_AAD_TENANT_ID || "common";
const CLIENT_ID = process.env.NEXT_PUBLIC_AAD_CLIENT_ID || "";

const configuration: Configuration = {
	auth: {
		clientId: CLIENT_ID,
		authority: `https://login.microsoftonline.com/${TENANT_ID}`,
		redirectUri: "http://localhost:3000/auth-template",
	},
	cache: {
		cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
		storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
	},
};

export const pca = new PublicClientApplication(configuration);
