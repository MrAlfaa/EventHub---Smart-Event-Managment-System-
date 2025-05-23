// User Types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  address?: string;  // Add the address property
  role: 'user' | 'service_provider' | 'admin' | 'super_admin';
}


export interface CartItem {
  id: string;
  providerId: string;
  packageId?: string;
  name: string;
  packageName: string;
  price: number;
  currency: string;
  description?: string;
  profileImage?: string;
  eventType?: string;
  capacity?: {
    min: number;
    max: number;
  };
  quantity: number;
  selectedDate?: string;
}

// Service Provider Types
export interface ServiceProvider {
  id: string;
  name: string;
  businessName: string;
  description?: string;
  slogan?: string;
  profileImage?: string;
  coverPhoto?: string;
  serviceType: string[];
  eventTypes?: string[];
  serviceLocations?: string[];
  location: string | {
    city: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  email: string;
  contactNumber: string;
  nicNumber?: string; // Make this optional with the ? operator
  businessRegNumber?: string;
  business_description?: string;
  status: string;
  nicFrontImage?: string;
  nicBackImage?: string;
  eventOrganizerContact?: {
    name: string;
    email: string;
    phone: string;
  };
  // Add financial information fields
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  accountOwnerName?: string;
  registrationDate?: string;
  // Other existing fields
  pricing?: {
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  rating?: number;
  reviewCount?: number;
  availableDates?: string[];
  bookedDates?: string[];
  capacity?: {
    min: number;
    max: number;
  };
  contact?: {
    email: string;
    phone: string;
    website?: string;
  };
  gallery?: {
    images: string[];
    videos?: string[];
  };
  isNewcomer?: boolean;
}
// Package Types
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  features: string[];
  crowdSizeMin: number;
  crowdSizeMax: number;
  eventTypes: string[];
  status: string;
  provider_id?: string;
  providerInfo?: {
    id: string;
    name: string;
    businessName?: string;
    profileImage?: string | null;
    serviceType?: string;
  };
  serviceType?: string;
  // New fields for combined packages
  combined?: boolean;
  packages?: Package[];
  serviceTypes?: string[];
}

// Event types and categories
export const ALL_EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Conference",
  "Festival",
  "Anniversary",
  "Graduation",
  "Engagement",
  "Exhibition",
  "Concert",
  "Religious",
  "Other"
] as const;

export type EventType = typeof ALL_EVENT_TYPES[number];

// Service Provider Package Type
export interface ServiceProviderPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  crowdSizeMin: number;
  crowdSizeMax: number;
  eventTypes: string[];
  images: string[];
  status: "active" | "inactive";
  bookings: number;
}

export interface PackageService {
  serviceProviderId: string;
  serviceProviderName: string;
  serviceType: string;
  description?: string;
  price: number;
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
  services: string[];
  eventType?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  crowdRange?: {
    min: number;
    max: number;
  };
  location?: string;
  packageFilter?: string | null;
  packageDisplayMode?: 'individual' | 'grouped';
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
  response?: string; // Add this field for service provider responses
  date: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
  status: 'active' | 'inactive';
}

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  location: {
    address: string;
    googleMapLink: string;
  };
  eventDate: string;
  createdAt: string;
}
// Add these interfaces to your existing types/index.ts file

export interface PromotionResponse {
  id: string;
  title: string;
  description: string;
  type: string;
  bannerImage?: string;
  status: string;
  publishedDate: string;
  validUntil?: string;
  promoCode?: string;
  terms?: string[];
}

export interface PublicEventResponse {
  id: string;
  title: string;
  description: string;
  type: string;
  bannerImage?: string;
  status: string;
  publishedDate: string;
  location?: string;
  eventDate?: string;
  eventType?: string; // For categorization
}