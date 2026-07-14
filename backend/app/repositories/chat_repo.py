from uuid import UUID
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat import Chat


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, chat_id: UUID) -> Chat | None:
        result = await self.db.execute(select(Chat).where(Chat.id == chat_id))
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, workspace_id: UUID, search: str | None = None, limit: int = 20, offset: int = 0
    ) -> list[Chat]:
        query = select(Chat).where(Chat.workspace_id == workspace_id)
        if search:
            query = query.where(Chat.title.ilike(f"%{search}%"))
        query = query.order_by(Chat.updated_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, chat: Chat) -> Chat:
        self.db.add(chat)
        await self.db.commit()
        await self.db.refresh(chat)
        return chat

    async def update(self, chat: Chat) -> Chat:
        await self.db.commit()
        await self.db.refresh(chat)
        return chat

    async def delete(self, chat: Chat) -> None:
        await self.db.delete(chat)
        await self.db.commit()
