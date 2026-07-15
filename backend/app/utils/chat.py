import json
import logging
import traceback
from typing import AsyncIterator
from app.llm.base import ChatMessage
from app.llm.registry import get_provider

logger = logging.getLogger("noir_ai.chat")

NOIR_SYSTEM_PROMPT = """You are Noir AI, a premium, intelligent AI assistant created to help users with a wide range of tasks including coding, writing, analysis, research, and creative projects. You are knowledgeable, articulate, and provide thoughtful, well-structured responses.

Key traits:
- Be concise but thorough
- Use markdown formatting for structured responses
- Use code blocks with language tags for code examples
- Be helpful, accurate, and professional
- If you're unsure about something, say so honestly
- Format lists, tables, and steps clearly when appropriate"""


async def stream_chat_response(
    messages: list[ChatMessage],
    model_provider: str,
    model_name: str,
    system_prompt: str | None = None,
    workspace_id: str | None = None,
    rag_query: str | None = None,
) -> AsyncIterator[str]:
    full_messages = []

    try:
        if workspace_id and rag_query:
            try:
                from app.rag.pipeline import retrieve_context
                rag_context = retrieve_context(workspace_id, rag_query)
                if rag_context:
                    full_messages.append(ChatMessage(
                        role="system",
                        content=f"Use the following context to answer the question:\n\n{rag_context}",
                    ))
                    logger.info(f"RAG context added: {len(rag_context)} chars")
            except Exception as e:
                logger.warning(f"RAG context retrieval failed: {e}")

        full_messages.append(ChatMessage(role="system", content=system_prompt or NOIR_SYSTEM_PROMPT))
        full_messages.extend(messages)

        logger.info(f"Stream request: provider={model_provider}, model={model_name}, messages={len(full_messages)}")

        provider = get_provider(model_provider)

        chunk_count = 0
        async for chunk in provider.stream(full_messages, model=model_name):
            chunk_count += 1
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"

        logger.info(f"Stream completed: {chunk_count} chunks sent")
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        logger.error(f"Stream error: {type(e).__name__}: {e}")
        traceback.print_exc()
        error_msg = str(e) or "An error occurred while generating the response."
        if "API_KEY" in error_msg.upper() or "auth" in error_msg.lower():
            error_msg = "API key is invalid or missing. Please check your provider configuration in Settings."
        elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
            error_msg = "API quota exceeded. Please try again later or switch to a different model."
        elif "not found" in error_msg.lower() or "404" in error_msg:
            error_msg = f"Model '{model_name}' not found. Please select a different model."
        yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
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

    try:
        if workspace_id and rag_query:
            try:
                from app.rag.pipeline import retrieve_context
                rag_context = retrieve_context(workspace_id, rag_query)
                if rag_context:
                    full_messages.append(ChatMessage(
                        role="system",
                        content=f"Use the following context to answer the question:\n\n{rag_context}",
                    ))
            except Exception:
                pass

        full_messages.append(ChatMessage(role="system", content=system_prompt or NOIR_SYSTEM_PROMPT))
        full_messages.extend(messages)

        provider = get_provider(model_provider)
        return await provider.chat(full_messages, model=model_name)

    except Exception as e:
        logger.error(f"Chat error: {type(e).__name__}: {e}")
        traceback.print_exc()
        error_msg = str(e) or "An error occurred while generating the response."
        return f"Error: {error_msg}"
