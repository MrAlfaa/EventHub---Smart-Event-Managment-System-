import { EventType, Package, ServiceProvider, ServiceType } from "@/types";

export const eventTypes: EventType[] = [
  { id: "1", name: "Wedding" },
  { id: "2", name: "Birthday Party" },
  { id: "3", name: "Corporate Event" },
  { id: "4", name: "Concert" },
  { id: "5", name: "Conference" },
  { id: "6", name: "Exhibition" },
  { id: "7", name: "Festival" },
  { id: "8", name: "Graduation" },
  { id: "9", name: "Anniversary" },
];

export const serviceTypes: ServiceType[] = [
  { id: "1", name: "Venue", category: "Location" },
  { id: "2", name: "Catering", category: "Food" },
  { id: "3", name: "Photography", category: "Media" },
  { id: "4", name: "Videography", category: "Media" },
  { id: "5", name: "Music Band", category: "Entertainment" },
  { id: "6", name: "DJ", category: "Entertainment" },
  { id: "7", name: "Decoration", category: "Design" },
  { id: "8", name: "Transportation", category: "Logistics" },
  { id: "9", name: "Event Coordinator", category: "Management" },
  { id: "10", name: "Security", category: "Management" },
];

export const serviceProviders: ServiceProvider[] = [
  {
    id: "1",
    name: "Grand Colombo Hotel",
    slogan: "Crafting Unforgettable Moments in Luxury",
    description: "Luxurious hotel with state-of-the-art facilities for all types of events",
    profileImage: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    services: ["Venue", "Catering"],
    eventTypes: ["Wedding", "Corporate Event", "Conference"],
    serviceLocations: ["Colombo", "Gampaha", "Kalutara", "Negombo"],
    location: {
      city: "Colombo",
      address: "123 Main Street, Colombo 4",
      coordinates: { lat: 6.9271, lng: 79.8612 },
    },
    pricing: {
      minPrice: 300000,
      maxPrice: 1000000,
      currency: "LKR",
    },
    rating: 4.7,
    reviewCount: 120,
    availableDates: [
      "2025-05-01",
      "2025-05-10",
      "2025-05-15",
      "2025-05-20",
      "2025-06-01",
    ],
    bookedDates: [
      "2025-04-15",
      "2025-04-20",
      "2025-04-25",
      "2025-05-05",
    ],
    capacity: {
      min: 50,
      max: 1000,
    },
    contact: {
      email: "bookings@grandcolombo.com",
      phone: "+94 11 234 5678",
      website: "www.grandcolombo.com",
    },
    gallery: {
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
      ],
      videos: ["/placeholder.svg"],
    },
    isNewcomer: false,
  },
  {
    id: "2",
    name: "Crystal Photography",
    slogan: "Every Moment Deserves to Be Remembered",
    description: "Capturing your special moments with professional photography services",
    profileImage: "/placeholder.svg",
    services: ["Photography"],
    eventTypes: ["Wedding", "Birthday Party", "Corporate Event", "Graduation"],
    serviceLocations: ["Colombo", "Gampaha", "Kandy", "Galle"],
    location: {
      city: "Colombo",
      address: "45 Camera Lane, Colombo 5",
    },
    pricing: {
      minPrice: 25000,
      maxPrice: 100000,
      currency: "LKR",
    },
    rating: 4.9,
    reviewCount: 85,
    availableDates: [
      "2025-04-15",
      "2025-04-20",
      "2025-04-25",
      "2025-05-01",
      "2025-05-05",
    ],
    bookedDates: [
      "2025-05-10",
      "2025-05-15",
    ],
    capacity: {
      min: 1,
      max: 500,
    },
    contact: {
      email: "info@crystalphotography.com",
      phone: "+94 77 123 4567",
      website: "www.crystalphotography.com",
    },
    gallery: {
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
      ],
    },
    isNewcomer: false,
  },
  {
    id: "3",
    name: "Melody Band",
    slogan: "Setting the Perfect Rhythm for Your Celebrations",
    description: "Live music band for all types of events with versatile performance styles",
    profileImage: "/placeholder.svg",
    services: ["Music Band"],
    eventTypes: ["Wedding", "Birthday Party", "Corporate Event", "Festival"],
    serviceLocations: ["Kandy", "Colombo", "Galle", "Matara"],
    location: {
      city: "Kandy",
      address: "78 Music Street, Kandy",
    },
    pricing: {
      minPrice: 50000,
      maxPrice: 150000,
      currency: "LKR",
    },
    rating: 4.5,
    reviewCount: 42,
    availableDates: [
      "2025-04-15",
      "2025-04-20",
      "2025-04-25",
      "2025-05-01",
      "2025-05-05",
    ],
    bookedDates: [
      "2025-05-10",
      "2025-05-15",
      "2025-05-20",
    ],
    capacity: {
      min: 50,
      max: 2000,
    },
    contact: {
      email: "bookings@melodyband.com",
      phone: "+94 81 234 5678",
    },
    gallery: {
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
      ],
      videos: ["/placeholder.svg"],
    },
    isNewcomer: false,
  },
  {
    id: "4",
    name: "Decor Dreams",
    slogan: "Transforming Spaces into Extraordinary Experiences",
    description: "Creative decoration services to transform your event space",
    profileImage: "/placeholder.svg",
    services: ["Decoration"],
    eventTypes: ["Wedding", "Birthday Party", "Corporate Event", "Anniversary"],
    serviceLocations: ["Colombo", "Gampaha", "Kalutara", "Negombo"],
    location: {
      city: "Colombo",
      address: "25 Design Avenue, Colombo 3",
    },
    pricing: {
      minPrice: 35000,
      maxPrice: 200000,
      currency: "LKR",
    },
    rating: 4.6,
    reviewCount: 38,
    availableDates: [
      "2025-04-15",
      "2025-04-20",
      "2025-04-25",
      "2025-05-01",
      "2025-05-05",
      "2025-05-10",
      "2025-05-15",
    ],
    bookedDates: [
      "2025-05-20",
    ],
    capacity: {
      min: 1,
      max: 1000,
    },
    contact: {
      email: "info@decordreams.com",
      phone: "+94 77 987 6543",
    },
    gallery: {
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
      ],
    },
    isNewcomer: true,
  },
  {
    id: "5",
    name: "Elite Events",
    slogan: "Flawless Execution, Memorable Celebrations",
    description: "Full-service event coordination and management",
    profileImage: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    services: ["Event Coordinator"],
    eventTypes: ["Wedding", "Corporate Event", "Conference", "Exhibition"],
    serviceLocations: ["Colombo", "Gampaha", "Kalutara", "Negombo"],
    location: {
      city: "Colombo",
      address: "56 Event Lane, Colombo 7",
    },
    pricing: {
      minPrice: 75000,
      maxPrice: 300000,
      currency: "LKR",
    },
    rating: 4.8,
    reviewCount: 65,
    availableDates: [
      "2025-04-20",
      "2025-04-25",
      "2025-05-01",
      "2025-05-05",
      "2025-05-10",
      "2025-05-15",
      "2025-05-20",
    ],
    bookedDates: [
      "2025-04-15",
    ],
    capacity: {
      min: 10,
      max: 1500,
    },
    contact: {
      email: "bookings@eliteevents.com",
      phone: "+94 11 345 6789",
      website: "www.eliteevents.com",
    },
    gallery: {
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
      ],
    },
    isNewcomer: false,
  },
];

