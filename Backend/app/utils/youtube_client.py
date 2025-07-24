import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

if not YOUTUBE_API_KEY:
    raise ValueError("YOUTUBE_API_KEY must be set in the environment variables.")

def get_youtube_api_key() -> str:
    """
    Returns the YouTube API key from environment variables.
    """
    return YOUTUBE_API_KEY 