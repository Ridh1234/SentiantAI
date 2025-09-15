import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from pathlib import Path

# File to store anonymous user credits
CREDITS_FILE = "anonymous_credits.json"

class CreditManager:
    def __init__(self):
        self.credits_data = self._load_credits()
    
    def _load_credits(self) -> Dict:
        """Load credits data from file"""
        if os.path.exists(CREDITS_FILE):
            try:
                with open(CREDITS_FILE, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return {}
        return {}
    
    def _save_credits(self) -> None:
        """Save credits data to file"""
        with open(CREDITS_FILE, 'w') as f:
            json.dump(self.credits_data, f, indent=2)
    
    def _cleanup_expired(self) -> None:
        """Remove expired session data (older than 24 hours)"""
        now = datetime.now()
        expired_sessions = []
        
        for session_id, data in self.credits_data.items():
            try:
                last_used = datetime.fromisoformat(data.get('last_used', ''))
                if now - last_used > timedelta(hours=24):
                    expired_sessions.append(session_id)
            except (ValueError, TypeError):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.credits_data[session_id]
        
        if expired_sessions:
            self._save_credits()
    
    def create_session(self) -> str:
        """Create a new guest session with 5 credits"""
        self._cleanup_expired()
        
        session_id = str(uuid.uuid4())
        self.credits_data[session_id] = {
            'credits_remaining': 5,
            'created_at': datetime.now().isoformat(),
            'last_used': datetime.now().isoformat()
        }
        self._save_credits()
        return session_id
    
    def get_credits(self, session_id: str) -> Optional[int]:
        """Get remaining credits for a session"""
        self._cleanup_expired()
        
        if session_id not in self.credits_data:
            return None
        
        return self.credits_data[session_id]['credits_remaining']
    
    def use_credit(self, session_id: str) -> bool:
        """Use one credit for a session. Returns True if successful, False if no credits left"""
        self._cleanup_expired()
        
        if session_id not in self.credits_data:
            return False
        
        session_data = self.credits_data[session_id]
        if session_data['credits_remaining'] <= 0:
            return False
        
        session_data['credits_remaining'] -= 1
        session_data['last_used'] = datetime.now().isoformat()
        self._save_credits()
        return True
    
    def get_session_info(self, session_id: str) -> Optional[Dict]:
        """Get full session information"""
        self._cleanup_expired()
        
        if session_id not in self.credits_data:
            return None
        
        return self.credits_data[session_id].copy()

# Global instance
credit_manager = CreditManager()