export const packages: Package[] = [
  {
    id: "1",
    name: "Gold Wedding Package",
    description: "Complete wedding package including venue, catering, photography, and music",
    price: 850000,
    currency: "LKR",
    services: [
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Venue",
        description: "Full day venue rental with decoration",
        price: 500000,
      },
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Catering",
        description: "Premium buffet for 200 guests",
        price: 200000,
      },
      {
        serviceProviderId: "2",
        serviceProviderName: "Crystal Photography",
        serviceType: "Photography",
        description: "Full day coverage with 2 photographers",
        price: 75000,
      },
      {
        serviceProviderId: "3",
        serviceProviderName: "Melody Band",
        serviceType: "Music Band",
        description: "5-hour performance with DJ afterwards",
        price: 75000,
      },
    ],
    eventType: "Wedding",
    capacity: {
      min: 150,
      max: 250,
    },
    thumbnailImage: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Silver Wedding Package",
    description: "Essential wedding services at a moderate price",
    price: 600000,
    currency: "LKR",
    services: [
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Venue",
        description: "Half day venue rental",
        price: 300000,
      },
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Catering",
        description: "Standard buffet for 150 guests",
        price: 150000,
      },
      {
        serviceProviderId: "2",
        serviceProviderName: "Crystal Photography",
        serviceType: "Photography",
        description: "Full day coverage with 1 photographer",
        price: 50000,
      },
      {
        serviceProviderId: "4",
        serviceProviderName: "Decor Dreams",
        serviceType: "Decoration",
        description: "Basic decoration package",
        price: 100000,
      },
    ],
    eventType: "Wedding",
    capacity: {
      min: 100,
      max: 200,
    },
    thumbnailImage: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Corporate Conference Package",
    description: "Complete package for corporate conferences",
    price: 450000,
    currency: "LKR",
    services: [
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Venue",
        description: "Conference hall for full day",
        price: 250000,
      },
      {
        serviceProviderId: "1",
        serviceProviderName: "Grand Colombo Hotel",
        serviceType: "Catering",
        description: "Breakfast, lunch and tea breaks for 100 attendees",
        price: 150000,
      },
      {
        serviceProviderId: "5",
        serviceProviderName: "Elite Events",
        serviceType: "Event Coordinator",
        description: "Full event management",
        price: 50000,
      },
    ],
    eventType: "Conference",
    capacity: {
      min: 80,
      max: 120,
    },
    thumbnailImage: "/placeholder.svg",
  },
];

