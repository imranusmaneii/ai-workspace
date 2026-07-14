from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ChatCreate(BaseModel):
    title: str = "New Chat"
    model_provider: str = "gemini"
    model_name: str = "gemini-1.5-flash"


class ChatUpdate(BaseModel):
    title: str | None = None
    model_provider: str | None = None
    model_name: str | None = None


class ChatResponse(BaseModel):
    id: UUID
    title: str
    model_provider: str
    model_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatDetailResponse(ChatResponse):
    messages: list["MessageResponse"] = []


class MessageCreate(BaseModel):
    content: str
    stream: bool = True


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    artifact_data: dict | None = None
    token_count: int | None = None
    model_provider: str | None = None
    model_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageUpdate(BaseModel):
    content: str
