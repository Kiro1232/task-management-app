import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

/**
 * Axios instance pre-configured for the Task Manager API.
 *
 * Key security decisions:
 * - withCredentials: true — sends HTTP-Only cookies automatically with every request,
 *   keeping the JWT out of JavaScript's reach (XSS protection).
 * - timeout: 10 000ms — prevents indefinite hangs on slow/unavailable backend.
 * - Response interceptor — redirects to /login on 401 so the UI stays consistent.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

// Request interceptor — development logging only
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.warn(`[API] → ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle expired sessions globally
apiClient.interceptors.response.use(
  <T>(response: T) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const onAuthPage =
        window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!onAuthPage) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
