from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryResponse
from app.services.memory_service import MemoryService

router = APIRouter(tags=["memory"])


@router.get("/workspaces/{workspace_id}/memories")
async def list_memories(
    workspace_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MemoryService(db)
    memories = await service.list_by_workspace(workspace_id)
    return [
        {"id": str(m.id), "content": m.content, "created_at": m.created_at.isoformat()}
        for m in memories
    ]


@router.post("/workspaces/{workspace_id}/memories", response_model=MemoryResponse, status_code=201)
async def create_memory(
    workspace_id: UUID,
    data: MemoryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MemoryService(db)
    return await service.create(workspace_id, data.content)


@router.delete("/workspaces/{workspace_id}/memories/{memory_id}", status_code=204)
async def delete_memory(
    workspace_id: UUID,
    memory_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MemoryService(db)
    await service.delete(memory_id)
