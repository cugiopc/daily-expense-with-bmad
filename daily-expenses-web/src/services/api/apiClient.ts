import axios from 'axios';

// Get base URL from environment variable, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include cookies in requests (for refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// The interceptors will be set up when the AuthProvider is initialized
// to avoid circular dependency issues with the useAuth hook