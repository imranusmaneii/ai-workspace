"use client";

import { useState, useRef, useCallback } from "react";
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
  Pencil,
  Trash2,
  Check,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [hoverOpen, setHoverOpen] = useState(false);
  const [clickOpen, setClickOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = clickOpen || hoverOpen;

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setHoverOpen(false), 300);
  }, []);

  const toggleClick = useCallback(() => {
    setClickOpen((prev) => {
      if (!prev) setHoverOpen(false);
      return !prev;
    });
  }, []);

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
      const { data } = await api.get(`/workspaces/${currentWorkspace.id}/chats`);
      return data;
    },
    enabled: !!currentWorkspace,
  });

  const createChat = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/workspaces/${currentWorkspace!.id}/chats`, { title: "New Chat" });
      return data;
    },
    onSuccess: (chat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push(`/workspace/${currentWorkspace!.id}/chat/${chat.id}`);
    },
  });

  const renameChat = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      await api.patch(`/chats/${chatId}`, { title });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });

  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      await api.delete(`/chats/${chatId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const filteredChats = chats?.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const submitRename = () => {
    if (editingChatId && editTitle.trim()) {
      renameChat.mutate({ chatId: editingChatId, title: editTitle.trim() });
    }
    setEditingChatId(null);
  };

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="font-semibold text-sm" onClick={() => setClickOpen(false)}>
          Noir AI
        </Link>
        <button
          onClick={toggleClick}
          className="rounded p-1 hover:bg-muted"
        >
          <X size={16} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-2">
        <button
          onClick={() => { createChat.mutate(); setClickOpen(false); }}
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
        {currentWorkspace && (
          <button
            onClick={() => {}}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <ChevronDown size={14} />
            <FolderOpen size={14} />
            {currentWorkspace.name}
          </button>
        )}

        <div className="mt-1 space-y-0.5">
          {filteredChats?.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center rounded-lg px-2 py-1.5 text-sm transition-colors ${
                pathname.includes(chat.id)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex w-full items-center gap-1">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename();
                      if (e.key === "Escape") setEditingChatId(null);
                    }}
                    className="flex-1 bg-transparent text-xs outline-none"
                  />
                  <button onClick={submitRename} className="rounded p-0.5 hover:bg-background"><Check size={12} /></button>
                </div>
              ) : (
                <>
                  <MessageSquare size={14} className="shrink-0" />
                  <Link
                    href={`/workspace/${currentWorkspace?.id}/chat/${chat.id}`}
                    onClick={() => setClickOpen(false)}
                    className="flex-1 truncate px-2"
                  >
                    {chat.title}
                  </Link>
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button onClick={() => startRename(chat)} className="rounded p-0.5 hover:bg-background"><Pencil size={12} /></button>
                    <button onClick={() => { if (confirm("Delete this chat?")) deleteChat.mutate(chat.id); }} className="rounded p-0.5 hover:bg-background hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {filteredChats?.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No chats yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          onClick={() => setClickOpen(false)}
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
      {/* Hamburger button - always on top when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleClick}
          onMouseEnter={handleMouseEnter}
          className="fixed left-3 top-3 z-50 rounded-lg border border-border bg-background p-2 hover:bg-muted transition-colors shadow-sm"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Desktop: hover panel */}
      {hoverOpen && !clickOpen && (
        <div
          className="fixed left-0 top-0 z-50 h-full hidden lg:block animate-in slide-in-from-left duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {sidebarContent}
        </div>
      )}

      {/* Click-open panel (mobile + desktop) */}
      {clickOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={toggleClick} />
          <div className="relative h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
