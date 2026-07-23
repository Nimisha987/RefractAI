import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# OpenRouter now has a dedicated /api/v1/audio/transcriptions endpoint that
# routes to Whisper — same key, same billing pool as the rest of the app.
# No separate OpenAI key needed.
api_key = os.getenv("OPENROUTER_API_KEY")

_client = None

ALLOWED_EXTENSIONS = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
MAX_FILE_SIZE_MB = 25

TRANSCRIPTION_MODEL = "openai/whisper-large-v3"


class TranscriptionError(Exception):
    pass


def _get_client():
    global _client
    if _client is None:
        if not api_key:
            raise TranscriptionError(
                "No OPENROUTER_API_KEY found in backend/.env"
            )
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
    return _client


def transcribe_audio(file_path, original_filename):
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise TranscriptionError(f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise TranscriptionError(f"File is {size_mb:.1f}MB, exceeds the {MAX_FILE_SIZE_MB}MB limit.")

    client = _get_client()
    try:
        with open(file_path, "rb") as f:
            transcript = client.audio.transcriptions.create(
                model=TRANSCRIPTION_MODEL,
                file=f,
            )
    except Exception as e:
        raise TranscriptionError(f"Transcription failed: {e}") from e

    text = transcript.text if hasattr(transcript, 'text') else str(transcript)
    if not text or not text.strip():
        raise TranscriptionError("Transcription returned empty text.")

    return text.strip()