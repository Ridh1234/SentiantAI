from app.utils.twitter_client import get_twitter_client
from typing import List, Dict, Union
from app.services.sentiment import analyze_sentiment
import logging
from datetime import datetime
from app.services.persistence import save_bulk_posts


def fetch_recent_tweets(query: str, max_results: int = 10) -> Union[List[str], dict]:
    client = get_twitter_client()

    # Clamp max_results to between 10 and 100 per Twitter API requirement
    max_results = max(10, min(max_results, 100))

    try:
        response = client.search_recent_tweets(
            query=query,
            max_results=max_results,
            tweet_fields=["text","created_at","author_id"],
            lang="en"
        )
        tweets = response.data if response.data else []
        return tweets

    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "Too Many Requests" in error_message:
            logging.warning("Rate limited by Twitter API. Try again after some time.")
            return {"error": "Twitter rate limit hit. Please wait and try again later."}

        logging.error(f"Error fetching tweets: {error_message}")
        return {"error": error_message}


def analyze_tweets_sentiment(query: str, max_results: int = 10) -> Union[List[Dict], dict]:
    tweets = fetch_recent_tweets(query, max_results)
    
    if isinstance(tweets, dict) and "error" in tweets:
        return tweets  # return error directly

    results = []
    posts_to_save = []
    
    for tweet in tweets:
        text = tweet.text if hasattr(tweet, 'text') else str(tweet)
        user_handle = getattr(tweet, 'author_id', None)
        timestamp = getattr(tweet, 'created_at', datetime.utcnow())
        try:
            sentiment = analyze_sentiment(text)
            results.append({
                "text": text,
                "sentiment": sentiment
            })
            posts_to_save.append({
                "platform": "twitter",
                "content": text,
                "user_handle": str(user_handle) if user_handle else None,
                "timestamp": timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
                "sentiment_score": sentiment.get("score"),
                "emotion": sentiment.get("label"),
                "metadata": {"tweet_id": getattr(tweet, 'id', None)}
            })
        except Exception as e:
            logging.error(f"Error analyzing sentiment: {e}")
            results.append({
                "text": text,
                "sentiment": {"error": str(e)}
            })
    if posts_to_save:
        save_bulk_posts(posts_to_save)
    return results
