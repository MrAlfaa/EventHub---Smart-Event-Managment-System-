import axios from 'axios';

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

export interface CloudFile {
  id: string;
  url: string;
  public_id: string;
  folder: string;
  filename: string;
  size: number;
  format: string;
  created_at: string;
  width?: number;
  height?: number;
  resource_type: string;
}

export interface CloudFolder {
  name: string;
  fileCount?: number;
}

export interface CloudStats {
  total_files: number;
  total_size: number;
  total_size_readable: string;
  total_folders: number;
  format_distribution: Record<string, number>;
}

const cloudService = {
  // Upload files to cloud storage
  uploadFiles: async (files: File[], folder: string = 'default'): Promise<CloudFile[]> => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('folder', folder);
    
    try {
      const response = await api.post('/cloud/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.files;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },
  
  // Get all files with optional folder filter
  getFiles: async (folder?: string, limit: number = 50, skip: number = 0): Promise<{files: CloudFile[], total: number}> => {
    let url = `/cloud/files?limit=${limit}&skip=${skip}`;
    if (folder) {
      url += `&folder=${encodeURIComponent(folder)}`;
    }
    
    try {
      const response = await api.get(url);
      return {
        files: response.data.files,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },
  
  // Get all folders
  getFolders: async (): Promise<string[]> => {
    try {
      const response = await api.get('/cloud/folders');
      return response.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },
  
  // Delete a file
  deleteFile: async (fileId: string): Promise<void> => {
    try {
      await api.delete(`/cloud/files/${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Create a new folder
  createFolder: async (folderName: string): Promise<{folder: string}> => {
    const formData = new FormData();
    formData.append('folder_name', folderName);
    
    try {
      const response = await api.post('/cloud/create-folder', formData);
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },
  
  // Delete a folder
  deleteFolder: async (folderName: string, force: boolean = false): Promise<void> => {
    try {
      await api.delete(`/cloud/folders/${encodeURIComponent(folderName)}?force=${force}`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },
  
  // Get storage statistics
  getStats: async (): Promise<CloudStats> => {
    try {
      const response = await api.get('/cloud/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      throw error;
    }
  }
};

export default cloudService;