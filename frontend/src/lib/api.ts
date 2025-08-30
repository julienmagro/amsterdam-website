import axios from 'axios';
import Cookies from 'js-cookie';

// Get the correct API base URL for different environments
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.API_BASE_URL || 'http://localhost:5001/api';
  }
  
  // Client-side: detect environment
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    return 'http://localhost:5001/api';
  } else {
    // Production/staging: same domain
    return `${window.location.protocol}//${window.location.host}/api`;
  }
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('access_token');
      // Redirect to login page if needed
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    age: number;
  }) => api.post('/auth/register', userData),
  
  verifyEmail: (data: { user_id: number; verification_code: string }) =>
    api.post('/auth/verify-email', data),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  profile: () => api.get('/auth/profile'),
  
  googleAuth: () => api.get('/auth/google'),
};

export const calculatorAPI = {
  calculate: (data: {
    num1: number;
    num2: number;
    operation: string;
  }) => api.post('/calculator', data),
  
  getHistory: () => api.get('/calculator/history'),
};

export const contentAPI = {
  getHistory: () => api.get('/content/history'),
  getWater: () => api.get('/content/water'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
};

// Utility functions
export const setAuthToken = (token: string) => {
  Cookies.set('access_token', token, { expires: 1 }); // 1 day
};

export const removeAuthToken = () => {
  Cookies.remove('access_token');
};

export const getAuthToken = () => {
  return Cookies.get('access_token');
};
