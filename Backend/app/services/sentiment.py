from transformers import pipeline

# Load the sentiment-analysis pipeline with the specified model
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of the input text and return a dict with 'label' and 'score'.
    """
    result = sentiment_pipeline(text)[0]
    return {"label": result["label"], "score": float(result["score"])}
