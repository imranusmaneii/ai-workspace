# Route Map

## Frontend Routes (Next.js App Router)

| Path | Page | Auth | Description |
|------|------|------|-------------|
| `/login` | LoginPage | No | Email + Google login |
| `/register` | RegisterPage | No | Email registration |
| `/` | Dashboard | Yes | Workspace list, recent chats |
| `/workspace/:workspaceId` | WorkspacePage | Yes | Workspace detail, documents, memory |
| `/workspace/:workspaceId/chat/:chatId` | ChatPage | Yes | Chat interface with messages |
| `/settings` | SettingsPage | Yes | User profile and preferences |

### Route Groups

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx          # AppShell with sidebar
│   ├── page.tsx            # Dashboard
│   ├── workspace/[workspaceId]/
│   │   ├── page.tsx        # Workspace detail
│   │   └── chat/[chatId]/
│   │       └── page.tsx    # Chat interface
│   └── settings/
│       └── page.tsx        # Settings
├── layout.tsx              # Root layout (providers, fonts)
└── page.tsx                # Redirect to dashboard or login
```

---

## Backend Routes (FastAPI)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register with email |
| POST | `/api/v1/auth/login` | No | Login with email |
| POST | `/api/v1/auth/google` | No | Login/register with Google |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| GET | `/api/v1/users/me` | Yes | Get current user |
| PATCH | `/api/v1/users/me` | Yes | Update profile |
| GET | `/api/v1/workspaces` | Yes | List user workspaces |
| POST | `/api/v1/workspaces` | Yes | Create workspace |
| GET | `/api/v1/workspaces/:id` | Yes | Get workspace |
| PATCH | `/api/v1/workspaces/:id` | Yes | Update workspace |
| DELETE | `/api/v1/workspaces/:id` | Yes | Delete workspace + cascade |
| GET | `/api/v1/workspaces/:id/chats` | Yes | List chats (search, paginate) |
| POST | `/api/v1/workspaces/:id/chats` | Yes | Create chat |
| GET | `/api/v1/workspaces/:id/chats/:chatId` | Yes | Get chat with messages |
| PATCH | `/api/v1/workspaces/:id/chats/:chatId` | Yes | Update chat |
| DELETE | `/api/v1/workspaces/:id/chats/:chatId` | Yes | Delete chat |
| GET | `/api/v1/chats/:chatId/messages` | Yes | List messages |
| POST | `/api/v1/chats/:chatId/messages` | Yes | Send message (returns SSE stream) |
| PATCH | `/api/v1/chats/:chatId/messages/:msgId` | Yes | Edit message |
| DELETE | `/api/v1/chats/:chatId/messages/:msgId` | Yes | Delete message |
| GET | `/api/v1/chats/:chatId/stream` | Yes | SSE stream for latest response |
| GET | `/api/v1/workspaces/:id/documents` | Yes | List documents |
| POST | `/api/v1/workspaces/:id/documents` | Yes | Upload document |
| DELETE | `/api/v1/workspaces/:id/documents/:docId` | Yes | Delete document |
| GET | `/api/v1/workspaces/:id/memories` | Yes | List memories |
| POST | `/api/v1/workspaces/:id/memories` | Yes | Add memory |
| DELETE | `/api/v1/workspaces/:id/memories/:memId` | Yes | Delete memory |
| GET | `/api/v1/workspaces/:id/search` | Yes | Search chats + documents |

---

## API Router Structure

```
api/v1/
├── router.py              # Main API router (aggregates all sub-routers)
├── auth.py                # /auth/*
├── users.py               # /users/*
├── workspaces.py          # /workspaces/*
├── chats.py               # /chats/*
├── messages.py            # /chats/:id/messages/*
├── documents.py           # /workspaces/:id/documents/*
├── memory.py              # /workspaces/:id/memories/*
├── search.py              # /workspaces/:id/search
└── stream.py              # /chats/:id/stream (SSE)
```
