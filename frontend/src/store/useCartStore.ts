  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  export interface CartItem {
    id: string;
    providerId: string;
    packageId: string;
    name: string;
    packageName: string;
    price: number;
    currency: string;
    eventType: string;
    description: string;
    profileImage: string;
    capacity: {
      min: number;
      max: number;
    };
  }

  interface CartStore {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (packageId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
  }

  const useCartStore = create<CartStore>()(
    persist(
      (set, get) => ({
        items: [],
      
        addToCart: (item: CartItem) => {
          const currentItems = get().items;
          // Check if item already exists in cart
          const exists = currentItems.some(cartItem => cartItem.packageId === item.packageId);
        
          if (!exists) {
            set({ items: [...currentItems, item] });
          }
        },
      
        removeFromCart: (packageId: string) => {
          set({ items: get().items.filter(item => item.packageId !== packageId) });
        },
      
        clearCart: () => set({ items: [] }),
      
        getTotal: () => {
          return get().items.reduce((total, item) => total + item.price, 0);
        }
      }),
      {
        name: 'eventhub-cart',
      }
    )
  );

  export default useCartStore;
