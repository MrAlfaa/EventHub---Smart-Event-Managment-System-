import axios from 'axios';

// Define the API base URL - make sure it matches other services
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add logging interceptors
api.interceptors.request.use(request => {
  console.log('Request:', request.method, request.url);
  console.log('Request headers:', request.headers);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.log('Response Error:', error.response?.status, error.config?.url);
    console.log('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define endpoints to try in order
const endpoints = [
  '/provider-stats',           // New dedicated endpoint
  '/dashboard-stats',          // Simplified endpoint
  '/providers/dashboard-stats' // Original endpoint
];

// Provider stats service functions
const providerStatsService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    // Try each endpoint in order
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${API_URL}${endpoint}`);
        const response = await api.get(endpoint);
        console.log('Success with endpoint:', endpoint);
        return response.data;
      } catch (error) {
        console.error(`Failed with endpoint ${endpoint}:`, error);
        // Try the next endpoint if this one failed
        if (endpoint !== endpoints[endpoints.length - 1]) {
          console.log('Trying next endpoint...');
          continue;
        }
        // If this was the last endpoint, throw the error
        throw error;
      }
    }
  }
};

export default providerStatsService;