import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_url = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="processing")
    chunk_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="documents")
    uploader = relationship("User")
