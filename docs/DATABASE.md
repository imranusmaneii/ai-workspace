# Database Schema

## Overview

PostgreSQL database managed via Supabase with SQLAlchemy ORM and Alembic migrations.

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | Unique |
| name | VARCHAR(255) | |
| avatar_url | TEXT | |
| auth_provider | VARCHAR(50) | 'email' or 'google' |
| password_hash | VARCHAR(255) | NULL for OAuth |
| is_active | BOOLEAN | |
| is_admin | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### workspaces
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| name | VARCHAR(255) | |
| description | TEXT | |
| settings | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### chats
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| workspace_id | UUID | FK → workspaces |
| title | VARCHAR(500) | |
| model_provider | VARCHAR(50) | |
| model_name | VARCHAR(100) | |
| system_prompt | TEXT | |
| settings | JSONB | |
| is_archived | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| chat_id | UUID | FK → chats |
| role | VARCHAR(20) | user, assistant, system |
| content | TEXT | |
| model_provider | VARCHAR(50) | |
| model_name | VARCHAR(100) | |
| tokens_used | INTEGER | |
| metadata | JSONB | |
| is_edited | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| workspace_id | UUID | FK → workspaces |
| name | VARCHAR(500) | |
| file_type | VARCHAR(50) | |
| file_size | BIGINT | |
| file_path | TEXT | |
| content | TEXT | Extracted text |
| status | VARCHAR(50) | processing, ready, failed |
| chunk_count | INTEGER | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### document_chunks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| document_id | UUID | FK → documents |
| content | TEXT | |
| chunk_index | INTEGER | |
| token_count | INTEGER | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

### workspace_memory
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| workspace_id | UUID | FK → workspaces |
| key | VARCHAR(255) | Unique per workspace |
| content | TEXT | |
| memory_type | VARCHAR(50) | general, user_preference, fact |
| is_pinned | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

## Relationships

```
users 1──N workspaces
workspaces 1──N chats
workspaces 1──N documents
workspaces 1──N workspace_memory
chats 1──N messages
documents 1──N document_chunks
```

## Data Isolation

Documents and memory are scoped to workspaces. A user can have multiple workspaces. Documents never leak between workspaces — enforced by foreign keys and RLS policies.

## Vector Store (ChromaDB)

Embeddings are stored in ChromaDB (not PostgreSQL). Each workspace maps to a ChromaDB collection. Chunks reference PostgreSQL document_chunks by ID.
