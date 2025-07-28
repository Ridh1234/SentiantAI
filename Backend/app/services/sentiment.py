from app.utils.hf_inference import hf_sentiment_analysis



def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of the input text and return a dict with 'label' and 'score'.
    """
    return hf_sentiment_analysis(text)
