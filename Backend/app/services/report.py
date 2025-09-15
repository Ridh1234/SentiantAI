from app.utils.gemini_client import gemini_chat_generate
from typing import List, Dict

def generate_report_from_sentiments(topic: str, comments_with_sentiment: List[Dict], max_tokens: int = 512) -> str:
    # Build a chat message for the LLM
    user_message = (
        f"You are an expert analyst. Given the following comments and their sentiment scores about '{topic}', "
        "generate a detailed summary and report. The report should include:\n"
        "- An overall sentiment summary (positive/negative/neutral)\n"
        "- Key themes or opinions\n"
        "- Any notable trends or anomalies\n"
        "- A concise summary for an executive\n\n"
        "Comments and Sentiments:\n"
    )
    for item in comments_with_sentiment:
        comment = item.get("text")
        sentiment = item.get("sentiment")
        if isinstance(sentiment, dict):
            label = sentiment.get("label")
            score = sentiment.get("score")
        else:
            label = sentiment
            score = None
        user_message += f"\n- Comment: {comment}\n  Sentiment: {label} (score: {score})"
    user_message += "\n\nSummary and Report:"

    messages = [
        {"role": "user", "content": user_message}
    ]
    # Call the Gemini API
    response = gemini_chat_generate(messages)
    # Return the generated content directly
    return response 