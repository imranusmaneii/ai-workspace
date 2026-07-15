import logging
from typing import AsyncIterator
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

logger = logging.getLogger("noir_ai.gemini")
settings = get_settings()


class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._genai = genai
            logger.info("Gemini provider initialized successfully")
        except ImportError:
            raise ValueError("google-generativeai package is not installed")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini provider: {e}")
            raise ValueError(f"Gemini initialization failed: {e}")

    async def chat(self, messages: list[ChatMessage], model: str = "gemini-1.5-flash", **kwargs) -> str:
        logger.info(f"Gemini chat request: model={model}, messages={len(messages)}")
        try:
            gen_model = self._genai.GenerativeModel(model)
            history = []
            for m in messages[:-1]:
                if m.role == "system":
                    history.append({"role": "user", "parts": [m.content]})
                    history.append({"role": "model", "parts": ["Understood. I'll follow these instructions."]})
                else:
                    role = "user" if m.role == "user" else "model"
                    history.append({"role": role, "parts": [m.content]})
            chat = gen_model.start_chat(history=history)
            response = await chat.send_message_async(messages[-1].content)
            result = response.text
            logger.info(f"Gemini chat response: {len(result)} chars")
            return result
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")
            raise

    async def stream(self, messages: list[ChatMessage], model: str = "gemini-1.5-flash", **kwargs) -> AsyncIterator[str]:
        logger.info(f"Gemini stream request: model={model}, messages={len(messages)}")
        try:
            gen_model = self._genai.GenerativeModel(model)
            history = []
            for m in messages[:-1]:
                if m.role == "system":
                    history.append({"role": "user", "parts": [m.content]})
                    history.append({"role": "model", "parts": ["Understood. I'll follow these instructions."]})
                else:
                    role = "user" if m.role == "user" else "model"
                    history.append({"role": role, "parts": [m.content]})
            chat = gen_model.start_chat(history=history)
            chunk_count = 0
            async for chunk in chat.send_message_stream_async(messages[-1].content):
                if chunk.text:
                    chunk_count += 1
                    yield chunk.text
            logger.info(f"Gemini stream completed: {chunk_count} chunks")
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            raise

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="gemini-1.5-flash", name="Gemini 1.5 Flash", provider="gemini", max_tokens=1000000),
            ModelInfo(id="gemini-1.5-pro", name="Gemini 1.5 Pro", provider="gemini", max_tokens=1000000),
            ModelInfo(id="gemini-2.0-flash", name="Gemini 2.0 Flash", provider="gemini", max_tokens=1000000),
        ]

    def get_default_model(self) -> str:
        return "gemini-1.5-flash"
