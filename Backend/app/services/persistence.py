from app.utils.Supabase_client import get_supabase_client
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

def save_post(platform: str, content: str, user_handle: Optional[str], timestamp: datetime, sentiment_score: Optional[float], emotion: Optional[str], metadata: Optional[dict] = None) -> dict:
    supabase = get_supabase_client()
    post_data = {
        "id": str(uuid4()),
        "platform": platform,
        "content": content,
        "user_handle": user_handle,
        "timestamp": timestamp.isoformat(),
        "sentiment_score": sentiment_score,
        "emotion": emotion,
        "metadata": metadata
    }
    response = supabase.table("post").insert(post_data).execute()
    return response.data if hasattr(response, 'data') else response


def save_bulk_posts(posts: List[dict]) -> dict:
    supabase = get_supabase_client()
    # Each post dict should match the post table structure
    response = supabase.table("post").insert(posts).execute()
    return response.data if hasattr(response, 'data') else response 