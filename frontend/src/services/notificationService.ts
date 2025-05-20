import axios from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Notification {
  id: string;
  type: string;  // booking, payment, system, etc.
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
  time: string;  // Formatted time string
}

// Create an axios instance
const notificationApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
notificationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Notification service functions
const notificationService = {
  // Get user notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await notificationApi.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await notificationApi.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      await notificationApi.post('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};

export default notificationService;