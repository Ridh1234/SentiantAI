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

API_URL = "https://router.huggingface.co/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}

logger.debug(f"Headers: {headers}")

def hf_chat_generate(messages, model="Featherless-Chat-Models/Mistral-7B-Instruct-v0.2:featherless-ai"):
    logger.debug(f"Generating chat with model: {model}")
    logger.debug(f"Messages: {messages}")
    
    try:
        # Format the payload according to the new HuggingFace API requirements
        payload = {
            "messages": messages,
            "model": model
        }
        logger.debug(f"Payload: {payload}")
        
        response = requests.post(API_URL, headers=headers, json=payload)
        logger.debug(f"Response status code: {response.status_code}")
        logger.debug(f"Response content: {response.text}")
        
        if response.status_code == 404:
            logger.error(f"Model not found: {model}")
            raise ValueError(f"Model not found: {model}")
        
        if response.status_code != 200:
            logger.error(f"API error: {response.status_code} - {response.text}")
            raise Exception(f"API error: {response.status_code} - {response.text}")
        
        result = response.json()
        if "choices" in result and len(result["choices"]) > 0:
            choice = result["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                return choice["message"]["content"]
            elif "text" in choice:
                return choice["text"]
        else:
            logger.error(f"Unexpected response format: {result}")
            raise ValueError("Unexpected response format from HuggingFace API")
    except Exception as e:
        logger.error(f"Error in hf_chat_generate: {str(e)}")
        raise