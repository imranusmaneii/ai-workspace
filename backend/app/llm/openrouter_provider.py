from typing import AsyncIterator
import httpx
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

settings = get_settings()


class OpenRouterProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"

    async def chat(self, messages: list[ChatMessage], model: str = "anthropic/claude-3.5-sonnet", **kwargs) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                },
                timeout=120,
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def stream(self, messages: list[ChatMessage], model: str = "anthropic/claude-3.5-sonnet", **kwargs) -> AsyncIterator[str]:
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                    "stream": True,
                },
                timeout=120,
            ) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        import json
                        data = json.loads(line[6:])
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        if delta.get("content"):
                            yield delta["content"]

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="anthropic/claude-3.5-sonnet", name="Claude 3.5 Sonnet", provider="openrouter", max_tokens=200000),
            ModelInfo(id="anthropic/claude-3-opus", name="Claude 3 Opus", provider="openrouter", max_tokens=200000),
            ModelInfo(id="meta-llama/llama-3.1-405b-instruct", name="Llama 3.1 405B", provider="openrouter", max_tokens=128000),
        ]

    def get_default_model(self) -> str:
        return "anthropic/claude-3.5-sonnet"
