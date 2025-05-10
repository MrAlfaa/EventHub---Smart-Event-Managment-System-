import axios from 'axios';
import { User } from '@/types';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User service functions
const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await userApi.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (updateData: Partial<User>): Promise<User> => {
    const response = await userApi.put('/users/me', updateData);
    return response.data;
  },
};

export default userService;