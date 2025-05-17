import axios from 'axios';
import { Review } from '@/types';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const reviewApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
reviewApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Review service functions
const reviewService = {
  // Get reviews for a specific service provider
  getProviderReviews: async (providerId: string): Promise<Review[]> => {
    try {
      const response = await reviewApi.get(`/reviews/provider/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider reviews:', error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (providerId: string, rating: number, comment: string): Promise<Review> => {
    try {
      console.log("Submitting review:", { serviceProviderId: providerId, rating, comment });
      const response = await reviewApi.post('/reviews', {
        serviceProviderId: providerId,
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  // Reply to a review (service provider only)
  replyToReview: async (reviewId: string, response: string): Promise<Review> => {
    try {
      const result = await reviewApi.post(`/reviews/${reviewId}/reply`, {
        response
      });
      return result.data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  },

  // Get reviews posted by the current user
  getUserReviews: async (): Promise<Review[]> => {
    try {
      const response = await reviewApi.get('/reviews/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }
};

export default reviewService;
