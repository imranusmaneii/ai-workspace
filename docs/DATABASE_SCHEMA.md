# Database Schema

## Overview

PostgreSQL managed via Supabase. Migrations via Alembic. ORM via SQLAlchemy.

## Tables

### users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| email | VARCHAR(255) | unique, not null |
| name | VARCHAR(255) | |
| avatar_url | TEXT | nullable |
| password_hash | VARCHAR(255) | nullable (Google-only users) |
| auth_provider | ENUM('email', 'google') | not null |
| google_id | VARCHAR(255) | nullable, unique |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### workspaces

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| user_id | UUID (FK → users) | not null |
| name | VARCHAR(255) | not null |
| description | TEXT | nullable |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### chats

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | not null |
| title | VARCHAR(500) | default 'New Chat' |
| model_provider | VARCHAR(50) | default 'openai' |
| model_name | VARCHAR(100) | default 'gpt-4o' |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### messages

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| chat_id | UUID (FK → chats) | not null |
| role | ENUM('user', 'assistant', 'system') | not null |
| content | TEXT | not null |
| artifact_data | JSONB | nullable |
| token_count | INTEGER | nullable |
| model_provider | VARCHAR(50) | nullable |
| model_name | VARCHAR(100) | nullable |
| created_at | TIMESTAMP | default now() |

### documents

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | not null |
| uploaded_by | UUID (FK → users) | not null |
| filename | VARCHAR(500) | not null |
| file_type | VARCHAR(50) | not null |
| file_size | BIGINT | not null |
| file_url | TEXT | not null |
| status | ENUM('processing', 'ready', 'failed') | default 'processing' |
| chunk_count | INTEGER | default 0 |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now() |

### memories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | default gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | not null |
| content | TEXT | not null |
| embedding_id | VARCHAR(255) | nullable (ChromaDB reference) |
| created_at | TIMESTAMP | default now() |

## Indexes

- `idx_workspaces_user_id` on workspaces(user_id)
- `idx_chats_workspace_id` on chats(workspace_id)
- `idx_chats_updated_at` on chats(updated_at DESC)
- `idx_messages_chat_id` on messages(chat_id)
- `idx_documents_workspace_id` on documents(workspace_id)
- `idx_memories_workspace_id` on memories(workspace_id)

## Row Level Security (RLS)

All tables enforce RLS so users can only access their own data:

- Workspaces: `user_id = auth.uid()`
- Chats: workspace owner check via workspaces join
- Messages: chat owner check via chats + workspaces join
- Documents: workspace owner check via workspaces join
- Memories: workspace owner check via workspaces join
