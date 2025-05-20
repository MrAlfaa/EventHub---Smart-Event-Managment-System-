import axios from 'axios';
import { Package } from '@/types'; // Add this import for Package type

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Add this interface
export interface ServiceProvider {
  id: string;
  name: string;
  businessName: string;
  description?: string;
  slogan?: string;
  profileImage?: string;
  coverPhoto?: string;
  serviceType: string[];
  eventTypes?: string[];
  serviceLocations?: string[];
  location: string | {
    city: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  email: string;
  contactNumber: string;
  nicNumber?: string;
  businessRegNumber?: string;
  business_description?: string;
  status: string;
  contact?: {
    email: string;
    phone: string;
    website?: string;
  };
  // Add other required fields
}

// Provider service functions
const providerService = {
  // Upload gallery images
  uploadGalleryImages: async (images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await api.post('/providers/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrls;
  },

  // Get provider gallery images
  getGalleryImages: async (): Promise<string[]> => {
    const response = await api.get('/providers/gallery');
    return response.data.images;
  },

  // Delete a gallery image
  deleteGalleryImage: async (imageUrl: string): Promise<void> => {
    // Using query parameter instead of request body for DELETE
    await api.delete(`/providers/gallery/image?imageUrl=${encodeURIComponent(imageUrl)}`);
  },

  // Get provider profile
  getProviderProfile: async () => {
    const response = await api.get('/providers/me');
    return response.data;
  },

  // Update provider profile
  updateProviderProfile: async (profileData: any) => {
    const response = await api.put('/providers/me', profileData);
    return response.data;
  },

  // Get provider payment cards
  getProviderCards: async () => {
    const response = await api.get('/providers/cards');
    return response.data;
  },

  // Add new payment card
  addProviderCard: async (cardData: any) => {
    const response = await api.post('/providers/cards', cardData);
    return response.data;
  },

  // Update payment card
  updateProviderCard: async (cardId: string, cardData: any) => {
    const response = await api.put(`/providers/cards/${cardId}`, cardData);
    return response.data;
  },

  // Delete payment card
  deleteProviderCard: async (cardId: string) => {
    const response = await api.delete(`/providers/cards/${cardId}`);
    return response.data;
  },
  
  // Get approved service providers
  getApprovedProviders: async (filters: { eventType?: string; services?: string[]; location?: string } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.services && filters.services.length) queryParams.append('services', filters.services.join(','));
      if (filters.location) queryParams.append('location', filters.location);
      
      console.log(`Fetching providers with URL: ${API_URL}/providers/approved?${queryParams.toString()}`);
      
      const response = await api.get(`/providers/approved?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved providers:', error);
      // Properly type the error as AxiosError
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },
  
  // Get provider by ID 
  getProviderById: async (id: string): Promise<ServiceProvider> => {
    try {
      const response = await api.get(`/providers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },

  // Get provider gallery
  getProviderGallery: async (id: string): Promise<string[]> => {
    try {
      const response = await api.get(`/providers/${id}/gallery`);
      return response.data.images || [];
    } catch (error) {
      console.error('Error fetching provider gallery:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },
  
  getProviderPackages: async (providerId: string): Promise<Package[]> => {
    try {
      const response = await api.get(`/providers/${providerId}/packages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider packages:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },

  // Function to check provider availability for specific dates
  getProviderAvailability: async (providerId: string) => {
    try {
      // First, try to get any unavailable dates the provider has set
      const response = await api.get(`/providers/${providerId}/availability`);
      
      // If the endpoint doesn't exist yet, we'll handle the error gracefully
      // and implement a fallback by fetching their bookings
      return response.data.specialDates || [];
    } catch (error) {
      console.error("Error fetching provider availability:", error);
      
      // Fallback - fetch bookings to determine unavailable dates
      try {
        // This would be a public endpoint to get booked dates (without details)
        const bookingsResponse = await api.get(`/providers/${providerId}/booked-dates`);
        return bookingsResponse.data.bookedDates || [];
      } catch (fallbackError) {
        console.error("Error with fallback availability check:", fallbackError);
        return []; // Return empty array as default
      }
    }
  },
};

export default providerService;
