from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class MemoryCreate(BaseModel):
    content: str


class MemoryResponse(BaseModel):
    id: UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
