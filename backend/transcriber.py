import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Whisper transcription needs OpenAI's own API (not OpenRouter) since this
# is an audio endpoint, not a chat-completion route.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

_whisper_client = None

ALLOWED_EXTENSIONS = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
MAX_FILE_SIZE_MB = 25


class TranscriptionError(Exception):
    pass


def _get_whisper_client():
    global _whisper_client
    if _whisper_client is None:
        if not OPENAI_API_KEY:
            raise TranscriptionError(
                "No OPENAI_API_KEY found in backend/.env. Audio transcription "
                "requires a real OpenAI API key (separate from OpenRouter)."
            )
        _whisper_client = OpenAI(api_key=OPENAI_API_KEY)
    return _whisper_client


def transcribe_audio(file_path, original_filename):
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise TranscriptionError(f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise TranscriptionError(f"File is {size_mb:.1f}MB, exceeds the {MAX_FILE_SIZE_MB}MB limit.")

    client = _get_whisper_client()
    try:
        with open(file_path, "rb") as f:
            transcript = client.audio.transcriptions.create(model="whisper-1", file=f)
    except Exception as e:
        raise TranscriptionError(f"Transcription failed: {e}") from e

    text = transcript.text if hasattr(transcript, 'text') else str(transcript)
    if not text or not text.strip():
        raise TranscriptionError("Transcription returned empty text.")

    return text.strip()