export const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle"
];

export const popularAreas: Record<string, string[]> = {
  "Colombo": [
    "Colombo 1 - Fort",
    "Colombo 2 - Slave Island",
    "Colombo 3 - Kollupitiya",
    "Colombo 4 - Bambalapitiya",
    "Colombo 5 - Havelock Town",
    "Colombo 6 - Wellawatta",
    "Colombo 7 - Cinnamon Gardens",
    "Colombo 8 - Borella",
    "Colombo 9 - Dematagoda",
    "Colombo 10 - Maradana",
    "Colombo 11 - Pettah",
    "Colombo 12 - Hulftsdorp",
    "Colombo 13 - Kotahena",
    "Colombo 14 - Grandpass",
    "Colombo 15 - Mattakkuliya"
  ],
  "Gampaha": [
    "Negombo",
    "Wattala",
    "Ja-Ela",
    "Kadawatha",
    "Kelaniya",
    "Gampaha Town",
    "Nittambuwa",
    "Minuwangoda",
    "Divulapitiya",
    "Mirigama"
  ],
  "Kandy": [
    "Kandy Town",
    "Peradeniya",
    "Katugastota",
    "Gampola",
    "Nawalapitiya",
    "Pilimatalawa",
    "Akurana",
    "Gelioya",
    "Kundasale",
    "Digana"
  ],
  "Galle": [
    "Galle Fort",
    "Galle Town",
    "Unawatuna",
    "Hikkaduwa",
    "Ambalangoda",
    "Bentota",
    "Ahangama",
    "Habaraduwa",
    "Koggala",
    "Karapitiya"
  ],
  "Jaffna": [
    "Jaffna Town",
    "Nallur",
    "Chavakachcheri",
    "Karainagar",
    "Manipay",
    "Point Pedro",
    "Tellippalai",
    "Kopay",
    "Kaithady",
    "Chunnakam"
  ]
};
