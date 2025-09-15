const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SessionInfo {
  session_id: string;
  credits_remaining: number;
}

export interface CreditInfo {
  credits_remaining: number;
  session_valid: boolean;
}

class CreditService {
  private sessionId: string | null = null;

  constructor() {
    // Load session ID from localStorage if it exists
    this.sessionId = localStorage.getItem('anonymous_session_id');
    console.log('CreditService initialized with session ID:', this.sessionId);
  }

  /**
   * Create a new anonymous session with 6 free credits
   */
  async createSession(): Promise<SessionInfo> {
    console.log('Creating new session...', API_BASE_URL);
    try {
      const response = await fetch(`${API_BASE_URL}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Session create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session create failed:', response.status, errorText);
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const sessionInfo: SessionInfo = await response.json();
      console.log('Session created successfully:', sessionInfo);
      this.sessionId = sessionInfo.session_id;
      
      // Store session ID in localStorage
      localStorage.setItem('anonymous_session_id', this.sessionId);
      
      return sessionInfo;
    } catch (error) {
      console.error('Error creating anonymous session:', error);
      throw error;
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get remaining credits for current session
   */
  async getCredits(): Promise<CreditInfo | null> {
    if (!this.sessionId) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/session/credits`, {
        method: 'GET',
        headers: {
          'X-Session-Id': this.sessionId,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Session expired or not found
          this.clearSession();
          return null;
        }
        throw new Error(`Failed to get credits: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting credits:', error);
      throw error;
    }
  }

  /**
   * Use one credit (called before making a report request)
   */
  async useCredit(): Promise<{ success: boolean; credits_remaining: number; message: string }> {
    if (!this.sessionId) {
      throw new Error('No active session. Please create a session first.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/session/use-credit`, {
        method: 'POST',
        headers: {
          'X-Session-Id': this.sessionId,
        },
      });

      if (!response.ok) {
        if (response.status === 402) {
          // No credits remaining
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No credits remaining');
        }
        if (response.status === 404) {
          // Session expired or not found
          this.clearSession();
          throw new Error('Session expired. Please refresh the page.');
        }
        throw new Error(`Failed to use credit: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error using credit:', error);
      throw error;
    }
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.sessionId = null;
    localStorage.removeItem('anonymous_session_id');
  }

  /**
   * Check if user has an active session
   */
  hasActiveSession(): boolean {
    return this.sessionId !== null;
  }

  /**
   * Initialize session if needed (used when app starts)
   */
  async initializeSession(): Promise<SessionInfo | null> {
    if (this.hasActiveSession()) {
      // Try to get current credits to verify session is still valid
      const credits = await this.getCredits();
      if (credits && credits.session_valid) {
        return {
          session_id: this.sessionId!,
          credits_remaining: credits.credits_remaining
        };
      }
    }

    // Create new session if no valid session exists
    return await this.createSession();
  }
}

export const creditService = new CreditService();
