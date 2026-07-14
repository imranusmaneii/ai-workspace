from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    UserRegister, UserLogin, GoogleAuth, AuthResponse,
    TokenResponse, RefreshRequest, UserResponse, UserUpdate,
    VerifyEmailRequest, ResendCodeRequest, RegisterResponse,
)
from app.services.auth_service import AuthService, UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(data)


@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_email(data.email, data.code)


@router.post("/resend-code")
async def resend_code(data: ResendCodeRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.resend_code(data.email)


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data)


@router.post("/google", response_model=AuthResponse)
async def google_auth(data: GoogleAuth, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.google_auth(data.id_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(data.refresh_token)
