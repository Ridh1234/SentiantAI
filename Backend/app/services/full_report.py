from app.services.reddit import analyze_comments_sentiment as analyze_reddit
from app.services.youtube import analyze_comments_sentiment as analyze_youtube
from app.services.twitter import analyze_tweets_sentiment as analyze_twitter
from app.services.news import fetch_and_process_news
from app.services.report import generate_report_from_sentiments
from typing import List, Dict

def generate_full_report(
    topic: str,
    reddit_subreddit: str = "all",
    reddit_limit: int = 10,
    youtube_max_videos: int = 2,
    youtube_max_comments_per_video: int = 5,
    twitter_max_results: int = 10
) -> Dict:
    # Fetch and analyze Reddit comments
    reddit_results = analyze_reddit(reddit_subreddit, topic, reddit_limit)
    reddit_comments = [] if isinstance(reddit_results, dict) and "error" in reddit_results else reddit_results

    # Fetch and analyze YouTube comments
    youtube_results = analyze_youtube(topic, youtube_max_videos, youtube_max_comments_per_video)
    youtube_comments = [] if isinstance(youtube_results, dict) and "error" in youtube_results else youtube_results

    # Fetch and analyze Twitter comments
    twitter_results = analyze_twitter(topic, twitter_max_results)
    twitter_comments = [] if isinstance(twitter_results, dict) and "error" in twitter_results else twitter_results

    # Combine all social comments with sentiment
    all_comments = reddit_comments + youtube_comments + twitter_comments

    # Fetch and process news (for Mistral only)
    news_info = fetch_and_process_news(topic)
    news_summary = news_info.get("summary", "")
    news_articles = news_info.get("articles", [])

    # Generate the report using Mistral (social + news)
    # Pass both social comments and news summary to Mistral
    user_message = (
        f"You are an expert analyst. Given the following social media comments and news articles about '{topic}', "
        "generate a detailed summary and report. The report should include:\n"
        "- An overall sentiment summary (positive/negative/neutral)\n"
        "- Key themes or opinions\n"
        "- Any notable trends or anomalies\n"
        "- A concise summary for an executive\n\n"
        "Social Media Comments and Sentiments:\n"
    )
    for item in all_comments:
        comment = item.get("text")
        sentiment = item.get("sentiment")
        if isinstance(sentiment, dict):
            label = sentiment.get("label")
            score = sentiment.get("score")
        else:
            label = sentiment
            score = None
        user_message += f"\n- Comment: {comment}\n  Sentiment: {label} (score: {score})"
    user_message += "\n\nNews Summary and Insights:\n" + news_summary
    user_message += "\n\nSummary and Report:"

    messages = [
        {"role": "user", "content": user_message}
    ]
    from app.utils.hf_inference import hf_chat_generate
    try:
        final_report = hf_chat_generate(messages)
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        final_report = "Report unavailable due to upstream error."

    return {
        "report": final_report,
        "analyzed_comments": all_comments,
        "news_summary": news_summary,
        "news_articles": news_articles
    } 