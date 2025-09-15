import os
import json
import requests
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Debug print environment variables
logger.debug("Environment variables loaded:")
for key in os.environ:
    if key.startswith("HF_"):
        logger.debug(f"{key}: {os.environ[key]}")
    else:
        logger.debug(f"{key}: <redacted>")

HF_API_TOKEN = os.environ.get("HF_API_TOKEN")

if not HF_API_TOKEN:
    logger.error("HF_API_TOKEN is not set!")
    raise ValueError("HF_API_TOKEN must be set in the environment variables.")
else:
    logger.debug(f"HF_API_TOKEN length: {len(HF_API_TOKEN)}")

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}

logger.debug(f"Headers: {headers}")


def hf_sentiment_analysis(text: str, model: str = "distilbert/distilbert-base-uncased-finetuned-sst-2-english") -> dict:
    """\
    Perform sentiment analysis on the given text by calling the Hugging Face Inference API.

    Parameters
    ----------
    text : str
        The input text to analyze.
    model : str, optional
        The fully-qualified model name on Hugging Face Hub, by default
        "distilbert-base-uncased-finetuned-sst-2-english".

    Returns
    -------
    dict
        A dictionary containing the keys `label` and `score`.
    """
    logger.debug("Starting sentiment analysis via HF Inference API")
    logger.debug(f"Model: {model}")
    logger.debug(f"Text: {text}")

    inference_url = f"https://api-inference.huggingface.co/models/{model}"

    payload = {"inputs": text}
    logger.debug(f"Payload: {payload}")

    try:
        response = requests.post(inference_url, headers=headers, json=payload, timeout=30)
        logger.debug(f"Status code: {response.status_code}")
        logger.debug(f"Raw response: {response.text}")

        if response.status_code == 503:
            # The model is loading; retry error message contains estimated_time
            error_json = response.json()
            estimated = error_json.get("estimated_time", "unknown")
            logger.warning(f"Model is loading. Estimated time: {estimated} seconds")
            raise RuntimeError("Model loading in progress. Please retry later.")

        if response.status_code != 200:
            raise RuntimeError(f"HF inference API error {response.status_code}: {response.text}")

        result = response.json()
        # HF returns classifications inside a list (sometimes nested). Take the first item conveniently.
        if isinstance(result, list) and len(result) > 0:
            entry = result[0]
            # Some endpoints wrap results in an extra list: [[{...}, {...}]]
            if isinstance(entry, list) and len(entry) > 0:
                entry = entry[0]

            if isinstance(entry, dict):
                label = entry.get("label")
                score = entry.get("score")
                return {"label": label, "score": float(score) if score is not None else None}

        raise ValueError(f"Unexpected response format: {result}")
    except requests.RequestException as e:
        logger.error(f"Network error calling HF inference API: {e}")
        raise
    except Exception as e:
        logger.error(f"Error in hf_sentiment_analysis: {e}")
        raise