import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";
import { MsalProvider } from "@azure/msal-react";
import { pca } from "@/config/msal";

type Status = "none" | "student" | "recruiter";

type RecruiterAuthContextType = {
	status: Status;
	setStatus: Dispatch<SetStateAction<Status>>;
};

const RecruiterAuthContext = createContext<RecruiterAuthContextType | null>(null);

export function RecruiterAuthProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<Status>("none");

	const value: RecruiterAuthContextType = {
		status,
		setStatus,
	};

	return <RecruiterAuthContext.Provider value={value}>{children}</RecruiterAuthContext.Provider>;
}

export function useRecruiterAuth() {
	const context = useContext(RecruiterAuthContext);
	if (context === undefined) throw new Error("Provider is undefined.");
	return context;
}
