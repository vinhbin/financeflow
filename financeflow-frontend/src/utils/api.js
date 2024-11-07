// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5005';
console.log('API_BASE_URL:', API_BASE_URL); // Debugging log

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in environment variables.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to include JWT token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Ensure token is stored under 'token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call error:", error);
    return Promise.reject(error);
  }
);

export default api;
