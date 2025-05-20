import axios from 'axios';
import { PromotionResponse, PublicEventResponse } from '@/types/promotion';

// Define the API base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const promotionService = {
  // Get active promotions for users
  getActivePromotions: async (): Promise<PromotionResponse[]> => {
    const response = await apiClient.get('/promotions/active?type=promotion');
    return response.data;
  },

  // Get active public events for users
  getActivePublicEvents: async (): Promise<PublicEventResponse[]> => {
    const response = await apiClient.get('/promotions/active?type=event');
    return response.data;
  },
};

export default promotionService;