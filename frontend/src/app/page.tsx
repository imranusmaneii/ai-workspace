"use client";

import AppShell from "@/components/layout/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import { Workspace } from "@/types";
import { Plus, MessageSquare, FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get("/workspaces");
      return data;
    },
  });

  const createWorkspace = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/workspaces", { name: "My Workspace" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Noir AI</h1>
            <p className="mt-2 text-muted-foreground">Your intelligent workspace for conversations and documents</p>
          </div>
          <button onClick={() => createWorkspace.mutate()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            New Workspace
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.id}`} className="group rounded-xl border border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <h3 className="text-lg font-semibold">{ws.name}</h3>
                {ws.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ws.description}</p>}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageSquare size={12} />{ws.chat_count} chats</span>
                  <span className="flex items-center gap-1"><FileText size={12} />{ws.document_count} docs</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open workspace <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No workspaces yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first workspace to get started</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
