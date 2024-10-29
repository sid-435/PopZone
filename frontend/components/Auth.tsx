"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user data is available in localStorage
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/signin"); // Redirect to sign-in if no user is found
    }
  }, [router]);

  return <>{children}</>;
}