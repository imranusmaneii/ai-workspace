"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import GoogleSignInButton from "@/components/GoogleSignIn";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      sessionStorage.setItem("verify_email", email);
      router.replace("/verify-email");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
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
          <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>

        <GoogleSignInButton mode="register" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground/60">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#dc2626]/20">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-[#dc2626] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
