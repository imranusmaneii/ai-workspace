"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Workspace } from "@/types";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/chat/ChatInput";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get("/workspaces");
      return data;
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      setError("");
      let ws = workspaces?.[0];
      if (!ws) {
        const { data: newWs } = await api.post("/workspaces", { name: "My Workspace" });
        ws = newWs;
        queryClient.setQueryData<Workspace[]>(["workspaces"], (old) => [...(old || []), newWs]);
      }
      if (!ws) throw new Error("No workspace");
      const { data: chat } = await api.post(`/workspaces/${ws.id}/chats`, { title: message.slice(0, 80) });
      return { wsId: ws.id, chatId: chat.id, message };
    },
    onSuccess: ({ wsId, chatId, message }) => {
      sessionStorage.setItem(`pending_message_${chatId}`, message);
      router.push(`/workspace/${wsId}/chat/${chatId}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Something went wrong";
      setError(msg);
    },
  });

  return (
    <div className="flex h-screen flex-col bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/20">
              <Sparkles size={22} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-center mb-2 text-foreground tracking-tight">
            {greeting}, Imran
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-10">
            What would you like to build today?
          </p>

          <ChatInput
            onSend={(msg) => sendMessage.mutate(msg)}
            isLoading={sendMessage.isPending}
          />

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center text-sm text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground/40 mt-6">
            Noir AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
