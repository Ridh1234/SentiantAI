import os
import requests
import json
import logging
import time
import random
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY is not set!")
    raise ValueError("GOOGLE_API_KEY must be set in the environment variables.")

# Model rotation configuration - FREE MODELS ONLY
GEMINI_MODELS = [
    "gemini-2.5-flash",        # Best price-performance ratio, free
    "gemini-2.0-flash",        # Fast and versatile, free
    "gemini-2.5-flash-lite",   # Most cost-efficient, free
    "gemini-2.0-flash-lite",   # Cost-efficient and low latency, free
    "gemini-1.5-flash",        # Fast multimodal, free
    "gemini-1.5-flash-8b",     # Smaller model for lower intelligence tasks, free
]

# Error handling configuration
MAX_RETRIES = 3
BASE_DELAY = 1  # Base delay in seconds
MAX_DELAY = 8   # Maximum delay in seconds

def get_next_model(current_model=None, failed_models=None):
    """
    Get the next model to try from the rotation.
    
    Parameters
    ----------
    current_model : str, optional
        The model that just failed
    failed_models : set, optional
        Set of models that have already failed
    
    Returns
    -------
    str or None
        Next model to try, or None if all models have been tried
    """
    if failed_models is None:
        failed_models = set()
    
    available_models = [model for model in GEMINI_MODELS if model not in failed_models]
    
    if not available_models:
        return None
    
    # If no current model specified, start with the first available
    if current_model is None:
        return available_models[0]
    
    # Try to get the next model in rotation
    try:
        current_index = GEMINI_MODELS.index(current_model)
        for i in range(1, len(GEMINI_MODELS)):
            next_index = (current_index + i) % len(GEMINI_MODELS)
            next_model = GEMINI_MODELS[next_index]
            if next_model not in failed_models:
                return next_model
    except ValueError:
        pass
    
    # Fallback to first available model
    return available_models[0]

def is_retryable_error(status_code, error_message):
    """
    Determine if an error is retryable.
    
    Parameters
    ----------
    status_code : int
        HTTP status code
    error_message : str
        Error message
    
    Returns
    -------
    bool
        True if the error is retryable
    """
    # Retryable status codes
    retryable_codes = {503, 429, 500, 502, 504}
    
    # Retryable error messages
    retryable_messages = [
        "overloaded",
        "timeout",
        "unavailable",
        "rate limit",
        "quota exceeded",
        "internal error"
    ]
    
    if status_code in retryable_codes:
        return True
    
    error_lower = error_message.lower()
    return any(msg in error_lower for msg in retryable_messages)

def calculate_delay(attempt, base_delay=BASE_DELAY, max_delay=MAX_DELAY):
    """
    Calculate exponential backoff delay with jitter.
    
    Parameters
    ----------
    attempt : int
        Current attempt number (0-indexed)
    base_delay : float
        Base delay in seconds
    max_delay : float
        Maximum delay in seconds
    
    Returns
    -------
    float
        Delay in seconds
    """
    # Exponential backoff: base_delay * (2 ^ attempt)
    delay = base_delay * (2 ** attempt)
    
    # Cap at max_delay
    delay = min(delay, max_delay)
    
    # Add jitter (±25% of delay)
    jitter = delay * 0.25 * (2 * random.random() - 1)
    delay += jitter
    
    return max(0, delay)

