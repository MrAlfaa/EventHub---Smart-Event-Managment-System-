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
  }
};

export default adminService;