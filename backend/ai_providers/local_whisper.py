import io
import logging
import os
import threading

from faster_whisper import WhisperModel

# "small" is ~500 MB, downloaded once to the Hugging Face cache on first use.
MODEL_SIZE = os.getenv("WHISPER_MODEL", "small")

_model = None
_lock = threading.Lock()


def _load(device: str) -> WhisperModel:
    # float16 on GPU; int8 keeps CPU transcription usable.
    return WhisperModel(MODEL_SIZE, device=device, compute_type="float16" if device == "cuda" else "int8")


def _get_model() -> WhisperModel:
    global _model
    with _lock:
        if _model is None:
            try:
                _model = _load("cuda")
            except Exception:
                _model = _load("cpu")
        return _model


def _run(model: WhisperModel, file_content: bytes) -> str:
    # segments is lazy: decoding (and any CUDA library error) happens while iterating.
    segments, _info = model.transcribe(io.BytesIO(file_content), vad_filter=True)
    return " ".join(segment.text.strip() for segment in segments)


def transcribe(file_content: bytes) -> str:
    """Transcribe audio bytes (mp3, wav, m4a, ogg, webm) on this machine."""
    global _model
    model = _get_model()
    try:
        return _run(model, file_content)
    except RuntimeError as e:
        # CUDA can load but fail on first use when cuDNN/cuBLAS are missing; fall back to CPU for good.
        if model.model.device != "cuda":
            raise
        logging.warning(f"GPU transcription failed, switching to CPU: {e}")
        with _lock:
            _model = _load("cpu")
        return _run(_model, file_content)
