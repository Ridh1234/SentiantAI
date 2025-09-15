import axios from 'axios';
import { creditService } from './services/creditService';

// Centralized Axios instance
// Base URL comes from vite env; falls back to localhost:8000
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: false,
});

// Add request interceptor to include session ID for anonymous users
api.interceptors.request.use((config) => {
  const sessionId = creditService.getSessionId();
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  return config;
});

// Add response interceptor to handle credit exhaustion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402) {
      // Credits exhausted - could trigger a modal or redirect to signup
      console.warn('Credits exhausted:', error.response.data.detail);
    } else if (error.response?.status === 404 && error.response.data.detail?.includes('Session')) {
      // Session expired
      creditService.clearSession();
      console.warn('Session expired, cleared local session');
    }
    return Promise.reject(error);
  }
);
