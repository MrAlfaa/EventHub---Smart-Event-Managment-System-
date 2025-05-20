import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AdminServiceProviderView from "./AdminServiceProviderView";
import adminService from "@/services/adminService";
import { toast } from "sonner";
import { ServiceProvider } from "@/types";

// Define type for selected image
interface SelectedImage {
  url: string;
  title: string;
}

const AdminServiceProviders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 10;

  // Fetch service providers on component mount
  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        setIsLoading(true);
        const providersData = await adminService.getApprovedServiceProviders();
        
        // Transform the data to match our ServiceProvider type
        const formattedProviders = providersData.map(provider => ({
          id: provider.id,
          name: provider.provider_name || '',
          businessName: provider.business_name || '',
          email: provider.contact_email || '',
          username: '',
          contactNumber: provider.contact_phone || '',
          nicNumber: provider.nic_number || '',
          businessRegNumber: provider.business_registration_number || '',
          location: provider.city || '',
          serviceType: provider.service_types ? provider.service_types.split(',') : [],
          // Keep the original approval_status value for dialog component
          status: provider.approval_status || 'pending',
          profileImage: provider.profile_picture_url || '',
          coverPhoto: provider.cover_photo_url || '',
          nicFrontImage: provider.nic_front_image_url || '',
          nicBackImage: provider.nic_back_image_url || '',
          business_description: provider.business_description || '',
          serviceLocations: provider.service_locations || [],
          coveredEventTypes: provider.covered_event_types || [],
          slogan: provider.slogan || '',
          // Include financial information
          bankName: provider.bank_name || '',
          branchName: provider.branch_name || '',
          accountNumber: provider.account_number || '',
          accountOwnerName: provider.account_owner_name || '',
          // Registration date
          registrationDate: provider.created_at || new Date().toISOString(),
          // Adding event organizer contact info with defaults in case it's missing
          eventOrganizerContact: {
            name: provider.provider_name || '',
            email: provider.contact_email || '',
            phone: provider.contact_phone || ''
          }
        }));
        
        setServiceProviders(formattedProviders);
      } catch (error) {
        console.error("Error fetching service providers:", error);
        toast.error("Failed to load service providers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceProviders();
  }, []);

  // Filter providers based on search query
  const filteredProviders = serviceProviders.filter(provider => 
    provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading service providers...</span>
            </div>
          ) : (
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
                        <td className="p-4">{provider.name}</td>
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
                        {searchQuery ? "No service providers found matching your search." : "No service providers available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
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

      {/* Using AdminServiceProviderView wrapper */}
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
