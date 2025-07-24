from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.services.report import generate_report_from_sentiments

router = APIRouter()

class ReportRequest(BaseModel):
    topic: str
    comments_with_sentiment: List[Dict]

@router.post("/generate-report")
def generate_report_route(request: ReportRequest):
    report = generate_report_from_sentiments(request.topic, request.comments_with_sentiment)
    return {"report": report} 