from typing import AsyncIterator
import google.generativeai as genai
from app.llm.base import LLMProvider, ChatMessage, ModelInfo
from app.core.config import get_settings

settings = get_settings()


class GeminiProvider(LLMProvider):
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)

    async def chat(self, messages: list[ChatMessage], model: str = "gemini-pro", **kwargs) -> str:
        gen_model = genai.GenerativeModel(model)
        history = []
        for m in messages[:-1]:
            role = "user" if m.role == "user" else "model"
            history.append({"role": role, "parts": [m.content]})
        chat = gen_model.start_chat(history=history)
        response = await chat.send_message_async(messages[-1].content)
        return response.text

    async def stream(self, messages: list[ChatMessage], model: str = "gemini-pro", **kwargs) -> AsyncIterator[str]:
        gen_model = genai.GenerativeModel(model)
        history = []
        for m in messages[:-1]:
            role = "user" if m.role == "user" else "model"
            history.append({"role": role, "parts": [m.content]})
        chat = gen_model.start_chat(history=history)
        async for chunk in await chat.send_message_stream_async(messages[-1].content):
            if chunk.text:
                yield chunk.text

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="gemini-pro", name="Gemini Pro", provider="gemini", max_tokens=32000),
            ModelInfo(id="gemini-1.5-pro", name="Gemini 1.5 Pro", provider="gemini", max_tokens=1000000),
            ModelInfo(id="gemini-1.5-flash", name="Gemini 1.5 Flash", provider="gemini", max_tokens=1000000),
        ]

    def get_default_model(self) -> str:
        return "gemini-pro"
