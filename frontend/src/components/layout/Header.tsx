"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/types";

export default function Header() {
  const { data: user } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="w-8 lg:w-0" />
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8854a]/15 text-xs font-medium text-[#e8854a]">
          {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
