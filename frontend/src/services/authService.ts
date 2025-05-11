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

// Define the interface for service provider profile data
export interface ServiceProviderProfileData {
  providerName: string;
  nicNumber: string;
  nicFrontImage: File;
  nicBackImage: File;
  businessName: string;
  businessRegistrationNumber?: string;
  businessDescription?: string;
  username: string;
  email: string;
  phone: string;
  contactEmail: string;
  contactPhone: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  address: string;
  city: string;
  province: string;
  serviceLocations: string[];
  serviceTypes: string;
  coveredEventTypes: string[];
  profilePicture: File;
  coverPhoto?: File;
  slogan?: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountOwnerName: string;
  [key: string]: any; // To allow for any other fields
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

  // Register service provider profile with complete data
  registerServiceProviderProfile: async (profileData: ServiceProviderProfileData): Promise<void> => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(profileData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // For arrays like serviceLocations, coveredEventTypes
        value.forEach(item => formData.append(key, item));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    const response = await authApi.post('/providers/complete-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default authService;