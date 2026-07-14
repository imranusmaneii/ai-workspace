"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthResponse } from "@/types";

declare global {
  interface Window {
    google?: any;
    googleSignInCallback?: (response: any) => void;
  }
}

const GOOGLE_CLIENT_ID = "897981344237-slpl1n53sed77mgc3l2u9q7j7kbd7umk.apps.googleusercontent.com";

export default function GoogleSignInButton({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/google", {
        id_token: response.credential,
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.replace("/");
    } catch (err: any) {
      const btn = buttonRef.current;
      if (btn) {
        const errDiv = document.createElement("div");
        errDiv.className = "rounded-lg bg-destructive/10 p-3 text-sm text-destructive mt-3";
        errDiv.textContent = err.response?.data?.detail || "Google sign-in failed";
        btn.parentElement?.appendChild(errDiv);
        setTimeout(() => errDiv.remove(), 5000);
      }
    }
  }, [router]);

  useEffect(() => {
    window.googleSignInCallback = handleGoogleResponse;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => window.googleSignInCallback?.(response),
        });
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: mode === "login" ? "signin_with" : "signup_with",
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [handleGoogleResponse, mode]);

  return <div ref={buttonRef} className="w-full" />;
}
