import React from "react";

import Logo from "./Logo";

interface NavbarProps {
  setLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  lightMode: boolean;
}

export function Navbar({ setLightMode, lightMode }: NavbarProps) {
  return (
    <div className="h-fit w-full z-10 bg-acm p-4 flex items-center">
      <Logo width={130} height={130} />
      <h1 className="text-3xl font-bold text-white pl-5">Resume Book</h1>

      {/* SPACER */}
      <div className="flex-1 "></div>

      <div className="flex">
        <button className="mr-5 select-none	p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
          Recruiter Login
        </button>
        <button className="mr-5 select-none	p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
          Student Login
        </button>

        {/* LIGHT / DARK MODE */}
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
        </div>
      </div>
    </div>
  );
}
