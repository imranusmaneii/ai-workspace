"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  Home,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

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
      setIsOpen(false);
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

  const toggleSidebar = useCallback(() => setIsOpen((p) => !p), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        if (isOpen) setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Plus, label: "New Chat", action: () => createChat.mutate(), disabled: !currentWorkspace },
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-noir-card border border-noir-border hover:bg-noir-surface transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <PanelLeft size={16} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full w-[272px] flex-col sidebar-gradient border-r border-noir-border">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#dc2626] to-[#b91c1c]">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Noir AI</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>

          <div className="px-3 mb-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else {
                    router.push(item.href!);
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150 disabled:opacity-40"
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="px-3 mb-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.04] pl-8 pr-3 py-1.5 text-xs outline-none focus:border-white/10 transition-colors placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {currentWorkspace && (
            <div className="px-3 mb-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                <FolderOpen size={12} />
                {currentWorkspace.name}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 pb-2">
            <div className="space-y-0.5">
              {filteredChats?.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                    pathname.includes(chat.id)
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
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
                      <button onClick={submitRename} className="rounded p-0.5 hover:bg-white/10"><Check size={12} /></button>
                    </div>
                  ) : (
                    <>
                      <MessageSquare size={14} className="shrink-0 opacity-50" />
                      <Link
                        href={`/workspace/${currentWorkspace?.id}/chat/${chat.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 truncate px-2.5 text-[13px]"
                      >
                        {chat.title}
                      </Link>
                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                        <button onClick={() => startRename(chat)} className="rounded p-1 hover:bg-white/10"><Pencil size={11} /></button>
                        <button onClick={() => { if (confirm("Delete this chat?")) deleteChat.mutate(chat.id); }} className="rounded p-1 hover:bg-white/10 hover:text-red-400"><Trash2 size={11} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {filteredChats?.length === 0 && (
                <p className="px-3 py-4 text-xs text-center text-muted-foreground/40">No chats yet</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.04] p-3 space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Settings size={15} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
