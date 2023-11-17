import { useAuthStatus } from "@/providers/shared-auth.provider";
import { SilentRequest } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { stat } from "fs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

export const useAuth = () => {
  // const isAuthenticated = useIsAuthenticated();
  // if (!isAuthenticated) throw new Error("Not authenticated");

  const { status, setStatus } = useAuthStatus();

  useEffect(() => {
    console.log("STATUS CHANGED", status);
  }, [status]);

  const [recruiterCookies, setRecruiterCookie, removeRecruiterCookie] =
    useCookies(["recruiter-token"]);
  // if (
  //   status === "recruiter" &&
  //   recruiterCookies["recruiter-token"] === undefined
  // )
  //   throw new Error("No token");

  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const [cookies, setCookie, removeCookie] = useCookies(["msal-token"]);

  const getToken = async (): Promise<string> => {
    if (status !== "student") throw new Error("Not a student");

    const token = cookies["msal-token"];
    if (token !== undefined) return token;

    const tokenRequest: SilentRequest = {
      account: accounts[0],
      scopes: ["User.Read"],
    };

    const response = await instance.acquireTokenPopup(tokenRequest);
    const expires = response?.expiresOn;
    const accessToken = response?.accessToken;
    accessToken && expires && setCookie("msal-token", accessToken, { expires });
    return response.accessToken;
    // console.log(response, response.fromCache, response.accessToken);
  };

  const handleRecruiterLogin = (email: string, password: string) => {
    setStatus("recruiter");
    // fetch from backend...
    // redirect
    router.push("/");
  };

  const handleStudentLogin = async () => {
    setStatus("student");

    const token = cookies["msal-token"];

    if (!isAuthenticated && !token) {
      const result = await instance.loginPopup();

      const expires = result?.expiresOn;
      const accessToken = result?.accessToken;

      accessToken &&
        expires &&
        setCookie("msal-token", accessToken, { expires });
    }

    const new_user = false; // fetch from db...
    const incomplete_profile = false; // fetch from db...

    if (new_user || incomplete_profile) router.push("/register");
    else router.push("/profile");
  };

  const handleLogout = async () => {
    console.log("CALLED LOGOUT.");
    switch (status) {
      case "recruiter":
        removeRecruiterCookie("recruiter-token");
        setStatus("none");
        break;
      case "student":
        /* calling this will force user through azure logout flow
           is this what we want? expected behavior???
        await instance.logoutRedirect();
        */
        removeCookie("msal-token");
        setStatus("none");
        break;
    }
  };

  return {
    handleStudentLogin,
    handleRecruiterLogin,
    handleLogout,
    getToken,
  };
};
