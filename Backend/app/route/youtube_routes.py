from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.youtube import analyze_comments_sentiment

router = APIRouter()

class YouTubeSentimentRequest(BaseModel):
    query: str
    max_videos: Optional[int] = 3
    max_comments_per_video: Optional[int] = 10

@router.post("/analyze-youtube-sentiment")
def analyze_youtube_sentiment_route(request: YouTubeSentimentRequest):
    results = analyze_comments_sentiment(request.query, request.max_videos, request.max_comments_per_video)
    return {"results": results} 