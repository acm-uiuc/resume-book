import { useAuth } from "@/hooks/useAuth";
import { useAuthStatus } from "@/providers/shared-auth.provider";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
} from "@azure/msal-react";

// Docs:
// https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-common/docs

export default function App() {
  const { handleStudentLogin, handleRecruiterLogin, handleLogout, getToken } =
    useAuth();

  const { status } = useAuthStatus();

  return (
    <div className="flex justify-center min-h-screen flex-col items-center px-4 flex-wrap gap-4">
      {/* <p>{"is Authenticated: " + JSON.stringify(isAuthenticated)}</p> */}
      {/* 
        <AuthenticatedTemplate>
          <p>At least one account is signed in!</p>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <p>No users are signed in!</p>
        </UnauthenticatedTemplate>
        <div>error: {JSON.stringify(error)}</div> */}
      {/* <div>instance: {JSON.stringify(instance)}</div> */}
      {/* <><pre>{JSON.stringify(instance, null, 2)}</pre></> */}
      status: {status}
      <button
        className="bg-slate-300 w-52 h-12 rounded-md border-2 border-slate-400"
        onClick={() => handleStudentLogin()}
      >
        handleStudentLogin
      </button>
      <button
        className="bg-slate-300 w-52 h-12 rounded-md border-2 border-slate-400"
        onClick={() => handleRecruiterLogin("", "")}
      >
        handleRecruiterLogin
      </button>
      <button
        className="bg-slate-300 w-52 h-12 rounded-md border-2 border-slate-400"
        onClick={() => handleLogout()}
      >
        handleLogout
      </button>
      <button
        className="bg-slate-300 w-52 h-12 rounded-md border-2 border-slate-400"
        onClick={() => {
          getToken().then((res) => console.log(res));
        }}
      >
        getToken
      </button>
    </div>
  );
}
