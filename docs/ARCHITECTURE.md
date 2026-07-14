# Architecture

## High-Level Overview

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT LAYER                       │
│                                                       │
│  ┌─────────────┐    ┌──────────────────────────────┐ │
│  │   Browser    │───▶│  Next.js 15 (Vercel)         │ │
│  │              │◀───│  React + TypeScript + Tailwind│ │
│  └─────────────┘    └──────────────┬───────────────┘ │
└─────────────────────────────────────┼─────────────────┘
                                      │ HTTPS / SSE
┌─────────────────────────────────────┼─────────────────┐
│                    API LAYER        │                  │
│                                     ▼                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │         FastAPI (Railway / Render)               │ │
│  │                                                  │ │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────────┐ │ │
│  │  │ Auth    │ │ Routes   │ │ SSE Streaming     │ │ │
│  │  │ Module  │ │ Module   │ │ Handler           │ │ │
│  │  └────┬────┘ └────┬─────┘ └────────┬──────────┘ │ │
│  └───────┼───────────┼────────────────┼─────────────┘ │
│          │           │                │               │
│  ┌───────▼───────────▼────────────────▼─────────────┐ │
│  │               SERVICE LAYER                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │ Auth Svc │ │ Chat Svc │ │ RAG Service      │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │ │
│  └───────┬───────────┬────────────────┬─────────────┘ │
└──────────┼───────────┼────────────────┼───────────────┘
           │           │                │
┌──────────▼───────────▼────────────────▼───────────────┐
│                   DATA LAYER                          │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │PostgreSQL│  │ ChromaDB │  │ Object Storage    │   │
│  │(Supabase)│  │ (Vectors)│  │ (File uploads)    │   │
│  └──────────┘  └──────────┘  └───────────────────┘   │
└───────────────────────────────────────────────────────┘
```

## Backend Architecture

```
app/
├── core/           # Config, security, deps, exceptions
├── api/v1/         # Route handlers (thin controllers)
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic request/response schemas
├── services/       # Business logic layer
├── repositories/   # Data access layer (DB queries)
├── llm/            # LLM provider abstraction
├── rag/            # RAG pipeline (ingest, retrieve)
└── utils/          # Helpers (file parsing, OCR, etc.)
```

### Request Lifecycle

```
HTTP Request
  → API Route (validation, auth check)
    → Service (business logic)
      → Repository (DB queries)
      → LLM Provider (if chat)
      → RAG Pipeline (if document context needed)
    ← Response (Pydantic schema)
  ← HTTP Response / SSE Stream
```

## Frontend Architecture

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
│   ├── ui/         # shadcn/ui primitives
│   ├── chat/       # Chat interface components
│   ├── workspace/  # Workspace management
│   ├── layout/     # Sidebar, header, shell
│   ├── settings/   # Settings panels
│   └── artifacts/  # Artifact panel
├── hooks/          # Custom React hooks
├── lib/            # API client, utilities
├── stores/         # State management (if needed)
└── types/          # TypeScript type definitions
```

## LLM Provider Abstraction

```
┌────────────────────────┐
│   LLMProvider interface │
│   - chat()              │
│   - stream()            │
│   - embed()             │
└───────────┬────────────┘
            │
   ┌────────┼────────┬──────────┬──────────┐
   ▼        ▼        ▼          ▼          ▼
OpenAI  Gemini  OpenRouter  Ollama   (future)
```

Adding a new provider = implementing the interface. Zero changes to calling code.

## RAG Pipeline

```
Upload File
  → File Parser (PDF/DOCX/TXT/etc.)
    → Text Chunker (recursive text splitter)
      → Embedding (OpenAI / provider)
        → ChromaDB (store vectors + metadata)

Query
  → Embed query
    → ChromaDB similarity search
      → Top-K chunks
        → Inject into LLM prompt as context
          → Stream response
```

## Security Architecture

- JWT auth on all protected routes
- Row Level Security (RLS) on PostgreSQL
- Document isolation per workspace
- CORS restriction
- Input validation via Pydantic
- Rate limiting on auth endpoints
- No secrets in code (env vars only)
