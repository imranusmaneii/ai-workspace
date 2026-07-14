from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.workspace import Workspace
from app.repositories.workspace_repo import WorkspaceRepository
from app.core.exceptions import NotFoundException, ForbiddenException
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = WorkspaceRepository(db)

    async def list_by_user(self, user_id: UUID) -> list[dict]:
        return await self.repo.list_by_user_with_counts(user_id)

    async def get_by_id(self, workspace_id: UUID, user_id: UUID) -> Workspace:
        ws = await self.repo.get_by_id(workspace_id)
        if not ws:
            raise NotFoundException("Workspace")
        if ws.user_id != user_id:
            raise ForbiddenException("Not your workspace")
        return ws

    async def create(self, user_id: UUID, data: WorkspaceCreate) -> Workspace:
        workspace = Workspace(user_id=user_id, name=data.name, description=data.description)
        return await self.repo.create(workspace)

    async def update(self, workspace_id: UUID, user_id: UUID, data: WorkspaceUpdate) -> Workspace:
        ws = await self.get_by_id(workspace_id, user_id)
        if data.name is not None:
            ws.name = data.name
        if data.description is not None:
            ws.description = data.description
        return await self.repo.update(ws)

    async def delete(self, workspace_id: UUID, user_id: UUID) -> None:
        ws = await self.get_by_id(workspace_id, user_id)
        await self.repo.delete(ws)
