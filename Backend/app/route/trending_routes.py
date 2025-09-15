from fastapi import APIRouter
from app.services.trending import get_trending_topics

router = APIRouter()

@router.get("/trending")
def trending():
    return get_trending_topics()
