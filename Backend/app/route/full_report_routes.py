from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.full_report import generate_full_report

router = APIRouter()

class FullReportRequest(BaseModel):
    topic: str
    reddit_subreddit: Optional[str] = "all"
    reddit_limit: Optional[int] = 10
    youtube_max_videos: Optional[int] = 2
    youtube_max_comments_per_video: Optional[int] = 5
    twitter_max_results: Optional[int] = 10

@router.post("/generate-full-report")
def generate_full_report_route(request: FullReportRequest):
    result = generate_full_report(
        topic=request.topic,
        reddit_subreddit=request.reddit_subreddit,
        reddit_limit=request.reddit_limit,
        youtube_max_videos=request.youtube_max_videos,
        youtube_max_comments_per_video=request.youtube_max_comments_per_video,
        twitter_max_results=request.twitter_max_results
    )
    return result 