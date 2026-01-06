from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Abstract base class for AI providers."""
    
    SYSTEM_PROMPT = """You are an expert at creating professional meeting minutes.
Given a transcript, create well-structured meeting minutes and return them as a JSON object with the following structure:

{
    "title": "Meeting title/subject (inferred from content)",
    "date": "Date if mentioned, otherwise 'Not specified'",
    "attendees": ["List of attendees if mentioned, otherwise empty array"],
    "summary": "Brief 2-3 sentence summary of the meeting",
    "discussion_points": [
        {
            "topic": "Topic name",
            "details": "Key points discussed"
        }
    ],
    "decisions": ["List of decisions made during the meeting"],
    "action_items": [
        {
            "task": "Description of the action item",
            "owner": "Person responsible (if mentioned, otherwise 'Unassigned')",
            "due_date": "Due date if mentioned, otherwise null"
        }
    ],
    "next_steps": ["List of next steps or follow-up items"]
}

Return ONLY valid JSON, no markdown formatting or additional text."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    def transcribe_audio(self, file_content: bytes, filename: str) -> str:
        """Transcribe audio file to text."""
        pass

    @abstractmethod
    def generate_minutes(self, transcript: str) -> dict:
        """Generate meeting minutes JSON from transcript."""
        pass

    @staticmethod
    def format_error(e: Exception) -> str:
        """Convert API exceptions to user-friendly error messages."""
        error_str = str(e)
        
        # Handle authentication errors
        if "401" in error_str or "invalid_api_key" in error_str or "authentication" in error_str.lower():
            return "Invalid API key. Please check your API key in Profile settings."
        
        # Handle rate limits
        if "429" in error_str or "rate_limit" in error_str:
            return "API rate limit exceeded. Please wait a moment and try again."
        
        # Handle quota errors
        if "quota" in error_str.lower() or "insufficient" in error_str.lower():
            return "API quota exceeded. Please check your billing settings."
        
        # Handle connection errors
        if "connection" in error_str.lower() or "timeout" in error_str.lower():
            return "Connection error. Please check your internet and try again."
        
        # Fallback for unknown errors
        return "An unexpected error occurred. Please try again."
