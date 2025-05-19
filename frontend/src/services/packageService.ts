import axios from 'axios';
import { Package } from '@/types';

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

// Package service functions
const packageService = {
  // Get a specific package by ID
  getPackageById: async (packageId: string): Promise<Package> => {
    try {
      const response = await api.get(`/packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  },

  // Get all packages with filters
  getAllPackages: async (filters: { 
    eventType?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    crowdSize?: number;
    serviceType?: string;
    location?: string;
    displayMode?: 'individual' | 'grouped';
  }): Promise<Package[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      
      // Only add crowdSize if it's explicitly set and not a default value
      if (filters.crowdSize !== undefined && filters.crowdSize !== 1000) {
        queryParams.append('crowdSize', filters.crowdSize.toString());
      }
      
      if (filters.serviceType) queryParams.append('serviceType', filters.serviceType);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.displayMode) queryParams.append('displayMode', filters.displayMode);
      
      console.log(`Fetching packages with params: ${queryParams.toString()}`);
      
      const response = await api.get(`/packages/available?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }};

export default packageService;