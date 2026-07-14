from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, message_id: UUID) -> Message | None:
        result = await self.db.execute(select(Message).where(Message.id == message_id))
        return result.scalar_one_or_none()

    async def list_by_chat(self, chat_id: UUID, limit: int = 50, offset: int = 0) -> list[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.chat_id == chat_id)
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_last_n(self, chat_id: UUID, n: int = 10) -> list[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.chat_id == chat_id)
            .order_by(Message.created_at.desc())
            .limit(n)
        )
        messages = list(result.scalars().all())
        messages.reverse()
        return messages

    async def create(self, message: Message) -> Message:
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def update(self, message: Message) -> Message:
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def delete(self, message: Message) -> None:
        await self.db.delete(message)
        await self.db.commit()
