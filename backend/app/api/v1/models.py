from fastapi import APIRouter
from app.llm.registry import list_all_models

router = APIRouter(prefix="/models", tags=["models"])


@router.get("")
async def get_models():
    return list_all_models()
