import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ServiceProvider } from "./ServiceProviderDetailsDialog";
import AdminServiceProviderView from "./AdminServiceProviderView";

// Define type for selected image
interface SelectedImage {
  url: string;
  title: string;
}

// Mock service provider data (filtered to only show active/approved providers)
const mockServiceProviders: ServiceProvider[] = [
  {
    id: "2001",
    businessName: "Elegant Events",
    ownerName: "Priya Sharma",
    email: "priya@elegantevents.com",
    username: "priyasharma",
    contactNumber: "+94 71 234 5678",
    nicNumber: "912345678V",
    businessRegNumber: "REG78901234",
    location: "Colombo",
    serviceType: ["Hotel", "Catering"],
    status: "Active",
    profileImage: "https://i.pravatar.cc/300?img=28",
    coverPhoto: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Anna De Silva",
      email: "anna@elegantevents.com",
      phone: "+94 71 987 6543"
    },
    // Additional fields
    serviceLocations: ["Colombo", "Negombo", "Kandy"],
    coveredEventTypes: ["Wedding", "Corporate Event", "Birthday Party"],
    slogan: "Making your special day truly elegant",
    businessDescription: "Elegant Events specializes in luxury event hosting with premium catering and accommodation services for all types of events and celebrations."
  },
  {
    id: "2005",
    businessName: "Luxe Weddings",
    ownerName: "Ranjith Perera",
    email: "ranjith@luxeweddings.com",
    username: "ranjithperera",
    contactNumber: "+94 77 345 6789",
    nicNumber: "895678123V",
    businessRegNumber: "REG45678912",
    location: "Colombo",
    serviceType: ["Wedding Planning", "Decoration"],
    status: "Active",
    profileImage: "https://i.pravatar.cc/300?img=33",
    coverPhoto: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Kumari Fernando",
      email: "kumari@luxeweddings.com",
      phone: "+94 76 234 5678"
    },
    // Additional fields
    serviceLocations: ["Colombo", "Galle", "Matara"],
    coveredEventTypes: ["Wedding", "Engagement", "Anniversary"],
    slogan: "Your dream wedding, our expertise",
    businessDescription: "Luxe Weddings offers premium wedding planning services including venue decoration, catering coordination, and complete event management for your special day."
  },
  {
    id: "2006",
    businessName: "Carnival Entertainment",
    ownerName: "Malik Jayawardena",
    email: "malik@carnival.com",
    username: "malikjaya",
    contactNumber: "+94 75 234 5643",
    nicNumber: "923456789V",
    businessRegNumber: "",
    location: "Negombo",
    serviceType: ["Entertainment", "DJ"],
    status: "Active",
    profileImage: "https://i.pravatar.cc/300?img=12",
    coverPhoto: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: null,
    eventOrganizerContact: {
      name: "Saman Perera",
      email: "saman@carnival.com",
      phone: "+94 71 456 7890"
    },
    // Additional fields
    serviceLocations: ["Negombo", "Colombo", "Chilaw"],
    coveredEventTypes: ["Wedding", "Corporate Event", "Concert", "DJ Night"],
    slogan: "Creating unforgettable entertainment experiences",
    businessDescription: "Carnival Entertainment provides DJ services, live bands, and interactive entertainment options for all types of events with state-of-the-art sound and lighting equipment."
  },
  {
    id: "2007",
    businessName: "Coastal Venues",
    ownerName: "Tharushi Silva",
    email: "tharushi@coastalvenues.com",
    username: "tharushisilva",
    contactNumber: "+94 75 567 8901",
    nicNumber: "967890123V",
    businessRegNumber: "REG34567890",
    location: "Galle",
    serviceType: ["Venue", "Hotel"],
    status: "Active",
    profileImage: "https://i.pravatar.cc/300?img=25",
    coverPhoto: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Nimal Fernando",
      email: "nimal@coastalvenues.com",
      phone: "+94 77 890 1234"
    },
    // Additional fields
    serviceLocations: ["Galle", "Matara", "Hambantota"],
    coveredEventTypes: ["Wedding", "Corporate Retreat", "Beach Party"],
    slogan: "Experience luxury by the ocean",
    businessDescription: "Coastal Venues offers beachfront properties and hotels perfect for weddings, corporate events, and private celebrations with stunning ocean views and full-service accommodations."
  },
  {
    id: "2008",
    businessName: "Mountain Retreat",
    ownerName: "Kasun Bandara",
    email: "kasun@mountainretreat.com",
    username: "kasunbandara",
    contactNumber: "+94 76 678 9012",
    nicNumber: "945678123V",
    businessRegNumber: "REG23456789",
    location: "Nuwara Eliya",
    serviceType: ["Venue", "Accommodation"],
    status: "Active",
    profileImage: "https://i.pravatar.cc/300?img=15",
    coverPhoto: "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Chamara Rathnayake",
      email: "chamara@mountainretreat.com",
      phone: "+94 71 789 0123"
    },
    // Additional fields
    serviceLocations: ["Nuwara Eliya", "Kandy", "Hatton"],
    coveredEventTypes: ["Wedding", "Corporate Retreat", "Honeymoon", "Family Gathering"],
    slogan: "Elevate your event in the highlands",
    businessDescription: "Mountain Retreat provides serene event venues and accommodations in the cool climate of Nuwara Eliya with panoramic mountain views, perfect for intimate weddings and corporate retreats."
  }
];

const AdminServiceProviders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 10;

  // Filter providers based on search query
  const filteredProviders = mockServiceProviders.filter(provider => 
    provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    provider.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.serviceType.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);

  const handleViewProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsViewDialogOpen(true);
  };

  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setIsImageModalOpen(true);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Active Service Providers</h1>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search service providers..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Business Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Owner</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Services</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Location</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentProviders.length > 0 ? (
                  currentProviders.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">#{provider.id}</td>
                      <td className="p-4">{provider.businessName}</td>
                      <td className="p-4">{provider.ownerName}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.serviceType.map((service) => (
                            <Badge key={service} variant="outline" className="bg-blue-50 text-blue-800">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">{provider.location}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewProvider(provider)}
                            className="flex items-center gap-1"
                          >
                            <User size={14} />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No service providers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredProviders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{indexOfFirstProvider + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastProvider, filteredProviders.length)}
                </span>{" "}
                of <span className="font-medium">{filteredProviders.length}</span> service providers
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Using AdminServiceProviderView wrapper instead of ServiceProviderDetailsDialog directly */}
      <AdminServiceProviderView 
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        provider={selectedProvider}
      />

      {/* Image Modal for Enlarged View */}
      {selectedImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedImage.title}</DialogTitle>
              <DialogDescription>View full resolution document</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminServiceProviders;
