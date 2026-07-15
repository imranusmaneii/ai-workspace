"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Workspace } from "@/types";
import { Send, Paperclip } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get("/workspaces");
      return data;
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustHeight = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-center mb-8 text-foreground">
            What can I help with?
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="relative rounded-2xl border border-border bg-background shadow-sm focus-within:border-primary/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
                onKeyDown={handleKeyDown}
                placeholder="Message Noir AI..."
                rows={1}
                className="w-full resize-none bg-transparent px-4 py-4 pr-24 text-sm outline-none placeholder:text-muted-foreground"
                style={{ minHeight: "52px", maxHeight: "200px" }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || sendMessage.isPending}
                  className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {sendMessage.isPending ? (
                    <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Noir AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
