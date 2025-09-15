from typing import List, Dict
from collections import Counter
import re

from app.utils.youtube_client import get_youtube_api_key
from googleapiclient.discovery import build
from app.utils.reddit_client import get_reddit_client

STOPWORDS = set(
    "the a an and or for with from this that those these you your our us we of to in on at by is are was were it its it's as be have has had not no but if then than about into over under more most less few many new latest top breaking video watch review official ft vs vs. live full".split()
)

def _extract_keywords(titles: List[str], max_items: int = 15) -> List[str]:
    tokens: List[str] = []
    for t in titles:
        # keep alphanumerics and spaces
        clean = re.sub(r"[^A-Za-z0-9\s#]", "", t)
        for w in clean.split():
            lw = w.lower().strip()
            if not lw or lw in STOPWORDS or len(lw) < 3:
                continue
            # prefer hashtags or capitalized words
            tokens.append(lw)
    # count and return top tokens
    counts = Counter(tokens)
    return [w for w, _ in counts.most_common(max_items)]


def get_youtube_trending_titles(max_results: int = 15) -> List[str]:
    api_key = get_youtube_api_key()
    youtube = build('youtube', 'v3', developerKey=api_key)
    resp = youtube.videos().list(part='snippet', chart='mostPopular', regionCode='US', maxResults=min(max_results, 50)).execute()
    items = resp.get('items', [])
    return [it['snippet'].get('title', '') for it in items if 'snippet' in it]


def get_reddit_hot_titles(limit: int = 25) -> List[str]:
    reddit = get_reddit_client()
    titles: List[str] = []
    for submission in reddit.subreddit('popular').hot(limit=limit):
        titles.append(getattr(submission, 'title', ''))
    return titles


def get_trending_topics() -> Dict:
    yt_titles = []
    rd_titles = []
    try:
        yt_titles = get_youtube_trending_titles()
    except Exception:
        yt_titles = []
    try:
        rd_titles = get_reddit_hot_titles()
    except Exception:
        rd_titles = []

    yt_keywords = _extract_keywords(yt_titles, 12)
    rd_keywords = _extract_keywords(rd_titles, 12)

    # merge lists preserving some source attribution
    merged = []
    seen = set()
    for kw in yt_keywords + rd_keywords:
        if kw not in seen:
            merged.append(kw)
            seen.add(kw)

    return {
        "youtube": yt_keywords,
        "reddit": rd_keywords,
        "topics": merged[:20],
    }
