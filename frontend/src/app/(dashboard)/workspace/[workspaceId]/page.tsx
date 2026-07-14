"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Workspace } from "@/types";
import { MessageSquare, FileText, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function WorkspacePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspace", params.workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${params.workspaceId}`);
      return data;
    },
  });

  const { data: documents } = useQuery({
    queryKey: ["documents", params.workspaceId],
    queryFn: async () => {
      const { data } = await api.get(
        `/workspaces/${params.workspaceId}/documents`
      );
      return data;
    },
  });

  const { data: memories } = useQuery({
    queryKey: ["memories", params.workspaceId],
    queryFn: async () => {
      const { data } = await api.get(
        `/workspaces/${params.workspaceId}/memories`
      );
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(
        `/workspaces/${params.workspaceId}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", params.workspaceId],
      });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(
        `/workspaces/${params.workspaceId}/documents/${docId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", params.workspaceId],
      });
    },
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
    <div className="mx-auto max-w-4xl p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{workspace?.name || "Workspace"}</h1>
        {workspace?.description && (
          <p className="mt-1 text-muted-foreground">{workspace.description}</p>
        )}
      </div>

      {/* Documents */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText size={18} />
            Documents
          </h2>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={14} />
            Upload
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx,.png,.jpg,.jpeg,.py,.js,.ts,.tsx,.jsx"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.file_size)} · {doc.status} ·{" "}
                      {doc.chunk_count} chunks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteDocMutation.mutate(doc.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        )}
      </section>

      {/* Memory */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Memory</h2>
        {memories && memories.length > 0 ? (
          <div className="space-y-2">
            {memories.map((mem: any) => (
              <div
                key={mem.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                {mem.content}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No memories stored yet
          </p>
        )}
      </section>
    </div>
  );
}
