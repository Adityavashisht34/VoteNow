import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  // baseURL: 'http://localhost:4000/api',
  baseURL: 'https://votenow-iszg.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle error responses
    const message = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    // Show toast notification for API errors
    toast.error(message);
    
    // Check for authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
