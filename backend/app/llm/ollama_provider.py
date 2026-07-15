import json
import logging
from typing import AsyncIterator
import httpx
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

logger = logging.getLogger("noir_ai.ollama")
settings = get_settings()


class OllamaProvider(LLMProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        logger.info(f"Ollama provider initialized: {self.base_url}")

    async def chat(self, messages: list[ChatMessage], model: str = "llama3.1", **kwargs) -> str:
        logger.info(f"Ollama chat request: model={model}, messages={len(messages)}")
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
            result = data["message"]["content"]
            logger.info(f"Ollama chat response: {len(result)} chars")
            return result

    async def stream(self, messages: list[ChatMessage], model: str = "llama3.1", **kwargs) -> AsyncIterator[str]:
        logger.info(f"Ollama stream request: model={model}, messages={len(messages)}")
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
                chunk_count = 0
                async for line in resp.aiter_lines():
                    if line:
                        data = json.loads(line)
                        if data.get("message", {}).get("content"):
                            chunk_count += 1
                            yield data["message"]["content"]
                logger.info(f"Ollama stream completed: {chunk_count} chunks")

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="llama3.1", name="Llama 3.1", provider="ollama", max_tokens=128000),
            ModelInfo(id="llama3.1:70b", name="Llama 3.1 70B", provider="ollama", max_tokens=128000),
            ModelInfo(id="mistral", name="Mistral", provider="ollama", max_tokens=32000),
            ModelInfo(id="codellama", name="Code Llama", provider="ollama", max_tokens=16000),
        ]

    def get_default_model(self) -> str:
        return "llama3.1"
