from fastapi import APIRouter
from pydantic import BaseModel
from app.services.sentiment import analyze_sentiment

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str

@router.post("/analyze-sentiment")
def analyze_sentiment_route(request: SentimentRequest):
    result = analyze_sentiment(request.text)
    return result
