from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    file_size: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
