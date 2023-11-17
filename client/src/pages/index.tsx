import ResumeViewer from "@/components/resume-viewer";
import { useAuthStatus } from "@/providers/shared-auth.provider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { status } = useAuthStatus();

  if (status === "none") return <></>; // wait for redirect
  if (status === "recruiter") return <ResumeViewer />; // wait for redirect
  if (status === "student") {
    // student hone page??
    router.push("/profile");
    return <></>;
  }

  return <></>;
}
