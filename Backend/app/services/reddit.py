from app.utils.reddit_client import get_reddit_client
from typing import List, Dict, Union
from app.services.sentiment import analyze_sentiment
import logging
from datetime import datetime
from app.services.persistence import save_bulk_posts

def fetch_recent_comments(subreddit: str, query: str, limit: int = 10) -> Union[List[str], dict]:
    reddit = get_reddit_client()
    try:
        comments = []
        for submission in reddit.subreddit(subreddit).search(query, sort="new", limit=limit):
            submission.comments.replace_more(limit=0)
            for comment in submission.comments.list():
                if comment.body:
                    comments.append(comment)
                if len(comments) >= limit:
                    break
            if len(comments) >= limit:
                break
        return comments[:limit]
    except Exception as e:
        logging.error(f"Error fetching Reddit comments: {e}")
        return {"error": str(e)}


def analyze_comments_sentiment(subreddit: str, query: str, limit: int = 10) -> Union[List[Dict], dict]:
    comments = fetch_recent_comments(subreddit, query, limit)
    if isinstance(comments, dict) and "error" in comments:
        return comments
    results = []
    posts_to_save = []
    for comment in comments:
        text = comment.body if hasattr(comment, 'body') else str(comment)
        user_handle = getattr(comment, 'author', None)
        timestamp = getattr(comment, 'created_utc', None)
        try:
            sentiment = analyze_sentiment(text)
            results.append({"text": text, "sentiment": sentiment})
            posts_to_save.append({
                "platform": "reddit",
                "content": text,
                "user_handle": str(user_handle) if user_handle else None,
                "timestamp": datetime.utcfromtimestamp(timestamp).isoformat() if timestamp else datetime.utcnow().isoformat(),
                "sentiment_score": sentiment.get("score"),
                "emotion": sentiment.get("label"),
                "metadata": {"comment_id": getattr(comment, 'id', None), "subreddit": subreddit}
            })
        except Exception as e:
            logging.error(f"Error analyzing sentiment: {e}")
            results.append({"text": text, "sentiment": {"error": str(e)}})
    if posts_to_save:
        save_bulk_posts(posts_to_save)
    return results 