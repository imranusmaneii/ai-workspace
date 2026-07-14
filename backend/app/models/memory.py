import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base


class Memory(Base):
    __tablename__ = "memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    embedding_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="memories")
