from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ModelInfo:
    id: str
    name: str
    provider: str
    max_tokens: int = 128000


@dataclass
class ChatMessage:
    role: str  # user, assistant, system
    content: str


class LLMProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[ChatMessage], model: str, **kwargs) -> str:
        ...

    @abstractmethod
    async def stream(self, messages: list[ChatMessage], model: str, **kwargs):
        ...

    @abstractmethod
    def list_models(self) -> list[ModelInfo]:
        ...

    @abstractmethod
    def get_default_model(self) -> str:
        ...
