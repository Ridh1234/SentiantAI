from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.news import fetch_and_process_news
import traceback

router = APIRouter()

class NewsRequest(BaseModel):
    topic: str

@router.post("/analyze-news-info")
def analyze_news_info_route(request: NewsRequest):
    try:
        result = fetch_and_process_news(request.topic)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in /analyze-news-info:", traceback.format_exc())
        return {"error": str(e), "traceback": traceback.format_exc()} 