import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.environ.get("HF_API_TOKEN")

if not HF_API_TOKEN:
    raise ValueError("HF_API_TOKEN must be set in the environment variables.")

API_URL = "https://router.huggingface.co/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}

def hf_chat_generate(messages, model="mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"):
    payload = {
        "messages": messages,
        "model": model,
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json() 