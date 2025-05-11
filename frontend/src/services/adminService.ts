import axios from 'axios';

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

// Add these new types
export interface ServiceProviderProfile {
  id: string;
  business_name: string;
  provider_name: string;
  email: string;
  user_id: string;
  contact_email: string;
  contact_phone: string;
  nic_number: string;
  business_registration_number: string;
  city: string;
  province: string;
  service_types: string;
  approval_status: string;
  created_at: string;
  // Add other properties as needed
}

export interface ApprovalRejectRequest {
  reason?: string;
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
    const response = await adminApi.get('/admin/service-providers/approved');
    return response.data;
  },

  // Get rejected service providers
  getRejectedServiceProviders: async (): Promise<ServiceProviderProfile[]> => {
    const response = await adminApi.get('/admin/service-providers/rejected');
    return response.data;
  },

  // Approve a service provider
  approveServiceProvider: async (id: string): Promise<void> => {
    const response = await adminApi.post(`/admin/service-providers/${id}/approve`);
    return response.data;
  },

  // Reject a service provider
  rejectServiceProvider: async (id: string, reason: string): Promise<void> => {
    const response = await adminApi.post(`/admin/service-providers/${id}/reject`, {
      reason
    });
    return response.data;
  }
};

export default adminService;