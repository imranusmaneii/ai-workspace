# AI Workspace

A production-quality AI Workspace platform — inspired by ChatGPT and Claude Projects — built as the foundation of a startup.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, React Query |
| Backend | FastAPI, Python 3.11, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL (Supabase) |
| Vector Store | ChromaDB |
| LLM Orchestration | LangChain |
| Auth | JWT + Google OAuth |
| Deployment | Vercel (FE), Railway/Render (BE), Docker |

## Features

- **Multi-LLM Support** — OpenAI, Gemini, OpenRouter, Ollama with provider abstraction
- **Workspaces** — Isolated environments with their own chats, documents, and memory
- **Persistent Chats** — Full chat history with search and rename
- **Streaming Responses** — Real-time SSE streaming from LLM providers
- **RAG Pipeline** — Upload documents (PDF, DOCX, TXT, CSV, XLSX, PPTX, images, code) and get context-aware responses
- **Artifact Panel** — Code blocks with syntax highlighting
- **Markdown Rendering** — Full GFM support with code highlighting
- **Dark Mode** — Default dark theme
- **Responsive** — Mobile, tablet, and desktop layouts
- **Authentication** — Email/password + Google OAuth
- **Memory** — Workspace-scoped persistent memory

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (or Supabase)
- ChromaDB

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd ai-workspace
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
cp .env.example .env
# Edit .env with your keys
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if needed
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Docker (Optional)

```bash
cd docker
docker-compose up --build
```

## Project Structure

```
ai-workspace/
├── frontend/              # Next.js 15 app
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # API client, utilities
│   │   └── types/         # TypeScript types
│   └── package.json
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config, security, deps
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   ├── llm/           # LLM provider abstraction
│   │   └── rag/           # RAG pipeline
│   ├── tests/
│   └── requirements.txt
├── docs/                  # Architecture docs
├── docker/                # Docker configs
└── .github/               # CI/CD workflows
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | Secret for JWT signing |
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key |
| `GEMINI_API_KEY` | For Gemini | Google Gemini API key |
| `OPENROUTER_API_KEY` | For OpenRouter | OpenRouter API key |
| `CHROMA_HOST` | Yes | ChromaDB host (default: localhost) |
| `CHROMA_PORT` | Yes | ChromaDB port (default: 8001) |
| `GOOGLE_CLIENT_ID` | For Google auth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google auth | Google OAuth client secret |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google auth | Google OAuth client ID |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Backend (Railway)

1. Push to GitHub
2. Create new project in Railway
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

### Backend (Render)

1. Push to GitHub
2. Create Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Running Tests

```bash
cd backend
pytest tests/ -v
```

### Linting

```bash
cd frontend
npm run lint
```

## Architecture Decisions

1. **ChromaDB over pgvector** — Simpler setup, better for startup phase
2. **Zustand-free** — React Query handles server state, minimal client state
3. **Repository pattern** — Clean separation of data access from business logic
4. **SSE for streaming** — Native to FastAPI, simple frontend EventSource
5. **Provider abstraction** — Adding new LLM providers requires only implementing the interface

## License

Proprietary — All rights reserved.
