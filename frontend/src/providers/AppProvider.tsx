import { EventFilter, ServiceProvider, User } from "@/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import useCartStore from '@/store/useCartStore';
import { useFilterStore } from '@/store/useFilterStore';
import { CartItem } from '@/store/useCartStore';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isServiceProvider: boolean;
  isAdmin: boolean;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (packageId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  filter: EventFilter;
  updateFilter: (filter: Partial<EventFilter>) => void;
  clearFilter: () => void;
  hasAppliedFilters: boolean;
  availableDates: string[];
  blockedDates: string[];
  updateAvailableDates: (dates: string[]) => void;
  updateBlockedDates: (dates: string[]) => void;
  autoAcceptBookings: boolean;
  toggleAutoAcceptBookings: () => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Get auth state from Zustand store
  const { user: storeUser, isAuthenticated: storeIsAuthenticated } = useAuthStore();
  const { items, addToCart, removeFromCart, clearCart, getTotal } = useCartStore();
  const filterStore = useFilterStore();
  
  // Existing state
  const [user, setUser] = useState<User | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([
    new Date(Date.now() + 3 * 86400000).toISOString(),
    new Date(Date.now() + 5 * 86400000).toISOString(),
    new Date(Date.now() + 7 * 86400000).toISOString(),
  ]);
  const [blockedDates, setBlockedDates] = useState<string[]>([
    new Date(Date.now() + 2 * 86400000).toISOString(),
    new Date(Date.now() + 4 * 86400000).toISOString(),
  ]);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState<boolean>(true);

  // Add this useEffect to check localStorage on initial load
  useEffect(() => {
    // Try to get authentication data from localStorage on initial load
    const storedToken = localStorage.getItem('eventHub_token');
    const storedUser = localStorage.getItem('eventHub_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        // If parsing fails, clear localStorage
        localStorage.removeItem('eventHub_token');
        localStorage.removeItem('eventHub_user');
      }
    }
  }, []);

  // Sync from Zustand store to AppProvider state
  useEffect(() => {
    if (storeUser) {
      setUser(storeUser);
    }
  }, [storeUser]);

  const isAuthenticated = storeIsAuthenticated || !!user;
  const isServiceProvider = isAuthenticated && (user?.role === 'service_provider' || storeUser?.role === 'service_provider');
  const isAdmin = isAuthenticated && (
    user?.role === 'admin' || 
    user?.role === 'super_admin' || 
    storeUser?.role === 'admin' || 
    storeUser?.role === 'super_admin'
  );

  // Implement the login method
  const login = (email: string, role: string) => {
    // Create a basic user object with the email and role
    const newUser = {
      id: `user-${Date.now()}`, // Generate a temporary ID
      name: email.split('@')[0], // Use part of the email as name for simplicity
      email,
      role: role as 'user' | 'service_provider' | 'admin',
      phone: '', // Empty default values for other required fields
      username: email.split('@')[0],
    };
    
    setUser(newUser);
  };

  // Implement the logout method
  const logout = () => {
    // Call the store's logout method instead of reimplementing
    useAuthStore.getState().logout();
    setUser(null);
  };

  const updateAvailableDates = (dates: string[]) => {
    setAvailableDates(dates);
  };

  const updateBlockedDates = (dates: string[]) => {
    setBlockedDates(dates);
  };

  const toggleAutoAcceptBookings = () => {
    setAutoAcceptBookings(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated,
        isServiceProvider,
        isAdmin,
        cart: items,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal: getTotal,
        filter: filterStore.filter,
        updateFilter: filterStore.updateFilter,
        clearFilter: filterStore.clearFilter,
        hasAppliedFilters: filterStore.hasAppliedFilters || false,  // Added fallback
        availableDates,
        blockedDates,
        updateAvailableDates,
        updateBlockedDates,
        autoAcceptBookings,
        toggleAutoAcceptBookings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
