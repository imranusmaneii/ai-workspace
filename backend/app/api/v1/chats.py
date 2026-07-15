from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatUpdate, ChatResponse, MessageCreate, MessageUpdate, MessageResponse
from app.services.chat_service import ChatService, MessageService
from app.utils.chat import stream_chat_response, generate_chat_response
from app.llm.base import ChatMessage

router = APIRouter(tags=["chats"])


@router.get("/workspaces/{workspace_id}/chats")
async def list_chats(
    workspace_id: UUID,
    search: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    chats = await service.list_by_workspace(workspace_id, search, limit, offset)
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "model_provider": c.model_provider,
            "model_name": c.model_name,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in chats
    ]


@router.post("/workspaces/{workspace_id}/chats", response_model=ChatResponse, status_code=201)
async def create_chat(
    workspace_id: UUID,
    data: ChatCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    return await service.create(workspace_id, data)


@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    return await service.get_by_id(chat_id)


@router.patch("/chats/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: UUID,
    data: ChatUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    return await service.update(chat_id, data)


@router.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    await service.delete(chat_id)


@router.get("/chats/{chat_id}/messages")
async def list_messages(
    chat_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MessageService(db)
    messages = await service.list_by_chat(chat_id, limit, offset)
    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "artifact_data": m.artifact_data,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.post("/chats/{chat_id}/messages", status_code=201)
async def send_message(
    chat_id: UUID,
    data: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg_service = MessageService(db)
    user_msg = await msg_service.create_user_message(chat_id, data.content)
    chat = await ChatService(db).get_by_id(chat_id)

    history = await msg_service.get_last_n(chat_id, n=20)
    messages = [ChatMessage(role=m.role, content=m.content) for m in history]

    if data.stream:
        async def stream_and_save():
            full_response = ""
            async for chunk in stream_chat_response(
                messages=messages,
                model_provider=chat.model_provider,
                model_name=chat.model_name,
                workspace_id=str(chat.workspace_id),
                rag_query=data.content,
            ):
                yield chunk
                try:
                    import json as _json
                    parsed = chunk.removeprefix("data: ").strip()
                    if parsed:
                        event = _json.loads(parsed)
                        if event.get("type") == "content":
                            full_response += event.get("content", "")
                except Exception:
                    pass
            if full_response:
                from app.core.database import async_session
                async with async_session() as save_db:
                    await MessageService(save_db).create_assistant_message(
                        chat_id=chat_id,
                        content=full_response,
                        model_provider=chat.model_provider,
                        model_name=chat.model_name,
                    )
                    await save_db.commit()

        return StreamingResponse(stream_and_save(), media_type="text/event-stream")

    response = await generate_chat_response(
        messages=messages,
        model_provider=chat.model_provider,
        model_name=chat.model_name,
        workspace_id=str(chat.workspace_id),
        rag_query=data.content,
    )
    assistant_msg = await msg_service.create_assistant_message(
        chat_id=chat_id,
        content=response,
        model_provider=chat.model_provider,
        model_name=chat.model_name,
    )
    return {
        "id": str(assistant_msg.id),
        "role": "assistant",
        "content": assistant_msg.content,
        "created_at": assistant_msg.created_at.isoformat(),
    }


@router.patch("/chats/{chat_id}/messages/{message_id}", response_model=MessageResponse)
async def update_message(
    chat_id: UUID,
    message_id: UUID,
    data: MessageUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MessageService(db)
    return await service.update_content(message_id, data.content)


@router.delete("/chats/{chat_id}/messages/{message_id}", status_code=204)
async def delete_message(
    chat_id: UUID,
    message_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MessageService(db)
    await service.delete(message_id)
