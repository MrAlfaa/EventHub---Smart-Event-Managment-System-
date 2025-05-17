import axios from 'axios';
import { ServiceProviderPackage } from '@/types';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const packageApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
packageApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Package service functions
const providerPackageService = {
  // Get all packages for the logged-in provider
  getPackages: async (): Promise<ServiceProviderPackage[]> => {
    const response = await packageApi.get('/providers/packages');
    return response.data;
  },

  // Get a specific package by ID
  getPackage: async (packageId: string): Promise<ServiceProviderPackage> => {
    const response = await packageApi.get(`/providers/packages/${packageId}`);
    return response.data;
  },

  // Create a new package
  createPackage: async (packageData: Omit<ServiceProviderPackage, 'id'>): Promise<ServiceProviderPackage> => {
    const response = await packageApi.post('/providers/packages', packageData);
    return response.data;
  },

  // Update an existing package
  updatePackage: async (packageId: string, packageData: Partial<ServiceProviderPackage>): Promise<ServiceProviderPackage> => {
    const response = await packageApi.put(`/providers/packages/${packageId}`, packageData);
    return response.data;
  },

  // Delete a package
  deletePackage: async (packageId: string): Promise<void> => {
    await packageApi.delete(`/providers/packages/${packageId}`);
  },

  // Upload package images
  uploadPackageImages: async (packageId: string, images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await packageApi.post(`/providers/packages/${packageId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrls;
  },
};

export default providerPackageService;