import logging
from typing import AsyncIterator
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

logger = logging.getLogger("noir_ai.openai")
settings = get_settings()


class OpenAIProvider(LLMProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set")
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            logger.info("OpenAI provider initialized successfully")
        except ImportError:
            raise ValueError("openai package is not installed")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI provider: {e}")
            raise

    async def chat(self, messages: list[ChatMessage], model: str = "gpt-4o", **kwargs) -> str:
        logger.info(f"OpenAI chat request: model={model}, messages={len(messages)}")
        response = await self.client.chat.completions.create(
            model=model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            **kwargs,
        )
        result = response.choices[0].message.content or ""
        logger.info(f"OpenAI chat response: {len(result)} chars")
        return result

    async def stream(self, messages: list[ChatMessage], model: str = "gpt-4o", **kwargs) -> AsyncIterator[str]:
        logger.info(f"OpenAI stream request: model={model}, messages={len(messages)}")
        response = await self.client.chat.completions.create(
            model=model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            stream=True,
            **kwargs,
        )
        chunk_count = 0
        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta.content:
                chunk_count += 1
                yield delta.content
        logger.info(f"OpenAI stream completed: {chunk_count} chunks")

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="gpt-4o", name="GPT-4o", provider="openai", max_tokens=128000),
            ModelInfo(id="gpt-4o-mini", name="GPT-4o Mini", provider="openai", max_tokens=128000),
            ModelInfo(id="gpt-4-turbo", name="GPT-4 Turbo", provider="openai", max_tokens=128000),
        ]

    def get_default_model(self) -> str:
        return "gpt-4o"
