from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat import Chat
from app.models.message import Message
from app.repositories.chat_repo import ChatRepository
from app.repositories.message_repo import MessageRepository
from app.core.exceptions import NotFoundException
from app.schemas.chat import ChatCreate, ChatUpdate, MessageCreate, MessageUpdate


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.chat_repo = ChatRepository(db)
        self.message_repo = MessageRepository(db)

    async def list_by_workspace(
        self, workspace_id: UUID, search: str | None = None, limit: int = 20, offset: int = 0
    ) -> list[Chat]:
        return await self.chat_repo.list_by_workspace(workspace_id, search, limit, offset)

    async def get_by_id(self, chat_id: UUID) -> Chat:
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise NotFoundException("Chat")
        return chat

    async def create(self, workspace_id: UUID, data: ChatCreate) -> Chat:
        chat = Chat(
            workspace_id=workspace_id,
            title=data.title,
            model_provider=data.model_provider,
            model_name=data.model_name,
        )
        return await self.chat_repo.create(chat)

    async def update(self, chat_id: UUID, data: ChatUpdate) -> Chat:
        chat = await self.get_by_id(chat_id)
        if data.title is not None:
            chat.title = data.title
        if data.model_provider is not None:
            chat.model_provider = data.model_provider
        if data.model_name is not None:
            chat.model_name = data.model_name
        return await self.chat_repo.update(chat)

    async def delete(self, chat_id: UUID) -> None:
        chat = await self.get_by_id(chat_id)
        await self.chat_repo.delete(chat)


class MessageService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.message_repo = MessageRepository(db)

    async def list_by_chat(self, chat_id: UUID, limit: int = 50, offset: int = 0) -> list[Message]:
        return await self.message_repo.list_by_chat(chat_id, limit, offset)

    async def get_last_n(self, chat_id: UUID, n: int = 20) -> list[Message]:
        return await self.message_repo.get_last_n(chat_id, n)

    async def get_by_id(self, message_id: UUID) -> Message:
        msg = await self.message_repo.get_by_id(message_id)
        if not msg:
            raise NotFoundException("Message")
        return msg

    async def create_user_message(self, chat_id: UUID, content: str) -> Message:
        message = Message(chat_id=chat_id, role="user", content=content)
        return await self.message_repo.create(message)

    async def create_assistant_message(
        self, chat_id: UUID, content: str, model_provider: str, model_name: str,
        token_count: int = 0, artifact_data: dict | None = None
    ) -> Message:
        message = Message(
            chat_id=chat_id,
            role="assistant",
            content=content,
            model_provider=model_provider,
            model_name=model_name,
            token_count=token_count,
            artifact_data=artifact_data,
        )
        return await self.message_repo.create(message)

    async def update_content(self, message_id: UUID, content: str) -> Message:
        msg = await self.get_by_id(message_id)
        msg.content = content
        return await self.message_repo.update(msg)

    async def delete(self, message_id: UUID) -> None:
        msg = await self.get_by_id(message_id)
        await self.message_repo.delete(msg)
