from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.memory import Memory


class MemoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, memory_id: UUID) -> Memory | None:
        result = await self.db.execute(select(Memory).where(Memory.id == memory_id))
        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: UUID) -> list[Memory]:
        result = await self.db.execute(
            select(Memory)
            .where(Memory.workspace_id == workspace_id)
            .order_by(Memory.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, memory: Memory) -> Memory:
        self.db.add(memory)
        await self.db.commit()
        await self.db.refresh(memory)
        return memory

    async def delete(self, memory: Memory) -> None:
        await self.db.delete(memory)
        await self.db.commit()
