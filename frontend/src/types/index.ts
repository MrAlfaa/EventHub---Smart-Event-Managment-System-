// User Types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: 'user' | 'service_provider' | 'admin' | 'super_admin';
}
import { ReactNode } from "react";

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
  location: string;
  email: string;
  contactNumber: string;
  nicNumber: string;
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
