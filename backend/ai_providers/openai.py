import json
from openai import OpenAI, AuthenticationError, APIError
from .base import BaseProvider


class OpenAIProvider(BaseProvider):
    """OpenAI-specific implementation of the AI provider."""

    MODEL = "gpt-4o-mini"
    MAX_TOKENS = 2000
    EXTRA_ARGS = {"store": False}  # Disable logging in OpenAI

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = OpenAI(api_key=self.api_key)

    def generate_minutes(self, transcript: str) -> dict:
        """Generate meeting minutes JSON from transcript."""
        response = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"Create meeting minutes from this transcript:\n\n{transcript}"}
            ],
            max_tokens=self.MAX_TOKENS,
            response_format={"type": "json_object"},
            **self.EXTRA_ARGS
        )

        return json.loads(response.choices[0].message.content)

    @staticmethod
    def format_error(e: Exception) -> str:
        """Convert OpenAI API exceptions to user-friendly error messages."""
        error_str = str(e)

        # Handle OpenAI-specific authentication errors
        if isinstance(e, AuthenticationError) or "401" in error_str or "invalid_api_key" in error_str:
            return "Invalid API key. Please check your API key in Settings."

        # Quota before rate limit: OpenAI sends both as 429
        if "quota" in error_str.lower() or "insufficient" in error_str.lower() or "credit" in error_str.lower():
            return "Your OpenAI account is out of credits. Add credits at platform.openai.com/settings/organization/billing, then try again."

        # Handle rate limits
        if "429" in error_str or "rate_limit" in error_str:
            return "API rate limit exceeded. Please wait a moment and try again."

        # Handle connection errors
        if "connection" in error_str.lower() or "timeout" in error_str.lower():
            return "Connection error. Please check your internet and try again."

        # Generic OpenAI API errors
        if isinstance(e, APIError):
            return "OpenAI service error. Please try again later."

        # Fallback for unknown errors
        return "An unexpected error occurred. Please try again."