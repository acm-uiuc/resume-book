import "@/styles/globals.css";
import { Configuration, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

import type { AppProps } from "next/app";

import { DM_Sans } from "next/font/google";

const dm_sans = DM_Sans({
	weight: ["400", "500", "700"],
	subsets: ["latin"],
});

const TENANT_ID = process.env.NEXT_PUBLIC_AAD_TENANT_ID || "common";
const CLIENT_ID = process.env.NEXT_PUBLIC_AAD_CLIENT_ID || "";

const configuration: Configuration = {
	auth: {
		clientId: CLIENT_ID,
		authority: `https://login.microsoftonline.com/${TENANT_ID}`,
		redirectUri: "http://localhost:3000/auth-template",
	},
};

const pca = new PublicClientApplication(configuration);

export default function App({ Component, pageProps }: AppProps) {
	return (
		<main className={dm_sans.className}>
			<MsalProvider instance={pca}>
				<Component {...pageProps} />
			</MsalProvider>
		</main>
	);
}
