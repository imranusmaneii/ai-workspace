from typing import AsyncIterator
import httpx
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

settings = get_settings()


class OllamaProvider(LLMProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL

    async def chat(self, messages: list[ChatMessage], model: str = "llama3.1", **kwargs) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                    "stream": False,
                },
                timeout=300,
            )
            data = resp.json()
            return data["message"]["content"]

    async def stream(self, messages: list[ChatMessage], model: str = "llama3.1", **kwargs) -> AsyncIterator[str]:
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                },
                timeout=300,
            ) as resp:
                import json
                async for line in resp.aiter_lines():
                    if line:
                        data = json.loads(line)
                        if data.get("message", {}).get("content"):
                            yield data["message"]["content"]

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="llama3.1", name="Llama 3.1", provider="ollama", max_tokens=128000),
            ModelInfo(id="llama3.1:70b", name="Llama 3.1 70B", provider="ollama", max_tokens=128000),
            ModelInfo(id="mistral", name="Mistral", provider="ollama", max_tokens=32000),
            ModelInfo(id="codellama", name="Code Llama", provider="ollama", max_tokens=16000),
        ]

    def get_default_model(self) -> str:
        return "llama3.1"
