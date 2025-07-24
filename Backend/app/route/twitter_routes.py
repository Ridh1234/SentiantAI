from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.twitter import analyze_tweets_sentiment

router = APIRouter()

class TweetSentimentRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10

@router.post("/analyze-tweets-sentiment")
def analyze_tweets_sentiment_route(request: TweetSentimentRequest):
    results = analyze_tweets_sentiment(request.query, request.max_results)
    return {"results": results} 