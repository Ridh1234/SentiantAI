from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.reddit import analyze_comments_sentiment

router = APIRouter()

class RedditSentimentRequest(BaseModel):
    subreddit: str
    query: str
    limit: Optional[int] = 10

@router.post("/analyze-reddit-sentiment")
def analyze_reddit_sentiment_route(request: RedditSentimentRequest):
    results = analyze_comments_sentiment(request.subreddit, request.query, request.limit)
    return {"results": results} 