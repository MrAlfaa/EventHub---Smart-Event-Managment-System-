
import { create } from 'zustand';
import { ServiceProvider } from '@/types';
import { toast } from 'sonner';

interface CartState {
  items: ServiceProvider[];
  addItem: (provider: ServiceProvider) => void;
  removeItem: (providerId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  
  addItem: (provider) => set((state) => {
    // Check if provider already exists in cart
    if (state.items.some(item => item.id === provider.id)) {
      toast.info("This service provider is already in your cart");
      return state;
    }
    
    toast.success("Added to cart successfully");
    return { items: [...state.items, provider] };
  }),
  
  removeItem: (providerId) => set((state) => ({
    items: state.items.filter(item => item.id !== providerId)
  })),
  
  clearCart: () => set({ items: [] })
}));
