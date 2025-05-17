import axios from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const providerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
providerApi.interceptors.request.use(
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

    const response = await providerApi.post('/providers/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrls;
  },

  // Get provider gallery images
  getGalleryImages: async (): Promise<string[]> => {
    const response = await providerApi.get('/providers/gallery');
    return response.data.images;
  },

  // Delete a gallery image
  deleteGalleryImage: async (imageUrl: string): Promise<void> => {
    // Using query parameter instead of request body for DELETE
    await providerApi.delete(`/providers/gallery/image?imageUrl=${encodeURIComponent(imageUrl)}`);
  },

  // Get provider profile
  getProviderProfile: async () => {
    const response = await providerApi.get('/providers/me');
    return response.data;
  },

  // Update provider profile
  updateProviderProfile: async (profileData: any) => {
    const response = await providerApi.put('/providers/me', profileData);
    return response.data;
  },

  // Get provider payment cards
  getProviderCards: async () => {
    const response = await providerApi.get('/providers/cards');
    return response.data;
  },

  // Add new payment card
  addProviderCard: async (cardData: any) => {
    const response = await providerApi.post('/providers/cards', cardData);
    return response.data;
  },

  // Update payment card
  updateProviderCard: async (cardId: string, cardData: any) => {
    const response = await providerApi.put(`/providers/cards/${cardId}`, cardData);
    return response.data;
  },

  // Delete payment card
  deleteProviderCard: async (cardId: string) => {
    const response = await providerApi.delete(`/providers/cards/${cardId}`);
    return response.data;
  },
  
  // Add this new function to fetch approved service providers
  getApprovedProviders: async (filters: { eventType?: string; services?: string[]; location?: string } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.services && filters.services.length) queryParams.append('services', filters.services.join(','));
      if (filters.location) queryParams.append('location', filters.location);
      
      console.log(`Fetching providers with URL: ${API_URL}/providers/approved?${queryParams.toString()}`);
      
      const response = await providerApi.get(`/providers/approved?${queryParams.toString()}`);
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
      const response = await providerApi.get(`/providers/${id}`);
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
      const response = await providerApi.get(`/providers/${id}/gallery`);
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
  
  // Add this function to the providerService object
  getProviderPackages: async (providerId: string) => {
    try {
      const response = await providerApi.get(`/providers/${providerId}/packages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider packages:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }
};
export default providerService;