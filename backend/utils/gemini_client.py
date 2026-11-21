import logging
import os
from django.conf import settings

logger = logging.getLogger(__name__)

# Cached clients
_groq_client = None


def get_groq_api_key() -> str:
    """Get Groq API key from settings or environment."""
    return getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY', ''))


def get_groq_model_name() -> str:
    """Get configured Groq model name."""
    return getattr(settings, 'GROQ_MODEL', os.environ.get('GROQ_MODEL', 'qwen/qwen3.8-27b'))


def get_groq_client():
    """
    Returns an initialized Groq client if key is available, else None.
    """
    global _groq_client
    api_key = get_groq_api_key()
    if not api_key:
        return None
    try:
        import groq
        if _groq_client is None:
            _groq_client = groq.Groq(api_key=api_key)
        return _groq_client
    except Exception as exc:
        logger.error(f"Failed to initialize Groq client: {exc}")
        return None


def get_chat_llm(temperature: float = 0.2, max_output_tokens: int = 2048):
    """
    Universal factory for LangChain chat models.
    Prioritizes Groq (fast, high-quota, excellent structured output).
    Falls back to Gemini if Groq is not configured.
    """
    groq_key = get_groq_api_key()
    if groq_key:
        try:
            from langchain_groq import ChatGroq
            model_name = get_groq_model_name()
            logger.info(f"Initializing ChatGroq with model '{model_name}'")
            return ChatGroq(
                model=model_name,
                groq_api_key=groq_key,
                temperature=temperature,
                max_tokens=max_output_tokens,
                max_retries=2,
            )
        except Exception as exc:
            logger.warning(f"Failed to initialize ChatGroq, trying Gemini fallback: {exc}")

    # Fallback to Gemini if configured
    gemini_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))
    if gemini_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model_name = _get_llm_model_name()
            logger.info(f"Initializing ChatGoogleGenerativeAI with model '{model_name}'")
            return ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=gemini_key,
                temperature=temperature,
                max_output_tokens=max_output_tokens,
                max_retries=1,
            )
        except Exception as exc:
            logger.error(f"Failed to initialize ChatGoogleGenerativeAI: {exc}")
            raise

    raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured.")


def get_gemini_client():
    """Legacy helper: Setup and return the google.generativeai client."""
    try:
        import google.generativeai as genai
        api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))
        if api_key:
            genai.configure(api_key=api_key)
        return genai
    except Exception as exc:
        logger.warning(f"Error configuring Google Generative AI client: {exc}")
        return None


def _get_llm_model_name() -> str:
    """Returns the Gemini model name for fallback."""
    return getattr(settings, 'GEMINI_MODEL', os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash'))
