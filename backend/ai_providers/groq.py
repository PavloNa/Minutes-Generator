import os
from openai import OpenAI
from .base import BaseProvider
from .openai import OpenAIProvider


class GroqProvider(OpenAIProvider):
    """Groq's free tier through its OpenAI-compatible API."""

    # Groq retires models often (llama-3.3-70b went in Aug 2026); override without a code change.
    MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    # gpt-oss reasons before answering and those tokens count toward the limit.
    MAX_TOKENS = 8000
    EXTRA_ARGS = {"reasoning_effort": "low"}

    def __init__(self, api_key: str):
        BaseProvider.__init__(self, api_key)
        self.client = OpenAI(api_key=self.api_key, base_url="https://api.groq.com/openai/v1")

    # OpenAI's messages name OpenAI billing; the generic ones fit Groq.
    format_error = staticmethod(BaseProvider.format_error)
