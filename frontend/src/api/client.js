// src/api/client.js
import axios from 'axios';

export const TOKEN_KEY = 'pyqhub_token';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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