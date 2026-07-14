from app.llm.base import LLMProvider
from app.llm.openai_provider import OpenAIProvider
from app.llm.gemini_provider import GeminiProvider
from app.llm.openrouter_provider import OpenRouterProvider
from app.llm.ollama_provider import OllamaProvider
from app.core.config import get_settings

settings = get_settings()

_providers: dict[str, LLMProvider] = {}


def get_provider(name: str) -> LLMProvider:
    if name not in _providers:
        _providers[name] = _create_provider(name)
    return _providers[name]


def _create_provider(name: str) -> LLMProvider:
    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "openrouter": OpenRouterProvider,
        "ollama": OllamaProvider,
    }
    cls = providers.get(name)
    if not cls:
        raise ValueError(f"Unknown provider: {name}")
    return cls()


def get_all_providers() -> dict[str, LLMProvider]:
    available = []
    for name in ["openai", "gemini", "openrouter", "ollama"]:
        try:
            get_provider(name)
            available.append(name)
        except Exception:
            pass
    return {name: get_provider(name) for name in available}


def list_all_models() -> list[dict]:
    result = []
    for name in ["openai", "gemini", "openrouter", "ollama"]:
        try:
            provider = get_provider(name)
            models = provider.list_models()
            result.append({
                "provider": name,
                "models": [{"id": m.id, "name": m.name, "max_tokens": m.max_tokens} for m in models],
            })
        except Exception:
            pass
    return result
