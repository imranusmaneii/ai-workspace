"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Message } from "@/types";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";

export default function ChatPage({
  params,
}: {
  params: Promise<{ workspaceId: string; chatId: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [resolvedParams, setResolvedParams] = useState<{ workspaceId: string; chatId: string } | null>(null);
  const pendingSentRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");

  useEffect(() => { params.then(setResolvedParams); }, [params]);

  const workspaceId = resolvedParams?.workspaceId ?? "";
  const chatId = resolvedParams?.chatId ?? "";

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", chatId],
    queryFn: async () => { const { data } = await api.get(`/chats/${chatId}/messages`); return data; },
    enabled: !!chatId,
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, created_at: new Date().toISOString() };
    queryClient.setQueryData<Message[]>(["messages", chatId], (old) => [...(old || []), userMsg]);

    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "", created_at: new Date().toISOString() };
    queryClient.setQueryData<Message[]>(["messages", chatId], (old) => [...(old || []), assistantMsg]);

    setIsStreaming(true);
    bufferRef.current = "";

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      console.log("[Noir AI] Request sent:", { chatId, content: content.slice(0, 50) });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ content, stream: true }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP ${response.status}: Failed to send message`);
      }

      console.log("[Noir AI] Response received, streaming...");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let errored = false;

      if (reader) {
        let partialChunk = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          partialChunk += text;

          const lines = partialChunk.split("\n");
          partialChunk = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "content") {
                  accumulated += data.content;
                  bufferRef.current = accumulated;
                  queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
                    if (!old) return old;
                    const updated = [...old];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
                    return updated;
                  });
                } else if (data.type === "error") {
                  errored = true;
                  const errorMsg = data.content || "Something went wrong.";
                  queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
                    if (!old) return old;
                    const updated = [...old];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${errorMsg}` };
                    return updated;
                  });
                } else if (data.type === "done") {
                  console.log("[Noir AI] Stream finished:", accumulated.length, "chars");
                }
              } catch {}
            }
          }
        }

        if (!accumulated && !errored) {
          queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
            if (!old) return old;
            const updated = [...old];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: "Error: No response received. Please check your API key configuration.",
            };
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("[Noir AI] Stream aborted by user");
        queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
          if (!old) return old;
          const updated = [...old];
          const current = updated[updated.length - 1];
          if (current && current.role === "assistant" && !current.content) {
            updated[updated.length - 1] = { ...current, content: bufferRef.current || "*Generation stopped.*" };
          }
          return updated;
        });
      } else {
        console.error("[Noir AI] Send error:", err);
        queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
          if (!old) return old;
          const updated = [...old];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: `Error: ${err.message || "Failed to send message. Check your connection and API configuration."}`,
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    }
  }, [chatId, isStreaming, queryClient]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!messages || messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
      if (!old) return old;
      const filtered = old.filter((m) => m.id !== old[old.length - 1]?.id);
      return filtered;
    });

    sendMessage(lastUserMsg.content);
  }, [messages, chatId, queryClient, sendMessage]);

  // Send pending message from home page
  useEffect(() => {
    if (!chatId || pendingSentRef.current || isStreaming) return;
    const pending = sessionStorage.getItem(`pending_message_${chatId}`);
    if (pending) {
      sessionStorage.removeItem(`pending_message_${chatId}`);
      pendingSentRef.current = true;
      setTimeout(() => sendMessage(pending), 100);
    }
  }, [chatId, isStreaming, sendMessage]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (!resolvedParams) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent" />
      </div>
    );
  }

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent" />
          </div>
        ) : hasMessages ? (
          <div className="mx-auto max-w-3xl space-y-6 p-4 pt-16 pb-36">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1 && msg.role === "assistant"}
                onRegenerate={handleRegenerate}
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            {!isStreaming && (
              <div className="animate-fade-in text-center">
                <p className="text-lg font-medium text-foreground">Start a conversation</p>
                <p className="mt-1 text-sm">Type a message below to begin</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-5 px-4 pointer-events-none">
        <div className="mx-auto max-w-3xl pointer-events-auto">
          <ChatInput onSend={sendMessage} isLoading={isStreaming} onStop={handleStop} />
        </div>
      </div>
    </div>
  );
}
