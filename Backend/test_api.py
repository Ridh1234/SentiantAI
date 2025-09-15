import requests
import json

# Test the generate-full-report endpoint
url = "http://localhost:8000/generate-full-report"
headers = {"Content-Type": "application/json"}
data = {
    "topic": "artificial intelligence",
    "reddit_subreddit": "all",
    "reddit_limit": 10,
    "youtube_max_videos": 2,
    "youtube_max_comments_per_video": 5,
    "twitter_max_results": 10
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print("\nResponse:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {str(e)}")
