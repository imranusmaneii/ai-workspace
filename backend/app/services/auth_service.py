from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, AuthResponse, UserUpdate, RefreshRequest
import httpx


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: UserRegister) -> AuthResponse:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        user = User(
            email=data.email,
            name=data.name,
            password_hash=hash_password(data.password),
            auth_provider="email",
        )
        user = await self.user_repo.create(user)
        return self._make_auth_response(user)

    async def login(self, data: UserLogin) -> AuthResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not user.password_hash:
            raise ValidationException("Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            raise ValidationException("Invalid email or password")

        if not user.is_active:
            raise ValidationException("Account is inactive")

        return self._make_auth_response(user)

    async def google_auth(self, id_token: str) -> AuthResponse:
        google_user = await self._verify_google_token(id_token)
        if not google_user:
            raise ValidationException("Invalid Google token")

        user = await self.user_repo.get_by_google_id(google_user["sub"])
        if not user:
            user = await self.user_repo.get_by_email(google_user["email"])
            if user:
                user.google_id = google_user["sub"]
                user.auth_provider = "google"
                user = await self.user_repo.update(user)
            else:
                user = User(
                    email=google_user["email"],
                    name=google_user.get("name"),
                    avatar_url=google_user.get("picture"),
                    auth_provider="google",
                    google_id=google_user["sub"],
                )
                user = await self.user_repo.create(user)

        return self._make_auth_response(user)

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValidationException("Invalid refresh token")

        user = await self.user_repo.get_by_id(UUID(payload["sub"]))
        if not user or not user.is_active:
            raise ValidationException("Invalid refresh token")

        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)

    async def _verify_google_token(self, id_token: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": id_token},
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return None

    def _make_auth_response(self, user: User) -> AuthResponse:
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        return AuthResponse(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
        )


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_me(self, user_id: UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User")
        return user

    async def update_me(self, user_id: UUID, data: UserUpdate) -> User:
        user = await self.get_me(user_id)
        if data.name is not None:
            user.name = data.name
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        return await self.user_repo.update(user)
