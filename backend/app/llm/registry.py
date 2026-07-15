import logging
from app.llm.base import LLMProvider
from app.core.config import get_settings

logger = logging.getLogger("noir_ai.registry")
settings = get_settings()

_providers: dict[str, LLMProvider] = {}


def get_provider(name: str) -> LLMProvider:
    if name not in _providers:
        logger.info(f"Creating provider: {name}")
        _providers[name] = _create_provider(name)
    return _providers[name]


def _create_provider(name: str) -> LLMProvider:
    if name == "openai":
        from app.llm.openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif name == "gemini":
        from app.llm.gemini_provider import GeminiProvider
        return GeminiProvider()
    elif name == "openrouter":
        from app.llm.openrouter_provider import OpenRouterProvider
        return OpenRouterProvider()
    elif name == "ollama":
        from app.llm.ollama_provider import OllamaProvider
        return OllamaProvider()
    else:
        raise ValueError(f"Unknown provider: {name}")


def get_all_providers() -> dict[str, LLMProvider]:
    available = []
    for name in ["gemini", "openai", "openrouter", "ollama"]:
        try:
            get_provider(name)
            available.append(name)
        except Exception as e:
            logger.warning(f"Provider {name} unavailable: {e}")
    return {name: get_provider(name) for name in available}


def list_all_models() -> list[dict]:
    result = []
    for name in ["gemini", "openai", "openrouter", "ollama"]:
        try:
            provider = get_provider(name)
            models = provider.list_models()
            result.append({
                "provider": name,
                "models": [{"id": m.id, "name": m.name, "max_tokens": m.max_tokens} for m in models],
            })
        except Exception as e:
            logger.warning(f"Could not list models for {name}: {e}")
    return result
