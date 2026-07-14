from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, doc_id: UUID) -> Document | None:
        result = await self.db.execute(select(Document).where(Document.id == doc_id))
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, workspace_id: UUID, status: str | None = None, limit: int = 20, offset: int = 0
    ) -> list[Document]:
        query = select(Document).where(Document.workspace_id == workspace_id)
        if status:
            query = query.where(Document.status == status)
        query = query.order_by(Document.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, document: Document) -> Document:
        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)
        return document

    async def update(self, document: Document) -> Document:
        await self.db.commit()
        await self.db.refresh(document)
        return document

    async def delete(self, document: Document) -> None:
        await self.db.delete(document)
        await self.db.commit()
