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
  }
};

export default providerService;