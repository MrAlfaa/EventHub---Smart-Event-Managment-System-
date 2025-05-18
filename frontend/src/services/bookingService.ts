import axios from 'axios';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const bookingApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
bookingApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Booking service functions
const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: any) => {
    const response = await bookingApi.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings with real data
  getUserBookings: async () => {
    try {
      const response = await bookingApi.get('/bookings/user');
      
      // Add debug logging to see what's coming from the backend
      console.log("Raw booking data from API:", response.data);
      
      // Transform the response data to match the expected format
      const transformedBookings = response.data.map((booking: any) => ({
        id: booking.id,
        providerName: booking.providerName || "Unknown Provider", // Use the provider name directly
        businessName: booking.businessName || "Unknown Business",
        services: Array.isArray(booking.services) ? booking.services : [],
        date: new Date(booking.eventDate).toLocaleDateString() || "Unknown Date",
        // Map 'confirmed' or 'pending' to 'upcoming' for the cancel button to show
        status: booking.status === 'confirmed' || booking.status === 'pending' ? 'upcoming' : booking.status,
        total: booking.totalAmount || 0,
      }));
      
      console.log("Transformed bookings:", transformedBookings);
      return transformedBookings;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  },

  // Get a specific booking by ID
  getBooking: async (bookingId: string) => {
    const response = await bookingApi.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string) => {
    const response = await bookingApi.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Make additional payment on a booking (pay the remaining amount)
  makeAdditionalPayment: async (bookingId: string, paymentData: any) => {
    const response = await bookingApi.post(`/bookings/${bookingId}/payment`, paymentData);
    return response.data;
  }
};

export default bookingService;