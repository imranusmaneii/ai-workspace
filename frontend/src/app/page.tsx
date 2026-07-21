"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Workspace } from "@/types";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/chat/ChatInput";
import { Sparkles, LogIn } from "lucide-react";

const FREE_LIMIT = 10;

function getGuestMessageCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("noir_message_count") || "0", 10);
}

function incrementGuestMessageCount(): number {
  const count = getGuestMessageCount() + 1;
  localStorage.setItem("noir_message_count", String(count));
  return count;
}

function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setMsgCount(getGuestMessageCount());
    setIsGuest(!isAuthenticated());
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const limitReached = isGuest && msgCount >= FREE_LIMIT;

  const ensureGuestSession = useCallback(async () => {
    if (isAuthenticated()) return true;
    const existingToken = localStorage.getItem("access_token");
    if (existingToken) return true;

    try {
      const { data } = await api.post("/auth/guest");
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsGuest(true);
      return true;
    } catch {
      setError("Failed to start session. Please try again.");
      return false;
    }
  }, []);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      setError("");
      const ok = await ensureGuestSession();
      if (!ok) throw new Error("No session");

      if (isGuest && msgCount >= FREE_LIMIT) {
        throw new Error("limit");
      }

      let ws: Workspace | undefined;
      try {
        const { data: workspaces } = await api.get("/workspaces");
        ws = workspaces?.[0];
      } catch {}

      if (!ws) {
        const { data: newWs } = await api.post("/workspaces", { name: "My Workspace" });
        ws = newWs;
      }
      if (!ws) throw new Error("No workspace");

      const { data: chat } = await api.post(`/workspaces/${ws.id}/chats`, { title: message.slice(0, 80) });
      return { wsId: ws.id, chatId: chat.id, message };
    },
    onSuccess: ({ wsId, chatId, message }) => {
      if (isGuest) {
        const newCount = incrementGuestMessageCount();
        setMsgCount(newCount);
      }
      sessionStorage.setItem(`pending_message_${chatId}`, message);
      router.push(`/workspace/${wsId}/chat/${chatId}`);
    },
    onError: (err: any) => {
      if (err?.message === "limit" || err?.response?.status === 403) {
        setError("");
      } else {
        const msg = err?.response?.data?.detail || err?.message || "Something went wrong";
        setError(msg);
      }
    },
  });

  return (
    <div className="flex h-screen flex-col bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/25">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-center mb-2 text-foreground tracking-tight">
            {greeting}
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-10">
            What would you like to build today?
          </p>

          {limitReached ? (
            <div className="glass rounded-2xl p-8 text-center space-y-4">
              <p className="text-foreground font-medium">You&apos;ve used all {FREE_LIMIT} free messages</p>
              <p className="text-sm text-muted-foreground">Sign up to continue chatting with unlimited messages and memory.</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => router.push("/register")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-[#dc2626]/20"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 glass rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.06] transition-all"
                >
                  <LogIn size={14} /> Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              <ChatInput
                onSend={(msg) => sendMessage.mutate(msg)}
                isLoading={sendMessage.isPending}
              />

              {isGuest && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-[11px] text-muted-foreground/50">
                    {msgCount}/{FREE_LIMIT} free messages
                  </span>
                  <span className="text-[11px] text-muted-foreground/30">·</span>
                  <button onClick={() => router.push("/register")} className="text-[11px] text-[#dc2626] hover:underline">
                    Sign up for more
                  </button>
                </div>
              )}
            </>
          )}

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
