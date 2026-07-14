from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document
from app.repositories.document_repo import DocumentRepository
from app.core.exceptions import NotFoundException
from app.rag.file_parser import FileParser
from app.rag.pipeline import chunk_and_store, remove_document


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DocumentRepository(db)

    async def list_by_workspace(self, workspace_id: UUID, status: str | None = None) -> list[Document]:
        return await self.repo.list_by_workspace(workspace_id, status=status)

    async def get_by_id(self, doc_id: UUID) -> Document:
        doc = await self.repo.get_by_id(doc_id)
        if not doc:
            raise NotFoundException("Document")
        return doc

    async def create(self, workspace_id: UUID, user_id: UUID, file_path: str, filename: str, file_size: int) -> Document:
        file_type = FileParser.get_file_type(filename)

        document = Document(
            workspace_id=workspace_id,
            uploaded_by=user_id,
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            file_url=file_path,
            status="processing",
        )
        document = await self.repo.create(document)

        try:
            content = FileParser.extract_text(file_path, file_type)
            if content:
                chunk_count = chunk_and_store(
                    workspace_id=str(workspace_id),
                    document_id=str(document.id),
                    content=content,
                    metadata={"filename": filename, "file_type": file_type},
                )
                document.chunk_count = chunk_count
                document.status = "ready"
            else:
                document.status = "failed"
        except Exception:
            document.status = "failed"

        return await self.repo.update(document)

    async def delete(self, doc_id: UUID) -> None:
        doc = await self.get_by_id(doc_id)
        remove_document(str(doc.workspace_id), str(doc.id))
        await self.repo.delete(doc)
