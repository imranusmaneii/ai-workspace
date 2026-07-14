import os
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import get_settings
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.document_service import DocumentService

settings = get_settings()
router = APIRouter(tags=["documents"])


@router.get("/workspaces/{workspace_id}/documents")
async def list_documents(
    workspace_id: UUID,
    status: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DocumentService(db)
    docs = await service.list_by_workspace(workspace_id, status=status)
    return [
        {
            "id": str(d.id),
            "filename": d.filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "status": d.status,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.post("/workspaces/{workspace_id}/documents", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    workspace_id: UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    upload_dir = os.path.join(settings.UPLOAD_DIR if hasattr(settings, "UPLOAD_DIR") else "./uploads", str(workspace_id))
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else ""
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, file_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    service = DocumentService(db)
    return await service.create(
        workspace_id=workspace_id,
        user_id=user.id,
        file_path=file_path,
        filename=file.filename,
        file_size=len(content),
    )


@router.delete("/workspaces/{workspace_id}/documents/{document_id}", status_code=204)
async def delete_document(
    workspace_id: UUID,
    document_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DocumentService(db)
    await service.delete(document_id)
