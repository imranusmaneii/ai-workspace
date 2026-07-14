from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class WorkspaceCreate(BaseModel):
    name: str
    description: str | None = None


class WorkspaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class WorkspaceResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceListResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    chat_count: int = 0
    document_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
