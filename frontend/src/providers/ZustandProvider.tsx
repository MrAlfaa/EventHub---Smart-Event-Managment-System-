
import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore'; // Adjusted path
import { useCartStore } from '@/store/useCartStore'; // Corrected path
import { toast } from 'sonner';

interface ZustandProviderProps {
  children: ReactNode;
}

export const ZustandProvider = ({ children }: ZustandProviderProps) => {
  // Example of hydrating from localStorage on app initialization
  useEffect(() => {
    try {
      // Restore auth state
      const savedUser = localStorage.getItem('eventHub_user');
      if (savedUser) {
        useAuthStore.getState().setUser(JSON.parse(savedUser));
      }
      
      // Restore cart state
      const savedCart = localStorage.getItem('eventHub_cart');
      if (savedCart) {
        JSON.parse(savedCart).forEach((item: any) => {
          useCartStore.getState().addItem(item);
        });
      }
    } catch (error) {
      console.error('Failed to restore app state:', error);
      toast.error('There was an error restoring your session');
    }
  }, []);

  // Subscribe to state changes and persist to localStorage
  useEffect(() => {
    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user) {
        localStorage.setItem('eventHub_user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('eventHub_user');
      }
    });
    
    const unsubscribeCart = useCartStore.subscribe((state) => {
      localStorage.setItem('eventHub_cart', JSON.stringify(state.items));
    });
    
    return () => {
      unsubscribeAuth();
      unsubscribeCart();
    };
  }, []);

  return <>{children}</>;
};
