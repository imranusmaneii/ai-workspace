"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import api from "@/lib/api";
import { Message } from "@/types";
import { ArrowLeft, Send, Copy, Check } from "lucide-react";

export default function ChatPage({
  params,
}: {
  params: Promise<{ workspaceId: string; chatId: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [resolvedParams, setResolvedParams] = useState<{ workspaceId: string; chatId: string } | null>(null);

  useEffect(() => { params.then(setResolvedParams); }, [params]);

  const workspaceId = resolvedParams?.workspaceId ?? "";
  const chatId = resolvedParams?.chatId ?? "";

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", chatId],
    queryFn: async () => { const { data } = await api.get(`/chats/${chatId}/messages`); return data; },
    enabled: !!chatId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const userMsg = { id: crypto.randomUUID(), role: "user" as const, content, created_at: new Date().toISOString() };
      queryClient.setQueryData<Message[]>(["messages", chatId], (old) => [...(old || []), userMsg]);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ content, stream: true }),
      });
      if (!response.ok) throw new Error("Failed to send message");

      const assistantMsg = { id: crypto.randomUUID(), role: "assistant" as const, content: "", created_at: new Date().toISOString() };
      queryClient.setQueryData<Message[]>(["messages", chatId], (old) => [...(old || []), assistantMsg]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "content") {
                  accumulated += data.content;
                  queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
                    if (!old) return old;
                    const updated = [...old];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      }
      return accumulated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", chatId] }),
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  if (!resolvedParams) return <div className="flex h-full items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.push(`/workspace/${workspaceId}`)} className="rounded p-1 hover:bg-muted"><ArrowLeft size={18} /></button>
        <h1 className="text-sm font-medium">Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : messages && messages.length > 0 ? (
          <div className="mx-auto max-w-3xl space-y-6 p-4">
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <p className="text-lg">Start a conversation</p>
            <p className="mt-1 text-sm">Type a message below to begin</p>
          </div>
        )}
      </div>
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." rows={1} className="flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" style={{ minHeight: "24px", maxHeight: "120px" }} />
            <button type="submit" disabled={!input.trim() || sendMessage.isPending} className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Send size={16} /></button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        {message.role === "assistant" ? (
          <div className="markdown-content text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");
                if (match) return (
                  <div className="relative my-2">
                    <button onClick={copyToClipboard} className="absolute right-2 top-2 rounded bg-background/20 p-1 hover:bg-background/30">{copied ? <Check size={12} /> : <Copy size={12} />}</button>
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">{codeStr}</SyntaxHighlighter>
                  </div>
                );
                return <code className="rounded bg-background/20 px-1 py-0.5 text-xs">{codeStr}</code>;
              },
            }}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
