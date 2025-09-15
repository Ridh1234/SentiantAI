from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.full_report import generate_full_report
from app.utils.credit_manager import credit_manager

router = APIRouter()

class FullReportRequest(BaseModel):
    topic: str
    reddit_subreddit: Optional[str] = "all"
    reddit_limit: Optional[int] = 10
    youtube_max_videos: Optional[int] = 2
    youtube_max_comments_per_video: Optional[int] = 5
    twitter_max_results: Optional[int] = 10

@router.post("/generate-full-report")
def generate_full_report_route(
    request: FullReportRequest,
    x_session_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    x_credit_already_used: Optional[str] = Header(None),
):
    # Check if user is authenticated (has authorization header)
    is_authenticated = authorization is not None
    
    # If not authenticated, check credits
    if not is_authenticated:
        if not x_session_id:
            raise HTTPException(
                status_code=401, 
                detail="Authentication required or session ID needed for anonymous access"
            )
        
        # If frontend didn't spend a credit yet, spend here
        should_spend_here = (x_credit_already_used or "").lower() != "true"
        success = True
        if should_spend_here:
            success = credit_manager.use_credit(x_session_id)
        if not success:
            credits = credit_manager.get_credits(x_session_id)
            if credits is None:
                raise HTTPException(status_code=404, detail="Session not found or expired")
            else:
                raise HTTPException(
                    status_code=402, 
                    detail="No credits remaining. Please sign up to continue using the service."
                )
    
    # Generate the report
    result = generate_full_report(
        topic=request.topic,
        reddit_subreddit=request.reddit_subreddit,
        reddit_limit=request.reddit_limit,
        youtube_max_videos=request.youtube_max_videos,
        youtube_max_comments_per_video=request.youtube_max_comments_per_video,
        twitter_max_results=request.twitter_max_results
    )
    
    # Add credits info for anonymous users
    if not is_authenticated and x_session_id:
        remaining_credits = credit_manager.get_credits(x_session_id) or 0
        result["credits_remaining"] = remaining_credits
    
    return result 