import axios from 'axios';

// Centralized Axios instance
// Base URL comes from vite env; falls back to localhost:8000
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});
