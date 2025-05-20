// Add these interfaces to the frontend\src\types\index.ts file

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