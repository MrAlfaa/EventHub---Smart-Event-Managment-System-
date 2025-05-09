
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isServiceProvider: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isServiceProvider: false,
  isAdmin: false,
  
  setUser: (user) => set(() => ({
    user,
    isAuthenticated: !!user,
    isServiceProvider: !!user && user.role === 'service_provider',
    isAdmin: !!user && user.role === 'admin',
  })),
  
  login: (user) => {
    set(() => ({
      user,
      isAuthenticated: true,
      isServiceProvider: user.role === 'service_provider',
      isAdmin: user.role === 'admin',
    }));
    
    // Save user to localStorage for persistence
    localStorage.setItem('eventHub_user', JSON.stringify(user));
  },
  
  logout: () => {
    set(() => ({
      user: null,
      isAuthenticated: false,
      isServiceProvider: false,
      isAdmin: false,
    }));
    
    // Remove user from localStorage
    localStorage.removeItem('eventHub_user');
  }
}));
