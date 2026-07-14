from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.chats import router as chats_router
from app.api.v1.documents import router as documents_router
from app.api.v1.memory import router as memory_router
from app.api.v1.search import router as search_router
from app.api.v1.models import router as models_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspaces_router)
api_router.include_router(chats_router)
api_router.include_router(documents_router)
api_router.include_router(memory_router)
api_router.include_router(search_router)
api_router.include_router(models_router)
