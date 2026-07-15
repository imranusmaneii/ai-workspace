"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthResponse } from "@/types";
import { Sparkles } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("verify_email");
    if (stored) setEmail(stored);
    else router.replace("/register");
  }, [router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every((c) => c) && newCode.join("").length === 6) handleVerify(newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setCode(newCode);
      const nextEmpty = newCode.findIndex((c) => !c);
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
      if (pasted.length === 6) handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/verify-email", { email, code: fullCode });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      sessionStorage.removeItem("verify_email");
      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid code");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/auth/resend-code", { email });
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8854a] to-[#c96f3a]">
              <Sparkles size={18} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Noir AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Check your email for the verification code</p>
          {email && <p className="mt-1 text-xs text-muted-foreground/60">{email}</p>}
        </div>

        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400 text-center">{error}</div>}

        <div className="flex justify-center gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="h-12 w-12 rounded-xl glass bg-transparent border-none text-center text-lg font-medium outline-none focus:ring-2 focus:ring-[#e8854a]/30"
              disabled={loading}
            />
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e8854a] border-t-transparent" />
            Verifying...
          </div>
        )}

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground/60">Resend code in {resendTimer}s</p>
          ) : (
            <button onClick={handleResend} disabled={resending} className="text-sm text-[#e8854a] hover:underline disabled:opacity-50">
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/register" className="text-[#e8854a] hover:underline">Back to sign up</Link>
        </p>
      </div>
    </div>
  );
}
