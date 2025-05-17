import axios from 'axios';

// API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_username: string;
  contact_role: string;
  contact_profile_image: string;
  contact_business_name?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  updated_at: string;
}

// Create an axios instance
const chatApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
chatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Chat service
const chatService = {
  // Get all conversations for the current user
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await chatApi.get('/chat/conversations');
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (contactId: string): Promise<ChatMessage[]> => {
    const response = await chatApi.get(`/chat/messages/${contactId}`);
    return response.data;
  },

  // Send a message to a user
  sendMessage: async (receiverId: string, content: string): Promise<ChatMessage> => {
    const response = await chatApi.post('/chat/messages', { receiver_id: receiverId, content });
    return response.data;
  }
};

export default chatService;