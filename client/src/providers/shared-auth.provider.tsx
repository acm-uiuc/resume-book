import { pca } from "@/config/msal";
import { MsalProvider } from "@azure/msal-react";
import { useRouter } from "next/router";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export type Status = "none" | "student" | "recruiter";

type SharedAuthContextType = {
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
};

const SharedAuthContext = createContext<SharedAuthContextType | null>(null);

export function SharedAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  console.log("reset!");
  const [status, setStatus] = useState<Status>("none");

  if (typeof window !== "undefined" && !router.pathname.startsWith("/login")) {
    if (status === "none") router.push("/login");
  }

  const value: SharedAuthContextType = {
    status,
    setStatus,
  };

  // if (!user) return <Loading />; // a loading component that prevents the page from rendering

  // return props.children;

  // if (status === "student")
  //   return (
  //     <SharedAuthContext.Provider value={value}></SharedAuthContext.Provider>
  //   );

  return (
    <SharedAuthContext.Provider value={value}>
      <MsalProvider instance={pca}>{children}</MsalProvider>
      {/* {children} */}
    </SharedAuthContext.Provider>
  );
}

export function useAuthStatus() {
  const context = useContext(SharedAuthContext);
  if (context === undefined || context === null)
    throw new Error("Provider is undefined.");
  return context;
}
