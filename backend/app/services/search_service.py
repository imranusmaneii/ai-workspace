from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.chat import Chat
from app.models.document import Document
from app.schemas.search import SearchResponse, SearchResultChat, SearchResultDocument


class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search(self, workspace_id: UUID, query: str) -> SearchResponse:
        chat_results = await self._search_chats(workspace_id, query)
        doc_results = await self._search_documents(workspace_id, query)
        return SearchResponse(chats=chat_results, documents=doc_results)

    async def _search_chats(self, workspace_id: UUID, query: str) -> list[SearchResultChat]:
        result = await self.db.execute(
            select(Chat)
            .where(Chat.workspace_id == workspace_id)
            .where(Chat.title.ilike(f"%{query}%"))
            .order_by(Chat.updated_at.desc())
            .limit(10)
        )
        chats = result.scalars().all()
        return [SearchResultChat(id=c.id, title=c.title, snippet=c.title) for c in chats]

    async def _search_documents(self, workspace_id: UUID, query: str) -> list[SearchResultDocument]:
        result = await self.db.execute(
            select(Document)
            .where(Document.workspace_id == workspace_id)
            .where(Document.filename.ilike(f"%{query}%"))
            .order_by(Document.created_at.desc())
            .limit(10)
        )
        docs = result.scalars().all()
        return [SearchResultDocument(id=d.id, filename=d.filename, snippet=d.filename) for d in docs]
