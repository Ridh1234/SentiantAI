from app.utils.Supabase_client import get_supabase_client
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

def save_post(platform: str, content: str, user_handle: Optional[str], timestamp: datetime, sentiment_score: Optional[float], emotion: Optional[str], metadata: Optional[dict] = None) -> dict:
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
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
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                raise Exception(f"Failed to save post after {max_retries} attempts: {str(e)}")
            import time
            time.sleep(retry_delay)


def save_bulk_posts(posts: List[dict]) -> dict:
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
            supabase = get_supabase_client()
            # Each post dict should match the post table structure
            response = supabase.table("post").insert(posts).execute()
            return response.data if hasattr(response, 'data') else response
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                raise Exception(f"Failed to save bulk posts after {max_retries} attempts: {str(e)}")
            import time
            time.sleep(retry_delay)