def gemini_chat_generate(messages, model=None):
    """
    Generate chat response using Google's Gemini API with model rotation and retry logic.
    
    Parameters
    ----------
    messages : list
        List of message dictionaries with 'role' and 'content' keys.
        Compatible with OpenAI chat format.
    model : str, optional
        The Gemini model to use. If None, uses model rotation.
    
    Returns
    -------
    str
        The generated response content.
    """
    if model is None:
        model = GEMINI_MODELS[0]  # Start with first model
    
    failed_models = set()
    current_model = model
    
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"Attempt {attempt + 1}/{MAX_RETRIES} with model: {current_model}")
            
            # Convert OpenAI-style messages to Gemini format
            gemini_contents = []
            for message in messages:
                role = message.get("role", "user")
                content = message.get("content", "")
                
                # Gemini uses 'user' and 'model' roles
                if role == "assistant":
                    role = "model"
                elif role == "system":
                    # Prepend system message to user content
                    if gemini_contents and gemini_contents[-1]["role"] == "user":
                        gemini_contents[-1]["parts"][0]["text"] = content + "\n\n" + gemini_contents[-1]["parts"][0]["text"]
                        continue
                    else:
                        role = "user"
                
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
            
            # Prepare the API request
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent?key={GOOGLE_API_KEY}"
            
            payload = {
                "contents": gemini_contents,
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048,
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            # Make the request with timeout
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            logger.debug(f"Response status code: {response.status_code}")
            logger.debug(f"Response content: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract the generated content
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            logger.info(f"Successfully generated response using {current_model}")
                            return parts[0]["text"]
                
                logger.error(f"Unexpected response format from Gemini: {result}")
                raise ValueError("Unexpected response format from Gemini API")
            
            else:
                # Handle error response
                error_info = response.text
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_info = error_json["error"].get("message", error_info)
                except:
                    pass
                
                logger.error(f"Gemini API error: {response.status_code} - {error_info}")
                
                # Check if error is retryable
                if is_retryable_error(response.status_code, error_info):
                    # Mark current model as failed for this request
                    failed_models.add(current_model)
                    
                    # Try to get next model
                    next_model = get_next_model(current_model, failed_models)
                    
                    if next_model:
                        current_model = next_model
                        logger.info(f"Switching to model: {current_model}")
                        
                        # Add delay before retry
                        if attempt < MAX_RETRIES - 1:
                            delay = calculate_delay(attempt)
                            logger.info(f"Retrying in {delay:.2f} seconds...")
                            time.sleep(delay)
                        continue
                    else:
                        logger.error("All models have failed, no more models to try")
                        raise Exception(f"All Gemini models failed. Last error: {response.status_code} - {error_info}")
                else:
                    # Non-retryable error
                    raise Exception(f"Gemini API error: {response.status_code} - {error_info}")
        
        except requests.exceptions.Timeout:
            logger.error(f"Timeout error with model {current_model}")
            failed_models.add(current_model)
            
            # Try next model
            next_model = get_next_model(current_model, failed_models)
            if next_model:
                current_model = next_model
                logger.info(f"Switching to model due to timeout: {current_model}")
                
                if attempt < MAX_RETRIES - 1:
                    delay = calculate_delay(attempt)
                    logger.info(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                continue
            else:
                logger.error("All models have timed out")
                raise Exception("All Gemini models timed out")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error with model {current_model}: {str(e)}")
            failed_models.add(current_model)
            
            # Try next model
            next_model = get_next_model(current_model, failed_models)
            if next_model:
                current_model = next_model
                logger.info(f"Switching to model due to request error: {current_model}")
                
                if attempt < MAX_RETRIES - 1:
                    delay = calculate_delay(attempt)
                    logger.info(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                continue
            else:
                logger.error("All models have failed with request errors")
                raise Exception(f"All Gemini models failed with request errors. Last error: {str(e)}")
        
        except Exception as e:
            logger.error(f"Unexpected error with model {current_model}: {str(e)}")
            
            # For unexpected errors, try next model
            failed_models.add(current_model)
            next_model = get_next_model(current_model, failed_models)
            
            if next_model and attempt < MAX_RETRIES - 1:
                current_model = next_model
                logger.info(f"Switching to model due to unexpected error: {current_model}")
                
                delay = calculate_delay(attempt)
                logger.info(f"Retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                continue
            else:
                # If no more models or last attempt, raise the error
                raise
    
    # If we've exhausted all retries
    raise Exception(f"Failed to generate response after {MAX_RETRIES} attempts across all available models")
