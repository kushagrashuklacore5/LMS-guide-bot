import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include language header
axiosInstance.interceptors.request.use((config) => {
  // Get user's current language from localStorage or default to 'en'
  const currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
  
  // Add language header to all requests
  config.headers['x-language'] = currentLanguage;
  
  // Add authorization token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

export default axiosInstance;
