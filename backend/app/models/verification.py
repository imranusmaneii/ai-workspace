import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.user import Base


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False, default="email_verification")
    used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
