# API Contracts

Base URL: `/api/v1`

---

## Authentication

### POST /auth/register
```json
// Request
{ "email": "string", "password": "string", "name": "string" }
// Response 201
{ "user": { "id", "email", "name" }, "access_token": "string", "refresh_token": "string" }
```

### POST /auth/login
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "user": { "id", "email", "name", "avatar_url" }, "access_token": "string", "refresh_token": "string" }
```

### POST /auth/google
```json
// Request
{ "id_token": "string" }
// Response 200
{ "user": { "id", "email", "name", "avatar_url" }, "access_token": "string", "refresh_token": "string" }
```

### POST /auth/refresh
```json
// Request
{ "refresh_token": "string" }
// Response 200
{ "access_token": "string" }
```

---

## Users

### GET /users/me
```json
// Response 200
{ "id", "email", "name", "avatar_url", "auth_provider", "created_at" }
```

### PATCH /users/me
```json
// Request
{ "name"?: "string", "avatar_url"?: "string" }
// Response 200
{ "id", "email", "name", "avatar_url" }
```

---

## Workspaces

### GET /workspaces
```json
// Response 200
[{ "id", "name", "description", "created_at", "updated_at" }]
```

### POST /workspaces
```json
// Request
{ "name": "string", "description"?: "string" }
// Response 201
{ "id", "name", "description", "created_at", "updated_at" }
```

### GET /workspaces/{workspace_id}
```json
// Response 200
{ "id", "name", "description", "created_at", "updated_at" }
```

### PATCH /workspaces/{workspace_id}
```json
// Request
{ "name"?: "string", "description"?: "string" }
// Response 200
{ "id", "name", "description", "created_at", "updated_at" }
```

### DELETE /workspaces/{workspace_id}
```json
// Response 204
```

---

## Chats

### GET /workspaces/{workspace_id}/chats
```json
// Query: ?search=string&limit=20&offset=0
// Response 200
[{ "id", "title", "model_provider", "model_name", "created_at", "updated_at" }]
```

### POST /workspaces/{workspace_id}/chats
```json
// Request
{ "title"?: "string", "model_provider"?: "string", "model_name"?: "string" }
// Response 201
{ "id", "title", "model_provider", "model_name", "created_at" }
```

### GET /workspaces/{workspace_id}/chats/{chat_id}
```json
// Response 200
{ "id", "title", "model_provider", "model_name", "created_at", "messages": [...] }
```

### PATCH /workspaces/{workspace_id}/chats/{chat_id}
```json
// Request
{ "title"?: "string", "model_provider"?: "string", "model_name"?: "string" }
// Response 200
{ "id", "title", "model_provider", "model_name" }
```

### DELETE /workspaces/{workspace_id}/chats/{chat_id}
```json
// Response 204
```

---

## Messages

### GET /chats/{chat_id}/messages
```json
// Response 200
[{ "id", "role", "content", "artifact_data", "created_at" }]
```

### POST /chats/{chat_id}/messages
```json
// Request
{ "content": "string" }
// Response 201
{ "id", "role": "user", "content", "created_at" }
// Assistant response comes via SSE stream (see Streaming)
```

### PATCH /chats/{chat_id}/messages/{message_id}
```json
// Request
{ "content": "string" }
// Response 200
{ "id", "role", "content", "created_at" }
```

### DELETE /chats/{chat_id}/messages/{message_id}
```json
// Response 204
```

---

## Streaming (SSE)

### GET /chats/{chat_id}/stream?message_id={id}
```
// SSE events:
event: message_start
data: { "message_id": "string", "model": "string" }

event: content_delta
data: { "delta": "string" }

event: message_end
data: { "message_id": "string", "token_count": number }

event: error
data: { "message": "string" }
```

---

## Documents

### GET /workspaces/{workspace_id}/documents
```json
// Response 200
[{ "id", "filename", "file_type", "file_size", "status", "chunk_count", "created_at" }]
```

### POST /workspaces/{workspace_id}/documents
```
// Request: multipart/form-data
// Fields: file (binary)
// Response 201
{ "id", "filename", "file_type", "file_size", "status": "processing", "created_at" }
```

### DELETE /workspaces/{workspace_id}/documents/{document_id}
```json
// Response 204
```

---

## Memory

### GET /workspaces/{workspace_id}/memories
```json
// Response 200
[{ "id", "content", "created_at" }]
```

### POST /workspaces/{workspace_id}/memories
```json
// Request
{ "content": "string" }
// Response 201
{ "id", "content", "created_at" }
```

### DELETE /workspaces/{workspace_id}/memories/{memory_id}
```json
// Response 204
```

---

## Search

### GET /workspaces/{workspace_id}/search?q={query}
```json
// Response 200
{
  "chats": [{ "id", "title", "snippet": "string" }],
  "documents": [{ "id", "filename", "snippet": "string" }]
}
```
