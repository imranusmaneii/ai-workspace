from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.memory import Memory
from app.repositories.memory_repo import MemoryRepository
from app.core.exceptions import NotFoundException


class MemoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MemoryRepository(db)

    async def list_by_workspace(self, workspace_id: UUID) -> list[Memory]:
        return await self.repo.list_by_workspace(workspace_id)

    async def create(self, workspace_id: UUID, content: str) -> Memory:
        memory = Memory(workspace_id=workspace_id, content=content)
        return await self.repo.create(memory)

    async def delete(self, memory_id: UUID) -> None:
        memory = await self.repo.get_by_id(memory_id)
        if not memory:
            raise NotFoundException("Memory")
        await self.repo.delete(memory)
