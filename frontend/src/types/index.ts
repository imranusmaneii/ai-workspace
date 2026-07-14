export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  chat_count: number;
  document_count: number;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  model_provider: string;
  model_name: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  artifact_data?: Record<string, unknown> | null;
  token_count?: number | null;
  model_provider?: string | null;
  model_name?: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: "processing" | "ready" | "failed";
  chunk_count: number;
  created_at: string;
}

export interface Memory {
  id: string;
  content: string;
  created_at: string;
}

export interface LLMModel {
  id: string;
  name: string;
  max_tokens: number;
}

export interface LLMProviderModels {
  provider: string;
  models: LLMModel[];
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SearchResults {
  chats: { id: string; title: string; snippet: string }[];
  documents: { id: string; filename: string; snippet: string }[];
}
