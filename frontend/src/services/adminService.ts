import axios from 'axios';
import { ServiceProvider } from '@/types';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface SuperAdminCreateData {
  name: string;
  email: string;
  username: string;
  password: string;
}

// Define the AdminStats interface to match the API response
export interface AdminStats {
  users_count: number;
  service_providers_count: number;
  pending_providers_count: number;
}

// Service Provider Profile from API
export interface ServiceProviderProfile {
  id: string;
  user_id: string;
  provider_name: string;
  business_name: string;
  nic_number: string;
  business_registration_number: string;
  business_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  province: string;
  service_locations: string[];
  service_types: string;
  covered_event_types: string[];
  profile_picture_url: string;
  cover_photo_url: string;
  nic_front_image_url: string;
  nic_back_image_url: string;
  slogan: string;
  bank_name: string;
  branch_name: string;
  account_number: string;
  account_owner_name: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRejectRequest {
  reason?: string;
}

// Define User interface for admin operations
export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  nic_number?: string;
  address?: string;
  role: string;
  profile_image?: string | null;
  nic_front_image?: string | null;
  nic_back_image?: string | null;
  created_at: string;
  updated_at: string;
}

// Define promotion interfaces to match API response
export interface Promotion {
  id: string;
  type: string;
  title: string;
  description: string;
  bannerImage?: string;
  validUntil?: string;
  publishedDate: string;
  status: string;
  promoCode?: string;
  terms?: string[];
  location?: string;
  eventDate?: string;
}

// Admin service functions
const adminService = {
  // Check if super admin exists
  checkSuperAdminExists: async (): Promise<boolean> => {
    try {
      const response = await adminApi.get('/admin/check-superadmin');
      return response.data.exists;
    } catch (error) {
      console.error('Error checking super admin existence:', error);
      return false; // Default to false on error
    }
  },

  // Create super admin
  createSuperAdmin: async (adminData: SuperAdminCreateData): Promise<void> => {
    const response = await adminApi.post('/admin/create-superadmin', adminData);
    return response.data;
  },

  // Get pending service providers
  getPendingServiceProviders: async (): Promise<ServiceProviderProfile[]> => {
    try {
      const response = await adminApi.get('/admin/service-providers/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending service providers:', error);
      // If it's a CORS error, log a more helpful message
      if (error.message === 'Network Error') {
        console.error('This may be a CORS issue. Check your backend CORS settings.');
      }
      throw error;
    }
  },

  // Get approved service providers
  getApprovedServiceProviders: async (): Promise<ServiceProviderProfile[]> => {
    try {
      const response = await adminApi.get('/admin/service-providers/approved');
      return response.data;
    } catch (error) {
      console.error('Error fetching approved service providers:', error);
      if (error instanceof Error && error.message === 'Network Error') {
        console.error('This may be a CORS issue. Check your backend CORS settings.');
      }
      throw error;
    }
  },

  // Get rejected service providers
  getRejectedServiceProviders: async (): Promise<ServiceProviderProfile[]> => {
    const response = await adminApi.get('/admin/service-providers/rejected');
    return response.data;
  },

  // Get all service providers
  getAllServiceProviders: async (): Promise<ServiceProviderProfile[]> => {
    try {
      // Get all service providers - approved and rejected
      const approved = await adminService.getApprovedServiceProviders();
      const rejected = await adminService.getRejectedServiceProviders();
      
      // Combine both lists
      return [...approved, ...rejected];
    } catch (error: unknown) {
      console.error('Error fetching all service providers:', error);
      if (error instanceof Error && error.message === 'Network Error') {
        console.error('This may be a CORS issue. Check your backend CORS settings.');
      }
      throw error;
    }
  },

  // Approve a service provider
  approveServiceProvider: async (id: string): Promise<{message: string, email_sent: boolean}> => {
    const response = await adminApi.post(`/admin/service-providers/${id}/approve`);
    return response.data;
  },

  // Reject a service provider
  rejectServiceProvider: async (id: string, reason: string): Promise<{message: string, email_sent: boolean}> => {
    const response = await adminApi.post(`/admin/service-providers/${id}/reject`, {
      reason
    });
    return response.data;
  },

  // Get all regular users
  getAllUsers: async (): Promise<AdminUserData[]> => {
    try {
      const response = await adminApi.get('/admin/users');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.message === 'Network Error') {
        console.error('This may be a CORS issue. Check your backend CORS settings.');
      }
      throw error;
    }
  },

  // Get admin dashboard stats
  getAdminStats: async (): Promise<AdminStats> => {
    try {
      const response = await adminApi.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      if (error.message === 'Network Error') {
        console.error('This may be a CORS issue. Check your backend CORS settings.');
      }
      throw error;
    }
  },

  // Promotion management functions
  
  // Get all promotions
  getAllPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await adminApi.get('/admin/promotions');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  // Create a new promotion
  createPromotion: async (formData: FormData): Promise<Promotion> => {
    try {
      const response = await adminApi.post('/admin/promotions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  // Update an existing promotion
  updatePromotion: async (id: string, formData: FormData): Promise<Promotion> => {
    try {
      const response = await adminApi.put(`/admin/promotions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  // Delete a promotion
  deletePromotion: async (id: string): Promise<void> => {
    try {
      await adminApi.delete(`/admin/promotions/${id}`);
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  // Publish a promotion
  publishPromotion: async (id: string): Promise<void> => {
    try {
      await adminApi.post(`/admin/promotions/${id}/publish`);
    } catch (error: any) {
      console.error('Error publishing promotion:', error);
      throw error;
    }
  },
};

export default adminService;