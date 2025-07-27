import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.environ.get("NEWS_API_KEY")

if not NEWS_API_KEY:
    raise ValueError("NEWS_API_KEY must be set in the environment variables.")

def fetch_news(query: str):
    print(f"[DEBUG] NEWS_API_KEY: {NEWS_API_KEY}")  # Debugging statement
    url = "https://newsdata.io/api/1/latest"
    params = {
        "apikey": NEWS_API_KEY,
        "q": query if query is not None else ""
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json() 