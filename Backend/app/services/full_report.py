from app.services.reddit import analyze_comments_sentiment as analyze_reddit
from app.services.youtube import analyze_comments_sentiment as analyze_youtube
from app.services.report import generate_report_from_sentiments
from typing import List, Dict

def generate_full_report(
    topic: str,
    reddit_subreddit: str = "all",
    reddit_limit: int = 10,
    youtube_max_videos: int = 2,
    youtube_max_comments_per_video: int = 5
) -> Dict:
    # Fetch and analyze Reddit comments
    reddit_results = analyze_reddit(reddit_subreddit, topic, reddit_limit)
    if isinstance(reddit_results, dict) and "error" in reddit_results:
        reddit_comments = []
    else:
        reddit_comments = reddit_results

    # Fetch and analyze YouTube comments
    youtube_results = analyze_youtube(topic, youtube_max_videos, youtube_max_comments_per_video)
    if isinstance(youtube_results, dict) and "error" in youtube_results:
        youtube_comments = []
    else:
        youtube_comments = youtube_results

    # Combine all comments with sentiment
    all_comments = reddit_comments + youtube_comments

    # Generate the report using Mistral
    report = generate_report_from_sentiments(topic, all_comments, max_tokens=512)

    return {
        "report": report,
        "analyzed_comments": all_comments
    } 