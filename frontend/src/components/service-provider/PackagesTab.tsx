import { ServiceProvider, Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Info, ShoppingCart, Tag } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PackageQuickView from "./PackageQuickView";
import SystemBookingForm from "@/components/booking/SystemBookingForm";

interface PackagesTabProps {
  provider: ServiceProvider;
}

// Mock package data with rich details and multiple images
const mockPackages: Package[] = [
  {
    id: "pkg-001",
    name: "Premium Wedding Package",
    description: "A complete wedding package including venue decoration, catering, photography, and music arrangements for your special day. Perfect for medium to large weddings with full-service support.",
    price: 550000,
    currency: "LKR",
    eventType: "Wedding",
    capacity: {
      min: 100,
      max: 300
    },
    services: [
      {
        serviceProviderId: "sp-001",
        serviceProviderName: "Elegant Decor",
        serviceType: "Decoration",
        description: "Complete venue decoration with floral arrangements",
        price: 150000
      },
      {
        serviceProviderId: "sp-002",
        serviceProviderName: "Delicious Catering",
        serviceType: "Catering",
        description: "Full buffet menu with 25 items including desserts",
        price: 200000
      },
      {
        serviceProviderId: "sp-003",
        serviceProviderName: "MemoryCraft Studios",
        serviceType: "Photography",
        description: "Full day photography and videography with drone",
        price: 120000
      },
      {
        serviceProviderId: "sp-004",
        serviceProviderName: "Rhythm Masters",
        serviceType: "Music",
        description: "DJ and live band for reception",
        price: 80000
      }
    ],
    thumbnailImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3",
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3"
    ],
    features: [
      "Complete venue decoration",
      "Full buffet catering (25 items)",
      "Photography and videography",
      "DJ and live music",
      "Wedding cake",
      "Bridal dressing",
      "Invitation cards"
    ]
  },
  {
    id: "pkg-002",
    name: "Corporate Conference Package",
    description: "Comprehensive conference package including venue setup, technical equipment, catering, and event management services ideal for corporate events and business conferences.",
    price: 375000,
    currency: "LKR",
    eventType: "Conference",
    capacity: {
      min: 50,
      max: 200
    },
    services: [
      {
        serviceProviderId: "sp-005",
        serviceProviderName: "TechSetup Pro",
        serviceType: "AV Equipment",
        description: "Audio-visual setup with projectors and sound system",
        price: 120000
      },
      {
        serviceProviderId: "sp-002",
        serviceProviderName: "Delicious Catering",
        serviceType: "Catering",
        description: "Breakfast, lunch, and refreshments throughout the day",
        price: 150000
      },
      {
        serviceProviderId: "sp-006",
        serviceProviderName: "EventMasters",
        serviceType: "Event Management",
        description: "Complete event coordination and management",
        price: 105000
      }
    ],
    thumbnailImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3",
    images: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3"
    ],
    features: [
      "Full venue setup with stage",
      "Professional AV equipment",
      "Breakfast and lunch buffet",
      "Coffee break refreshments",
      "Registration desk",
      "Name tags and lanyards",
      "Conference materials"
    ]
  },
  {
    id: "pkg-003",
    name: "Birthday Celebration Package",
    description: "Complete birthday package with decoration, entertainment, catering, and photography to make your birthday celebration memorable and hassle-free.",
    price: 175000,
    currency: "LKR",
    eventType: "Birthday",
    capacity: {
      min: 30,
      max: 80
    },
    services: [
      {
        serviceProviderId: "sp-007",
        serviceProviderName: "Party Poppers",
        serviceType: "Decoration",
        description: "Themed decoration with balloons and props",
        price: 45000
      },
      {
        serviceProviderId: "sp-008",
        serviceProviderName: "Fun Entertainment",
        serviceType: "Entertainment",
        description: "DJ, games, and MC for 4 hours",
        price: 35000
      },
      {
        serviceProviderId: "sp-009",
        serviceProviderName: "Sweet Delights",
        serviceType: "Catering",
        description: "Food, birthday cake, and beverages",
        price: 65000
      },
      {
        serviceProviderId: "sp-010",
        serviceProviderName: "Snap Memories",
        serviceType: "Photography",
        description: "Event photography with instant prints",
        price: 30000
      }
    ],
    thumbnailImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3",
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3"
    ],
    features: [
      "Themed decoration",
      "Entertainment with games",
      "Food and beverage service",
      "Custom birthday cake",
      "Photography with prints",
      "Party favors",
      "Invitation design"
    ]
  }
];

