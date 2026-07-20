"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: user } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => { const { data } = await api.get("/users/me"); return data; },
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6 pt-16">
          <button onClick={() => router.back()} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="mb-8 text-2xl font-bold tracking-tight">Settings</h1>
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Name</label>
                <input type="text" defaultValue={user?.name || ""} onBlur={(e) => { if (e.target.value !== user?.name) api.patch("/users/me", { name: e.target.value }); }} className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
                <input type="email" value={user?.email || ""} disabled className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Auth Provider</label>
                <input type="text" value={user?.auth_provider || ""} disabled className="w-full glass rounded-xl bg-transparent border-none px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
