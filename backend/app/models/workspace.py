import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="workspaces")
    chats = relationship("Chat", back_populates="workspace", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="workspace", cascade="all, delete-orphan")
