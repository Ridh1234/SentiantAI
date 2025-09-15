from app.utils.news_client import fetch_news
from app.utils.gemini_client import gemini_chat_generate
from typing import List, Dict, Union
import logging

logger = logging.getLogger(__name__)

def fetch_and_process_news(query: str) -> Dict:
    news_response = fetch_news(query)
    articles = news_response.get("results", [])
    if not articles:
        return {"error": "No news articles found."}
    # Prepare content for Gemini
    news_texts = [f"Title: {a.get('title', '')}\nDescription: {a.get('description', '')}\nContent: {a.get('content', '')}" for a in articles]
    user_message = (
        f"You are an expert news analyst. Given the following news articles about '{query}', "
        "analyze and summarize the key points, trends, and any notable insights.\n\n"
    )
    for idx, text in enumerate(news_texts, 1):
        user_message += f"Article {idx}:\n{text}\n\n"
    user_message += "\nSummary and Analysis:"
    messages = [
        {"role": "user", "content": user_message}
    ]
    try:
        summary = gemini_chat_generate(messages)
    except Exception as e:
        logger.error(f"Error generating news summary: {str(e)}")
        summary = "Summary unavailable due to upstream error."
    return {
        "summary": summary,
        "articles": articles
    } 