from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from uuid import UUID
from datetime import datetime

class User(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Post(BaseModel):
    id: UUID
    platform: str  # e.g., "twitter", "reddit"
    content: str
    user_handle: Optional[str] = None
    timestamp: datetime
    sentiment_score: Optional[float] = None
    emotion: Optional[str] = None  # e.g., "happy", "angry"
    metadata: Optional[Any] = None  # JSON field

class Report(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    summary: Optional[str] = None
    metrics: Any  # JSON field for stats, scores, insights

class Alert(BaseModel):
    id: UUID
    post_id: UUID
    triggered_at: datetime = Field(default_factory=datetime.utcnow)
    alert_type: str  # e.g., "viral", "negative"
    description: Optional[str] = None

class PlatformSource(BaseModel):
    id: UUID
    platform: str
    api_connected: bool
    connected_at: datetime = Field(default_factory=datetime.utcnow)

class Feedback(BaseModel):
    id: UUID
    user_id: UUID
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
