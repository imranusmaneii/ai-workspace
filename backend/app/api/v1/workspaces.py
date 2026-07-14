from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("")
async def list_workspaces(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkspaceService(db)
    items = await service.list_by_user(user.id)
    return [
        {
            "id": str(item["workspace"].id),
            "name": item["workspace"].name,
            "description": item["workspace"].description,
            "chat_count": item["chat_count"],
            "document_count": item["document_count"],
            "created_at": item["workspace"].created_at.isoformat(),
        }
        for item in items
    ]


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    data: WorkspaceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkspaceService(db)
    return await service.create(user.id, data)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkspaceService(db)
    return await service.get_by_id(workspace_id, user.id)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: UUID,
    data: WorkspaceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkspaceService(db)
    return await service.update(workspace_id, user.id, data)


@router.delete("/{workspace_id}", status_code=204)
async def delete_workspace(
    workspace_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkspaceService(db)
    await service.delete(workspace_id, user.id)
