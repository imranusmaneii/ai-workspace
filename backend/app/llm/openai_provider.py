from typing import AsyncIterator
from openai import AsyncOpenAI
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

settings = get_settings()


class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def chat(self, messages: list[ChatMessage], model: str = "gpt-4o", **kwargs) -> str:
        response = await self.client.chat.completions.create(
            model=model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            **kwargs,
        )
        return response.choices[0].message.content or ""

    async def stream(self, messages: list[ChatMessage], model: str = "gpt-4o", **kwargs) -> AsyncIterator[str]:
        response = await self.client.chat.completions.create(
            model=model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            stream=True,
            **kwargs,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="gpt-4o", name="GPT-4o", provider="openai", max_tokens=128000),
            ModelInfo(id="gpt-4o-mini", name="GPT-4o Mini", provider="openai", max_tokens=128000),
            ModelInfo(id="gpt-4-turbo", name="GPT-4 Turbo", provider="openai", max_tokens=128000),
            ModelInfo(id="gpt-3.5-turbo", name="GPT-3.5 Turbo", provider="openai", max_tokens=16000),
        ]

    def get_default_model(self) -> str:
        return "gpt-4o"
