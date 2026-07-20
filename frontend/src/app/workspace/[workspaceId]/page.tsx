"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { FileText, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setWorkspaceId(p.workspaceId));
  }, [params]);

  const { data: workspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => { const { data } = await api.get(`/workspaces/${workspaceId}`); return data; },
    enabled: !!workspaceId,
  });

  const { data: documents } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: async () => { const { data } = await api.get(`/workspaces/${workspaceId}/documents`); return data; },
    enabled: !!workspaceId,
  });

  const { data: memories } = useQuery({
    queryKey: ["memories", workspaceId],
    queryFn: async () => { const { data } = await api.get(`/workspaces/${workspaceId}/memories`); return data; },
    enabled: !!workspaceId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/workspaces/${workspaceId}/documents`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] }),
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => { await api.delete(`/workspaces/${workspaceId}/documents/${docId}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6 pt-16">
          <button onClick={() => router.push("/")} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{workspace?.name || "Workspace"}</h1>
            {workspace?.description && <p className="mt-1 text-muted-foreground text-sm">{workspace.description}</p>}
          </div>

          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={18} /> Documents</h2>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity">
                <Plus size={14} /> Upload
                <input type="file" className="hidden" accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx,.png,.jpg,.jpeg,.py,.js,.ts,.tsx,.jsx" onChange={handleFileUpload} />
              </label>
            </div>
            {documents && documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(doc.file_size)} · {doc.status} · {doc.chunk_count} chunks</p>
                      </div>
                    </div>
                    <button onClick={() => deleteDocMutation.mutate(doc.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/60 glass rounded-xl p-8 text-center">No documents uploaded yet</p>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Memory</h2>
            {memories && memories.length > 0 ? (
              <div className="space-y-2">{memories.map((mem: any) => <div key={mem.id} className="glass rounded-xl px-4 py-3 text-sm">{mem.content}</div>)}</div>
            ) : (
              <p className="text-sm text-muted-foreground/60 glass rounded-xl p-8 text-center">No memories stored yet</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
