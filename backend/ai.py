import logging
import tempfile
import os
from ai_providers import OpenAIProvider
from ai_providers.base import BaseProvider

# Try to import mutagen for audio duration detection
try:
    from mutagen import File as MutagenFile
    HAS_MUTAGEN = True
except ImportError:
    HAS_MUTAGEN = False


def get_audio_duration(file_content: bytes, filename: str) -> float:
    """Get audio duration in seconds using mutagen."""
    if not HAS_MUTAGEN:
        return 0.0
    
    try:
        suffix = os.path.splitext(filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        try:
            audio = MutagenFile(temp_path)
            if audio and audio.info:
                return audio.info.length
        finally:
            os.unlink(temp_path)
    except Exception as e:
        logging.warning(f"Could not get audio duration: {e}")
    
    return 0.0


class AI:
    """
    Generic AI wrapper that delegates to provider-specific implementations.
    Supports multiple AI providers (OpenAI, Anthropic, Google, etc.)
    """

    PROVIDERS = {
        "OpenAI": OpenAIProvider,
        # Future providers:
        # "Anthropic": AnthropicProvider,
        # "Google": GoogleProvider,
    }

    def __init__(self, api_key: str, provider: str = "OpenAI") -> None:
        self.api_key = api_key
        self.provider_name = provider
        self.provider = self._init_provider()

    def _init_provider(self) -> BaseProvider:
        """Initialize the appropriate AI provider."""
        provider_class = self.PROVIDERS.get(self.provider_name)
        if not provider_class:
            raise ValueError(f"Unsupported provider: {self.provider_name}")
        return provider_class(api_key=self.api_key)

    def handle_audio_file(self, file_content: bytes, filename: str) -> dict:
        """
        Handle audio file: transcribe, then generate minutes.

        Args:
            file_content: Raw bytes of the audio file
            filename: Original filename (for extension detection)

        Returns:
            dict with meeting minutes in JSON format
        """
        try:
            # Get audio duration before processing
            audio_duration = get_audio_duration(file_content, filename)
            
            # Step 1: Transcribe audio
            transcript = self.provider.transcribe_audio(file_content, filename)

            if not transcript.strip():
                return {"success": False, "error": "Transcription resulted in empty text"}

            # Step 2: Generate minutes from transcript
            minutes = self.provider.generate_minutes(transcript)

            return {
                "success": True,
                "minutes": minutes,
                "transcript": transcript,
                "transcript_length": len(transcript),
                "audio_duration": audio_duration
            }

        except Exception as e:
            logging.error(f"Audio processing error: {e}")
            return {"success": False, "error": self.provider.format_error(e)}

    def handle_txt_file(self, file_content: bytes) -> dict:
        """
        Handle text file: decode and generate minutes.

        Args:
            file_content: Raw bytes of the text file

        Returns:
            dict with meeting minutes in JSON format
        """
        try:
            transcript = file_content.decode('utf-8')

            if not transcript.strip():
                return {"success": False, "error": "File is empty"}

            minutes = self.provider.generate_minutes(transcript)

            return {
                "success": True,
                "minutes": minutes,
                "transcript": transcript,
                "transcript_length": len(transcript)
            }

        except Exception as e:
            logging.error(f"Text file processing error: {e}")
            return {"success": False, "error": self.provider.format_error(e)}

    def handle_text(self, transcript: str) -> dict:
        """
        Handle raw text input: generate minutes directly.
        
        Args:
            transcript: The transcript text

        Returns:
            dict with meeting minutes in JSON format
        """
        try:
            if not transcript.strip():
                return {"success": False, "error": "Transcript is empty"}

            minutes = self.provider.generate_minutes(transcript)

            return {
                "success": True,
                "minutes": minutes,
                "transcript": transcript,
                "transcript_length": len(transcript)
            }

        except Exception as e:
            logging.error(f"Text processing error: {e}")
            return {"success": False, "error": self.provider.format_error(e)}