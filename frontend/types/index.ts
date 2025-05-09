// User Types
export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    profileImage?: string;
    role: 'user' | 'service_provider' | 'admin';
  }
  
  // Service Provider Types
  export interface ServiceProvider {
    id: string;
    name: string;
    description: string;
    profileImage: string;
    coverImage?: string;
    services: string[];
    eventTypes: string[];
    location: {
      city: string;
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    pricing: {
      minPrice: number;
      maxPrice: number;
      currency: string;
    };
    rating: number;
    reviewCount: number;
    availableDates: string[];
    bookedDates: string[];
    capacity: {
      min: number;
      max: number;
    };
    contact: {
      email: string;
      phone: string;
      website?: string;
    };
    gallery: {
      images: string[];
      videos?: string[];
    };
    isNewcomer: boolean;
    packages?: Package[];
  }
  
  // Package Types
  export interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    services: PackageService[];
    eventType: string;
    capacity: {
      min: number;
      max: number;
    };
    thumbnailImage?: string;
  }
  
  export interface PackageService {
    serviceProviderId: string;
    serviceProviderName: string;
    serviceType: string;
    description?: string;
    price: number;
  }
  
  // Event Types
  export interface EventType {
    id: string;
    name: string;
    icon?: string;
  }
  
  // Service Types
  export interface ServiceType {
    id: string;
    name: string;
    icon?: string;
    category?: string;
  }
  
  // Filter Types
  export interface EventFilter {
    eventType?: string;
    services: string[];
    date?: Date;
    location?: string;
    budgetRange: {
      min: number;
      max: number;
    };
    crowdRange: {
      min: number;
      max: number;
    };
    packageFilter: "package" | "non-package" | null;
    hotelType?: string;
  }
  
  // Booking Types
  export interface Booking {
    id: string;
    userId: string;
    serviceProviderId?: string;
    packageId?: string;
    fullName: string;
    address: string;
    contactNumbers: string[];
    email: string;
    eventLocation: string;
    eventCoordinatorName?: string;
    eventCoordinatorContact?: string;
    eventDate: string;
    crowdSize: number;
    eventType: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
  }
  
  // Review Types
  export interface Review {
    id: string;
    userId: string;
    serviceProviderId: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    date: string;
  }
  