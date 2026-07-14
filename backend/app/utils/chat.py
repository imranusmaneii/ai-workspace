import json
from typing import AsyncIterator
from fastapi.responses import StreamingResponse
from app.llm.base import ChatMessage
from app.llm.registry import get_provider
from app.rag.pipeline import retrieve_context


async def stream_chat_response(
    messages: list[ChatMessage],
    model_provider: str,
    model_name: str,
    system_prompt: str | None = None,
    workspace_id: str | None = None,
    rag_query: str | None = None,
) -> AsyncIterator[str]:
    full_messages = []

    rag_context = ""
    if workspace_id and rag_query:
        rag_context = retrieve_context(workspace_id, rag_query)
        if rag_context:
            full_messages.append(ChatMessage(
                role="system",
                content=f"Use the following context to answer the question:\n\n{rag_context}",
            ))

    if system_prompt:
        full_messages.append(ChatMessage(role="system", content=system_prompt))

    full_messages.extend(messages)

    provider = get_provider(model_provider)

    async for chunk in provider.stream(full_messages, model=model_name):
        yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


async def generate_chat_response(
    messages: list[ChatMessage],
    model_provider: str,
    model_name: str,
    system_prompt: str | None = None,
    workspace_id: str | None = None,
    rag_query: str | None = None,
) -> str:
    full_messages = []

    rag_context = ""
    if workspace_id and rag_query:
        rag_context = retrieve_context(workspace_id, rag_query)
        if rag_context:
            full_messages.append(ChatMessage(
                role="system",
                content=f"Use the following context to answer the question:\n\n{rag_context}",
            ))

    if system_prompt:
        full_messages.append(ChatMessage(role="system", content=system_prompt))

    full_messages.extend(messages)

    provider = get_provider(model_provider)
    return await provider.chat(full_messages, model=model_name)
