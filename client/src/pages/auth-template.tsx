import { InteractionType, SilentRequest } from "@azure/msal-browser";
import {
	AuthenticatedTemplate,
	MsalProvider,
	UnauthenticatedTemplate,
	useIsAuthenticated,
	useMsal,
	useMsalAuthentication,
} from "@azure/msal-react";

// Docs:
// https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-common/docs

export default function App() {
	const isAuthenticated = useIsAuthenticated();

	// const { login, result, error } = useMsalAuthentication(InteractionType.Redirect);
	const { instance, accounts, inProgress } = useMsal();

	const getTokenSilent = async () => {
		// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md#usemsal-hook

		const tokenRequest: SilentRequest = {
			account: accounts[0], // This is an example - Select account based on your app's requirements
			scopes: ["User.Read"],
		};

		// const data = await instance.acquireTokenSilent(tokenRequest);

		const response = await instance.acquireTokenPopup(tokenRequest);
	};

	return (
		<div className="flex items-center justify-center min-h-screen flex-col px-4 flex-wrap">
			<p>{"is Authenticated: " + JSON.stringify(isAuthenticated)}</p>
			{/* 
			<AuthenticatedTemplate>
				<p>At least one account is signed in!</p>
			</AuthenticatedTemplate>
			<UnauthenticatedTemplate>
				<p>No users are signed in!</p>
			</UnauthenticatedTemplate>
    <div>error: {JSON.stringify(error)}</div> */}
			{/* <div>instance: {JSON.stringify(instance)}</div> */}
			{isAuthenticated ? (
				<>
					{!!accounts[0].idToken ? (
						<p>{"token " + JSON.stringify(accounts[0].idToken)}</p>
					) : (
						<button onClick={() => getTokenSilent()}>silent token</button>
					)}
					<button onClick={() => instance.logoutRedirect()}>logout</button>
				</>
			) : (
				<button onClick={() => instance.loginPopup()}>login</button>
			)}
		</div>
	);
}
