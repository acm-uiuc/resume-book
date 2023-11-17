import Logo from "@/components/logo";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Recruiter() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const createErrorToast = (error: string) => {
    toast.error(error, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if ("" === email) {
      createErrorToast("Please enter your email");
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      createErrorToast("Please enter a valid email");
      return;
    }

    if ("" === password) {
      createErrorToast("Please enter a password");
      return;
    }

    if (password.length < 7) {
      createErrorToast("The password must be 8 characters or longer");
      return;
    }

    // Authentication calls will be made here...

    setLoading(false);
  };

  return (
    <div className="text-slate-600 bg-slate-400 h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 justify-center border-2 rounded-lg p-8 bg-slate-300 w-80 h-[400px]">
        <Logo className="text-slate-600" width={140} />
        <h1 className="text-3xl font-bold">Recruiter Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
          <div className="flex flex-col">
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="Enter your email here"
              onChange={(ev) => setEmail(ev.target.value)}
              className="select-none p-2 px-3 rounded-md text-slate-600 border-solid border-2 border-slate-400 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label>Password</label>
            <input
              type="password"
              value={password}
              placeholder="Enter your password here"
              onChange={(ev) => setPassword(ev.target.value)}
              className="select-none p-2 px-3 rounded-md text-slate-600 border-solid border-2 border-slate-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="select-none p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
