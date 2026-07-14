"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { name?: string }) => {
      const { data } = await api.patch("/users/me", updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h1 className="mb-8 text-2xl font-bold">Settings</h1>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            defaultValue={user?.name || ""}
            onBlur={(e) => {
              if (e.target.value !== user?.name) {
                updateProfile.mutate({ name: e.target.value });
              }
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm opacity-60"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Auth Provider
          </label>
          <input
            type="text"
            value={user?.auth_provider || ""}
            disabled
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm opacity-60"
          />
        </div>
      </section>

      <section className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">
            Dark mode is enabled by default. Theme switching coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}
