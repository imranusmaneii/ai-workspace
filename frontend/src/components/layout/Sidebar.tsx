"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Workspace, Chat } from "@/types";
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get("/workspaces");
      return data;
    },
  });

  const currentWorkspace = workspaces?.[0];

  const { data: chats } = useQuery<Chat[]>({
    queryKey: ["chats", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace) return [];
      const { data } = await api.get(
        `/workspaces/${currentWorkspace.id}/chats`
      );
      return data;
    },
    enabled: !!currentWorkspace,
  });

  const createChat = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/workspaces/${currentWorkspace!.id}/chats`,
        { title: "New Chat" }
      );
      return data;
    },
    onSuccess: (chat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push(`/workspace/${currentWorkspace!.id}/chat/${chat.id}`);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const filteredChats = chats?.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="font-semibold">
          AI Workspace
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded p-1 hover:bg-muted lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-2">
        <button
          onClick={() => createChat.mutate()}
          disabled={!currentWorkspace}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-muted pl-9 pr-3 py-1.5 text-xs outline-none"
          />
        </div>
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto px-3">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${workspaceOpen ? "" : "-rotate-90"}`}
          />
          <FolderOpen size={14} />
          {currentWorkspace?.name || "Workspace"}
        </button>

        {workspaceOpen && (
          <div className="mt-1 space-y-0.5">
            {filteredChats?.map((chat) => (
              <Link
                key={chat.id}
                href={`/workspace/${currentWorkspace?.id}/chat/${chat.id}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname.includes(chat.id)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <MessageSquare size={14} />
                <span className="truncate">{chat.title}</span>
              </Link>
            ))}
            {filteredChats?.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No chats yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-background p-2 lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
