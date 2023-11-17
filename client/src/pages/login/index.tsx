import Logo from "@/components/logo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStatus } from "@/providers/shared-auth.provider";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const { handleStudentLogin } = useAuth();
  const { status } = useAuthStatus();
  const router = useRouter();

  console.log(status);

  if (status === "student") router.push("/profile");
  if (status === "recruiter") router.push("/");

  return (
    <div className="text-slate-600 bg-slate-400 h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 justify-center border-2 rounded-lg p-8 bg-slate-300 w-80 h-[400px]">
        <Logo className="text-slate-600" width={140} />
        <h1 className="text-3xl font-bold">Resume Book</h1>
        <div className="flex flex-col gap-1 flex-1">
          <Link href="/login/recruiter">
            <button className="w-52 select-none p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
              Recruiter Login
            </button>
          </Link>
          <button
            onClick={handleStudentLogin}
            className="w-52 select-none p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400"
          >
            Student Login
          </button>
          {/* <button
            onClick={() => {
              console.log(status);
            }}
            className="w-52 select-none p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400"
          >
            TEST
          </button> */}
        </div>
      </div>
    </div>
  );
}
