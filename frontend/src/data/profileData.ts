export interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
    nic: string;
  }
  
  export interface Booking {
    id: string;
    providerName: string;
    services: string[];
    date: string;
    status: string;
    total: number;
  }
  
  export interface Favorite {
    id: string;
    name: string;
    type: string;
    rating: number;
    image: string;
  }
  
  export interface Review {
    id: string;
    providerName: string;
    rating: number;
    comment: string;
    date: string;
  }
  
  // Mock user data
  export const mockUserData: UserData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+94 77 123 4567",
    address: "123 Main St, Colombo, Sri Lanka",
    nic: "990123456V"
  };
  
  // Mock bookings data
  export const mockBookings: Booking[] = [
    {
      id: "b1",
      providerName: "Grand Hotel Colombo",
      services: ["Venue", "Catering"],
      date: "2025-05-15",
      status: "upcoming",
      total: 350000
    },
    {
      id: "b2",
      providerName: "Crystal Photography",
      services: ["Photography", "Videography"],
      date: "2025-04-20",
      status: "upcoming",
      total: 80000
    },
    {
      id: "b3",
      providerName: "Elegant Decorations",
      services: ["Decoration"],
      date: "2024-03-10",
      status: "completed",
      total: 45000
    },
    {
      id: "b4",
      providerName: "Elite Events Planning",
      services: ["Event Coordination", "Decoration", "Music & Entertainment"],
      date: "2025-09-18", 
      status: "upcoming",
      total: 120000
    }
  ];
  
  // Mock favorites
  export const mockFavorites: Favorite[] = [
    {
      id: "f1",
      name: "Grand Hotel Colombo",
      type: "Venue",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=500"
    },
    {
      id: "f2",
      name: "DJ Flash Entertainment",
      type: "Music & Entertainment",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500"
    },
    {
      id: "f3",
      name: "Crystal Photography",
      type: "Photography",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500"
    }
  ];
  
  // Mock reviews
  export const mockReviews: Review[] = [
    {
      id: "r1",
      providerName: "Grand Hotel Colombo",
      rating: 5,
      comment: "Excellent venue and service! The staff was very professional and accommodating.",
      date: "2024-03-15"
    },
    {
      id: "r2",
      providerName: "Crystal Photography",
      rating: 4,
      comment: "Great photography work, captured all our special moments beautifully.",
      date: "2024-02-20"
    }
  ];
