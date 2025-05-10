import { EventFilter, ServiceProvider, User } from "@/types";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, role: string) => void;
  logout: () => void;  // Added logout function
  isAuthenticated: boolean;
  isServiceProvider: boolean;
  isAdmin: boolean;
  cart: ServiceProvider[];
  addToCart: (provider: ServiceProvider) => void;
  removeFromCart: (providerId: string) => void;
  filter: EventFilter;
  updateFilter: (filter: Partial<EventFilter>) => void;
  clearFilter: () => void;
  availableDates: string[];
  blockedDates: string[];
  updateAvailableDates: (dates: string[]) => void;
  updateBlockedDates: (dates: string[]) => void;
  autoAcceptBookings: boolean;
  toggleAutoAcceptBookings: () => void;
}

const defaultFilter: EventFilter = {
  services: [],
  budgetRange: { min: 0, max: 1000000 },
  crowdRange: { min: 0, max: 2000 },
  packageFilter: null,
  hotelType: undefined
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Get auth state from Zustand store
  const { user: storeUser, isAuthenticated: storeIsAuthenticated } = useAuthStore();
  
  // Existing state
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<ServiceProvider[]>([]);
  const [filter, setFilter] = useState<EventFilter>(defaultFilter);
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

  // Sync from Zustand store to AppProvider state
  useEffect(() => {
    if (storeUser) {
      setUser(storeUser);
    }
  }, [storeUser]);

  const isAuthenticated = storeIsAuthenticated || !!user;
  const isServiceProvider = isAuthenticated && (user?.role === 'service_provider' || storeUser?.role === 'service_provider');
  const isAdmin = isAuthenticated && (user?.role === 'admin' || storeUser?.role === 'admin');

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

  const addToCart = (provider: ServiceProvider) => {
    setCart((prev) => {
      if (prev.find(item => item.id === provider.id)) return prev;
      return [...prev, provider];
    });
  };

  const removeFromCart = (providerId: string) => {
    setCart((prev) => prev.filter(item => item.id !== providerId));
  };

  const updateFilter = (newFilter: Partial<EventFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const clearFilter = () => {
    setFilter(defaultFilter);
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
        cart,
        addToCart,
        removeFromCart,
        filter,
        updateFilter,
        clearFilter,
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
