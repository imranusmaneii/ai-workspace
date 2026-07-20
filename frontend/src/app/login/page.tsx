"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthResponse } from "@/types";
import GoogleSignInButton from "@/components/GoogleSignIn";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c]">
              <Sparkles size={18} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Noir AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <GoogleSignInButton mode="login" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground/60">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" required />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#dc2626]/20">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/register" className="text-[#dc2626] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
