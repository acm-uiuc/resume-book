import Logo from "@/components/logo";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import React from "react";

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const { handleLogout } = useAuth();

  return (
    <div className="h-[120px] w-full z-10 bg-acm p-4 flex items-center">
      <Link href="/">
        <Logo width={130} className="text-white" />
      </Link>
      <h1 className="text-3xl font-bold text-white pl-5">Resume Book</h1>

      <div className="flex-1" />

      <div className="flex">
        <button
          onClick={handleLogout}
          className="mr-5 select-none	p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400"
        >
          Logout
        </button>
        <Link href="/profile">
          <button className="flex gap-2 mr-5 select-none leading-7 p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-7"
            >
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
            Profile
          </button>
        </Link>

        {/* LIGHT / DARK MODE 
        <div
          className="mr-4 ml-2"
          onClick={() => {
            setLightMode((prev) => !prev);
          }}
        >
          {lightMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-7 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-7 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          )}
        </div>*/}
      </div>
    </div>
  );
}
