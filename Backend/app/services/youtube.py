from app.utils.youtube_client import get_youtube_api_key
from typing import List, Dict, Union
from app.services.sentiment import analyze_sentiment
from googleapiclient.discovery import build
import logging
from datetime import datetime
from app.services.persistence import save_bulk_posts

def fetch_video_ids(query: str, max_results: int = 5) -> Union[List[str], dict]:
    api_key = get_youtube_api_key()
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        search_response = youtube.search().list(
            q=query,
            part='id',
            type='video',
            maxResults=max_results
        ).execute()
        logging.debug(f"YouTube search response: {search_response}")
        video_ids = [item['id']['videoId'] for item in search_response.get('items', []) if 'videoId' in item.get('id', {})]
        return video_ids
    except Exception as e:
        logging.error(f"Error fetching YouTube video IDs: {e}")
        return {"error": str(e)}


def fetch_comments_for_video(video_id: str, max_comments: int = 20) -> Union[List[dict], dict]:
    api_key = get_youtube_api_key()
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        comments = []
        request = youtube.commentThreads().list(
            part='snippet',
            videoId=video_id,
            maxResults=min(max_comments, 100),
            textFormat='plainText'
        )
        response = request.execute()
        for item in response.get('items', []):
            comment = item['snippet']['topLevelComment']['snippet']
            comments.append(comment)
            if len(comments) >= max_comments:
                break
        return comments[:max_comments]
    except Exception as e:
        logging.error(f"Error fetching YouTube comments: {e}")
        return {"error": str(e)}


def analyze_comments_sentiment(query: str, max_videos: int = 3, max_comments_per_video: int = 10) -> Union[List[Dict], dict]:
    video_ids = fetch_video_ids(query, max_videos)
    if isinstance(video_ids, dict) and "error" in video_ids:
        return video_ids
    results = []
    posts_to_save = []
    for video_id in video_ids:
        comments = fetch_comments_for_video(video_id, max_comments_per_video)
        if isinstance(comments, dict) and "error" in comments:
            results.append({"video_id": video_id, "error": comments["error"]})
            continue
        for comment in comments:
            text = comment.get('textDisplay', '')
            user_handle = comment.get('authorDisplayName', None)
            timestamp = comment.get('publishedAt', None)
            try:
                sentiment = analyze_sentiment(text)
                results.append({"video_id": video_id, "text": text, "sentiment": sentiment})
                posts_to_save.append({
                    "platform": "youtube",
                    "content": text,
                    "user_handle": user_handle,
                    "timestamp": timestamp if timestamp else datetime.utcnow().isoformat(),
                    "sentiment_score": sentiment.get("score"),
                    "emotion": sentiment.get("label"),
                    "metadata": {"video_id": video_id, "comment_id": comment.get('id', None)}
                })
            except Exception as e:
                logging.error(f"Error analyzing sentiment: {e}")
                results.append({"video_id": video_id, "text": text, "sentiment": {"error": str(e)}})
    if posts_to_save:
        save_bulk_posts(posts_to_save)
    return results 