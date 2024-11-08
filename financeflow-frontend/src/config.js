// src/config.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined. Please set it in your environment variables.");
}
