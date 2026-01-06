import tempfile
import os
import json
from openai import OpenAI, AuthenticationError, APIError
from .base import BaseProvider


class OpenAIProvider(BaseProvider):
    """OpenAI-specific implementation of the AI provider."""

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = OpenAI(api_key=self.api_key)

    def transcribe_audio(self, file_content: bytes, filename: str) -> str:
        """Transcribe audio file using OpenAI Whisper."""
        suffix = os.path.splitext(filename)[1]

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name

        try:
            with open(temp_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            return transcription.text
        finally:
            os.unlink(temp_path)

    def generate_minutes(self, transcript: str) -> dict:
        """Generate meeting minutes JSON from transcript using GPT."""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"Create meeting minutes from this transcript:\n\n{transcript}"}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"},
            store=False  # Disable logging in OpenAI
        )

        return json.loads(response.choices[0].message.content)

    @staticmethod
    def format_error(e: Exception) -> str:
        """Convert OpenAI API exceptions to user-friendly error messages."""
        error_str = str(e)

        # Handle OpenAI-specific authentication errors
        if isinstance(e, AuthenticationError) or "401" in error_str or "invalid_api_key" in error_str:
            return "Invalid API key. Please check your API key in Profile settings."

        # Handle rate limits
        if "429" in error_str or "rate_limit" in error_str:
            return "API rate limit exceeded. Please wait a moment and try again."

        # Handle quota errors
        if "quota" in error_str.lower() or "insufficient" in error_str.lower():
            return "API quota exceeded. Please check your OpenAI billing settings."

        # Handle connection errors
        if "connection" in error_str.lower() or "timeout" in error_str.lower():
            return "Connection error. Please check your internet and try again."

        # Generic OpenAI API errors
        if isinstance(e, APIError):
            return "OpenAI service error. Please try again later."

        # Fallback for unknown errors
        return "An unexpected error occurred. Please try again."