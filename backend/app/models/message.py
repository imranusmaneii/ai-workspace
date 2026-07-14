import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    artifact_data = Column(JSON, nullable=True)
    token_count = Column(Integer, nullable=True)
    model_provider = Column(String(50), nullable=True)
    model_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    chat = relationship("Chat", back_populates="messages")
