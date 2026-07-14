from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.workspace import Workspace
from app.models.chat import Chat
from app.models.document import Document


class WorkspaceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, workspace_id: UUID) -> Workspace | None:
        result = await self.db.execute(select(Workspace).where(Workspace.id == workspace_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: UUID) -> list[Workspace]:
        result = await self.db.execute(
            select(Workspace).where(Workspace.user_id == user_id).order_by(Workspace.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_with_counts(self, workspace_id: UUID) -> dict | None:
        ws = await self.get_by_id(workspace_id)
        if not ws:
            return None

        chat_count = await self.db.execute(
            select(func.count(Chat.id)).where(Chat.workspace_id == workspace_id)
        )
        doc_count = await self.db.execute(
            select(func.count(Document.id)).where(Document.workspace_id == workspace_id)
        )

        return {
            "workspace": ws,
            "chat_count": chat_count.scalar() or 0,
            "document_count": doc_count.scalar() or 0,
        }

    async def list_by_user_with_counts(self, user_id: UUID) -> list[dict]:
        workspaces = await self.list_by_user(user_id)
        results = []
        for ws in workspaces:
            chat_count = await self.db.execute(
                select(func.count(Chat.id)).where(Chat.workspace_id == ws.id)
            )
            doc_count = await self.db.execute(
                select(func.count(Document.id)).where(Document.workspace_id == ws.id)
            )
            results.append({
                "workspace": ws,
                "chat_count": chat_count.scalar() or 0,
                "document_count": doc_count.scalar() or 0,
            })
        return results

    async def create(self, workspace: Workspace) -> Workspace:
        self.db.add(workspace)
        await self.db.commit()
        await self.db.refresh(workspace)
        return workspace

    async def update(self, workspace: Workspace) -> Workspace:
        await self.db.commit()
        await self.db.refresh(workspace)
        return workspace

    async def delete(self, workspace: Workspace) -> None:
        await self.db.delete(workspace)
        await self.db.commit()
