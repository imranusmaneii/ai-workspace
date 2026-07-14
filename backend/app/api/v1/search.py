from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.search_service import SearchService

router = APIRouter(tags=["search"])


@router.get("/workspaces/{workspace_id}/search")
async def search(
    workspace_id: UUID,
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SearchService(db)
    return await service.search(workspace_id, q)
