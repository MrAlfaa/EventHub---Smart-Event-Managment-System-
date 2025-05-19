import axios from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const fileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
fileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define file type
export interface FileData {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// File service functions
const fileService = {
  // Upload a file
  uploadFile: async (file: File): Promise<FileData> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fileApi.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get user files with optional type filter
  getUserFiles: async (fileType?: string): Promise<FileData[]> => {
    const params = fileType && fileType !== 'all' ? { file_type: fileType } : {};
    const response = await fileApi.get('/files', { params });
    return response.data;
  },

  // Get download URL for a file
  getFileDownloadUrl: (fileId: string): string => {
    const token = localStorage.getItem('eventHub_token');
    return `${API_URL}/files/${fileId}/download${token ? `?token=${token}` : ''}`;
  },

  // Delete a file
  deleteFile: async (fileId: string): Promise<void> => {
    await fileApi.delete(`/files/${fileId}`);
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default fileService;
