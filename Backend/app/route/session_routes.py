from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.utils.credit_manager import credit_manager
from typing import Optional

router = APIRouter()

class SessionResponse(BaseModel):
    session_id: str
    credits_remaining: int

class CreditResponse(BaseModel):
    credits_remaining: int
    session_valid: bool

@router.post("/session/create", response_model=SessionResponse)
def create_anonymous_session():
    """Create a new guest session with 5 free credits"""
    session_id = credit_manager.create_session()
    credits = credit_manager.get_credits(session_id) or 0
    return SessionResponse(
        session_id=session_id,
        credits_remaining=credits
    )

@router.get("/session/credits", response_model=CreditResponse)
def get_credits(x_session_id: Optional[str] = Header(None)):
    """Get remaining credits for a session"""
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Session ID required in X-Session-Id header")
    
    credits = credit_manager.get_credits(x_session_id)
    if credits is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return CreditResponse(
        credits_remaining=credits,
        session_valid=True
    )

@router.post("/session/use-credit")
def use_credit(x_session_id: Optional[str] = Header(None)):
    """Use one credit from the session"""
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Session ID required in X-Session-Id header")
    
    success = credit_manager.use_credit(x_session_id)
    if not success:
        credits = credit_manager.get_credits(x_session_id)
        if credits is None:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        else:
            raise HTTPException(status_code=402, detail="No credits remaining. Please sign up to continue.")
    
    remaining_credits = credit_manager.get_credits(x_session_id) or 0
    return {
        "success": True,
        "credits_remaining": remaining_credits,
        "message": f"{remaining_credits} credits remaining"
    }
