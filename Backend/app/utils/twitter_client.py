import os
from dotenv import load_dotenv
import tweepy

load_dotenv()

TWITTER_API_KEY = os.environ.get("TWITTER_API_KEY")
TWITTER_API_KEY_SECRET = os.environ.get("TWITTER_API_KEY_SECRET")
TWITTER_BEARER_TOKEN = os.environ.get("TWITTER_BEARER_TOKEN")

if not TWITTER_BEARER_TOKEN:
    raise ValueError("TWITTER_BEARER_TOKEN must be set in the environment variables.")

def get_twitter_client() -> tweepy.Client:
    """
    Returns a Tweepy Client instance for Twitter API v2.
    """
    return tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN) 