export const PackagesTab = ({ provider }: PackagesTabProps) => {
  const { addToCart } = useApp();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  
  // Use packages from provider or mock data if not available
  const [packages, setPackages] = useState<Package[]>([]);
  
  // Image carousel state for each package
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  
  // Set up packages from provider or mock data
  useEffect(() => {
    if (provider.packages && provider.packages.length > 0) {
      setPackages(provider.packages);
    } else {
      // Use mock data if no packages are available
      setPackages(mockPackages);
    }
  }, [provider]);

  const handleAddToCart = (pkg: Package) => {
    addToCart(pkg);
    toast.success(`${pkg.name} added to cart`);
  };

  const handleBookNow = (pkg: Package) => {
    // Store the selected package and open booking form directly
    setSelectedPackage(pkg);
    setBookingFormOpen(true);
  };

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setQuickViewOpen(true);
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };
  
  const nextImage = (packageId: string, images: string[], e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [packageId]: ((prev[packageId] || 0) + 1) % images.length
    }));
  };
  
  const prevImage = (packageId: string, images: string[], e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [packageId]: ((prev[packageId] || 0) - 1 + images.length) % images.length
    }));
  };

  return (
    <div className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Packages</h2>
          <p className="text-gray-600 text-sm mt-1">
            Choose from our curated packages designed for different occasions
          </p>
        </div>
        
        {packages.length > 0 && (
          <div className="mt-3 sm:mt-0">
            <Badge variant="outline" className="bg-blue-50">
              {packages.length} {packages.length === 1 ? 'Package' : 'Packages'} Available
            </Badge>
          </div>
        )}
      </div>

      {packages.length > 0 ? (
        <div className="flex flex-col gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden flex flex-col sm:flex-row w-full">
              {/* Image - Left side */}
              <div className="relative h-40 sm:h-auto sm:w-1/3 overflow-hidden">
                {pkg.images && pkg.images.length > 0 ? (
                  <img 
                    src={pkg.images[0]} 
                    alt={pkg.name}
                    className="h-full w-full object-cover"
                  />
                ) : pkg.thumbnailImage ? (
                  <img 
                    src={pkg.thumbnailImage} 
                    alt={pkg.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center">
                    <span className="text-blue-800 font-medium">{pkg.name}</span>
                  </div>
                )}
                
                {/* Event type badge */}
                <Badge className="absolute top-2 left-2 bg-white/80 text-blue-800">
                  {pkg.eventType}
                </Badge>
              </div>
              
              {/* Content - Right side */}
              <div className="flex flex-col sm:w-2/3">
                <CardContent className="p-4 flex-grow flex items-center">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <div className="mt-1 flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-sm text-blue-600">Suitable for: {pkg.eventType}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-lg text-blue-900">
                      {formatPrice(pkg.price, pkg.currency)}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 border-t">
                  <div className="flex flex-wrap gap-2 w-full justify-between sm:justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => handleViewDetails(pkg)}
                      className="sm:mr-auto"
                    >
                      View Details
                    </Button>
                    
                    <Button 
                      variant="secondary"
                      onClick={() => handleAddToCart(pkg)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    
                    <Button 
                      onClick={() => handleBookNow(pkg)}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Packages Available</h3>
          <p className="text-gray-500 mb-6">This service provider has not created any packages yet.</p>
          <p className="text-sm text-gray-600">
            Feel free to contact them to discuss custom services for your event.
          </p>
        </div>
      )}

      {/* Package Quick View Popup */}
      {selectedPackage && (
        <PackageQuickView
          package={selectedPackage}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          onAddToCart={handleAddToCart}
          onBookNow={handleBookNow}
        />
      )}
      
      {/* Direct Booking Form */}
      {selectedPackage && (
        <SystemBookingForm
          isOpen={bookingFormOpen}
          onClose={() => setBookingFormOpen(false)}
          selectedPackage={selectedPackage}
        />
      )}
    </div>
  );
};