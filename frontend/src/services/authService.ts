import axios from 'axios';
import { User } from '@/types';

// Define the API base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Define types for auth requests
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}

export interface RegisterServiceProviderData {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  business_name: string;
  business_description: string;
  service_types: string[];
}

// Create an axios instance for authentication
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth service functions
const authService = {
  // Register a new user
  register: async (userData: RegisterUserData): Promise<void> => {
    const response = await authApi.post('/users/register', userData);
    return response.data;
  },

  // Register a new service provider
  registerServiceProvider: async (providerData: RegisterServiceProviderData): Promise<void> => {
    const response = await authApi.post('/providers/register', providerData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await authApi.post('/auth/login', credentials);
    
    // Make sure these properties exist in the response data
    const { user, token } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('eventHub_token', token);
    localStorage.setItem('eventHub_user', JSON.stringify(user));
    
    // Return both properties
    return { user, token };
  },

  // Log out user
  logout: (): void => {
    localStorage.removeItem('eventHub_token');
    localStorage.removeItem('eventHub_user');
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await authApi.get('/users/me');
    return response.data;
  },
};

export default authService;