  import { create } from 'zustand';
  import { User } from '@/types';
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
  
    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.login(credentials);
        set({ 
          user: response.user,
          isAuthenticated: true,
          isAdmin: response.user.role === 'admin',
          isLoading: false 
        });
        return { user: response.user };
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Login failed' 
        });
        throw error;
      }
    },
  
    logout: () => {
      authService.logout();
      set({ user: null, isAuthenticated: false, isAdmin: false });
    },
  
    setUser: (user) => {
      set({ 
        user, 
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      });
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
    }
  }));
