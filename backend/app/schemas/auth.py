from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuth(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None
    avatar_url: str | None
    auth_provider: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
