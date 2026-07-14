import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base


class Chat(Base):
    __tablename__ = "chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False, default="New Chat")
    model_provider = Column(String(50), nullable=False, default="openai")
    model_name = Column(String(100), nullable=False, default="gpt-4o")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")
