from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.route.sentiment_routes import router as sentiment_router
from app.route.user_routes import router as user_router
from app.route.twitter_routes import router as twitter_router
from app.route.reddit_routes import router as reddit_router
from app.route.youtube_routes import router as youtube_router
from app.route.report_routes import router as report_router
from app.route.full_report_routes import router as full_report_router

app = FastAPI()

# CORS settings — allow frontend running on localhost:3000
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentiment_router)
app.include_router(user_router)
app.include_router(twitter_router)
app.include_router(reddit_router)
app.include_router(youtube_router)
app.include_router(report_router)
app.include_router(full_report_router)

@app.get("/")
async def root():
    return {"message": "Sentiant FastAPI backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
