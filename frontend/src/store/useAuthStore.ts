  import { create } from 'zustand';
  import { User } from '@/types';
  import userService from '../services/userService';
  import authService, { LoginCredentials, RegisterUserData, RegisterServiceProviderData } from '@/services/authService';

  interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    error: string | null;
    register: (userData: RegisterUserData) => Promise<void>;
    login: (credentials: LoginCredentials) => Promise<{user: User}>;
    logout: () => void;
    setUser: (user: User | null) => void;
    registerServiceProvider: (providerData: RegisterServiceProviderData) => Promise<void>;
  }

  // Add this interface for login response
  interface LoginResponse {
    user: User;
    token: string;
  }

  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAdmin: false,
    error: null,
  
    register: async (userData: RegisterUserData) => {
      set({ isLoading: true, error: null });
      try {
        await authService.register(userData);
        set({ isLoading: false });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Registration failed' 
        });
        throw error;
      }
    },
  
    login: async (credentials: { email: string; password: string }) => {
      try {
        // Call auth service login which returns both user and token
        const response = await authService.login(credentials);
        
        // Store user in the state
        set({ 
          user: response.user, 
          isAuthenticated: true 
        });
        
        // Return both user and token
        return response;
      } catch (error) {
        throw error;
      }
    },
  
    logout: () => {
      authService.logout();
      localStorage.removeItem('eventHub_token');
      localStorage.removeItem('eventHub_user');
      set({ user: null, isAuthenticated: false, isAdmin: false });
    },
  
    setUser: (user) => {
      if (user) {
        // Save user to localStorage for persistence
        localStorage.setItem('eventHub_user', JSON.stringify(user));
        set({ 
          user, 
          isAuthenticated: true,
          isAdmin: user.role === 'admin' || user.role === 'super_admin'
        });
      } else {
        set({ user: null, isAuthenticated: false, isAdmin: false });
      }
    },
  
    registerServiceProvider: async (providerData: RegisterServiceProviderData) => {
      set({ isLoading: true, error: null });
      try {
        await authService.registerServiceProvider(providerData);
        set({ isLoading: false });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Service provider registration failed' 
        });
        throw error;
      }
    },
    refreshSession: async () => {
      try {
        const userData = await userService.getCurrentUser();
        if (userData) {
          localStorage.setItem('eventHub_user', JSON.stringify(userData));
          set({ 
            user: userData, 
            isAuthenticated: true,
            isAdmin: userData.role === 'admin' || userData.role === 'super_admin'
          });
          return true;
        }
        return false;
      } catch (error) {
        localStorage.removeItem('eventHub_token');
        localStorage.removeItem('eventHub_user');
        set({ user: null, isAuthenticated: false, isAdmin: false });
        return false;
      }
    }
  }));
