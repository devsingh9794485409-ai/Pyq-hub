// src/api/client.js
import axios from 'axios';

export const TOKEN_KEY = 'pyqhub_token';

/**
 * Returns the normalized API base URL (always ending in /api without trailing slashes).
 * Handles:
 * - https://backend.onrender.com       -> https://backend.onrender.com/api
 * - https://backend.onrender.com/api   -> https://backend.onrender.com/api
 * - https://backend.onrender.com/api/  -> https://backend.onrender.com/api
 * - undefined (local dev)             -> http://localhost:5000/api
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (!envUrl) return 'http://localhost:5000/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

/**
 * Returns the backend server origin without the /api suffix (for asset/file links).
 */
export const getServerOrigin = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api$/, '');
};

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// Har request ke saath token bhejo (agar hai)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response handle karo — 401 aaye toh auto logout
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const onAuthRoute =
      window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/signup');

    if (status === 401 && !onAuthRoute) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('pyqhub:logout'));
    }
    return Promise.reject(error);
  }
);

// Error ko readable message me convert karo
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.details && typeof data.details === 'object') {
    return Object.values(data.details).join(', ');
  }
  return data?.message || error?.message || 'Something went wrong';
};

export default client;