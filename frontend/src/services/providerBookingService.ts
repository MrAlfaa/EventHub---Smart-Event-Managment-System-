import axios from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interface for raw booking data from the API
interface RawBookingData {
  id: string;
  fullName?: string;
  customerName?: string;
  packageName?: string;
  createdAt?: string;
  eventDate?: string;
  paymentAmount?: number;
  totalAmount?: number;
  status?: string;
  nic?: string;
  phone?: string;
  customerPhone?: string;
  email?: string;
  customerEmail?: string;
  eventType?: string;
  crowdSize?: number;
  eventLocation?: string;
  mapLink?: string;
  address?: string;
  eventCoordinatorName?: string;
  coordinatorName?: string;
  eventCoordinatorContact?: string;
  coordinatorContact?: string;
  specialRequirements?: string;
  additionalNotes?: string;
  userId?: string;
  providerId?: string;
  [key: string]: any; // For any other properties we might receive
}

// Create an axios instance
const providerBookingApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
providerBookingApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request to:", `${config.baseURL}${config.url}`, "with method:", config.method);
    return config;
  },
  (error) => Promise.reject(error)
);

// Provider booking service functions
const providerBookingService = {
  // Get provider's bookings
  getProviderBookings: async () => {
    try {
      console.log("Fetching provider bookings from:", `${API_URL}/provider/bookings`);
      
      // Try with axios first
      try {
        const response = await providerBookingApi.get('/provider/bookings');
        console.log("Raw provider booking data:", response.data);
        const data = response.data;
        
        // Return empty array if no data
        if (!data || !Array.isArray(data)) {
          console.log("No booking data found or invalid format");
          return [];
        }
        
        // Transform the response data with proper typing
        const transformedBookings = data.map((booking: RawBookingData) => ({
          bookingId: booking.id,
          customerName: booking.fullName || booking.customerName || "Unknown Customer",
          packageName: booking.packageName || "Custom Package",
          // Use eventDate if available, otherwise use createdAt, and ensure it's a real Date
          bookingDate: new Date(booking.eventDate || booking.createdAt || new Date()),
          advanceAmount: booking.paymentAmount || 0,
          fullAmount: booking.totalAmount || 0,
          status: booking.status || "pending",
          fullDetails: {
            nameWithInitial: booking.fullName || booking.customerName || "Unknown Customer",
            nicNumber: booking.nic || "N/A",
            phoneNumber: booking.phone || booking.customerPhone || "N/A",
            email: booking.email || booking.customerEmail || "N/A",
            eventType: booking.eventType || "Event",
            crowdSize: booking.crowdSize || 0,
            eventLocation: {
              name: booking.eventLocation || "Unknown Location",
              mapLink: booking.mapLink || null
            },
            address: booking.address || "N/A",
            eventCoordinatorName: booking.eventCoordinatorName || booking.coordinatorName || null,
            eventCoordinatorNumber: booking.eventCoordinatorContact || booking.coordinatorContact || null,
            additionalNotes: booking.specialRequirements || booking.additionalNotes || null
          }
        }));
        
        console.log("Transformed provider bookings:", transformedBookings);
        return transformedBookings;
      } catch (axiosError) {
        // If axios fails, try fetch as backup
        console.warn("Axios request failed, trying fetch API as fallback");
        
        const token = localStorage.getItem('eventHub_token');
        const response = await fetch(`${API_URL}/provider/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Raw provider booking data from fetch:", data);
        
        // Transform the response data with proper typing
        const transformedBookings = data.map((booking: RawBookingData) => ({
          bookingId: booking.id,
          customerName: booking.fullName || booking.customerName || "Unknown Customer",
          packageName: booking.packageName || "Custom Package",
          // Make sure we're using eventDate for the calendar, not createdAt
          bookingDate: new Date(booking.eventDate || booking.createdAt || new Date()),
          advanceAmount: booking.paymentAmount || 0,
          fullAmount: booking.totalAmount || 0,
          status: booking.status || "pending",
          fullDetails: {
            nameWithInitial: booking.fullName || booking.customerName || "Unknown Customer",
            nicNumber: booking.nic || "N/A",
            phoneNumber: booking.phone || booking.customerPhone || "N/A",
            email: booking.email || booking.customerEmail || "N/A",
            eventType: booking.eventType || "Event",
            crowdSize: booking.crowdSize || 0,
            eventLocation: {
              name: booking.eventLocation || "Unknown Location",
              mapLink: booking.mapLink || null
            },
            address: booking.address || "N/A",
            eventCoordinatorName: booking.eventCoordinatorName || booking.coordinatorName || null,
            eventCoordinatorNumber: booking.eventCoordinatorContact || booking.coordinatorContact || null,
            additionalNotes: booking.specialRequirements || booking.additionalNotes || null
          }
        }));
        
        console.log("Transformed provider bookings from fetch:", transformedBookings);
        return transformedBookings;
      }
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      
      // Return empty array as fallback
      console.log("Returning empty array as fallback");
      return [];
    }
  },
  
  // Cancel a booking
  cancelProviderBooking: async (bookingId: string) => {
    try {
      const response = await providerBookingApi.post(`/provider/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  },
  
  // Mark a booking as fully paid
  markBookingAsPaid: async (bookingId: string) => {
    try {
      const response = await providerBookingApi.post(`/provider/bookings/${bookingId}/mark-paid`);
      return response.data;
    } catch (error) {
      console.error("Error marking booking as paid:", error);
      throw error;
    }
  }
};

export default providerBookingService;