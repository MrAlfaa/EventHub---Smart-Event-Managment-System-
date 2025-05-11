import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Eye,
  Tag,
  User,
  CheckCircle,
  Calendar,
  XCircle,
  FileX,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Building,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ServiceProviderDetailsDialog, { ServiceProvider } from "./ServiceProviderDetailsDialog";
import adminService from "@/services/adminService";

const ServiceProviderApproval: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // New state variables for API data
  const [pendingProviders, setPendingProviders] = useState<ServiceProvider[]>([]);
  const [approvedProviders, setApprovedProviders] = useState<ServiceProvider[]>([]);
  const [rejectedProviders, setRejectedProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Existing state for confirmation dialogs and actions
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [providerToAction, setProviderToAction] = useState<ServiceProvider | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 5;

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    fetchServiceProviders();
  }, [activeTab]);

  // Function to fetch service providers based on active tab
  const fetchServiceProviders = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "pending") {
        const data = await adminService.getPendingServiceProviders();
        // Map API data to component's expected format
        const formattedData = data.map(mapApiDataToServiceProvider);
        setPendingProviders(formattedData);
      } else if (activeTab === "approved") {
        const data = await adminService.getApprovedServiceProviders();
        const formattedData = data.map(mapApiDataToServiceProvider);
        setApprovedProviders(formattedData);
      } else if (activeTab === "rejected") {
        const data = await adminService.getRejectedServiceProviders();
        const formattedData = data.map(mapApiDataToServiceProvider);
        setRejectedProviders(formattedData);
      }
    } catch (error) {
      console.error("Error fetching service providers:", error);
      toast.error("Failed to load service providers");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to map API data to the component's expected format
  const mapApiDataToServiceProvider = (apiData: any): ServiceProvider => {
    return {
      id: apiData.id,
      businessName: apiData.business_name,
      providerName: apiData.provider_name,
      email: apiData.contact_email,
      phone: apiData.contact_phone,
      serviceType: apiData.service_types,
      location: `${apiData.city}, ${apiData.province}`,
      registrationDate: new Date(apiData.created_at).toLocaleDateString(),
      status: apiData.approval_status,
      nicNumber: apiData.nic_number,
      nicFrontImage: apiData.nic_front_image_url,
      nicBackImage: apiData.nic_back_image_url,
      businessRegistrationNumber: apiData.business_registration_number,
      businessDescription: apiData.business_description,
      profilePicture: apiData.profile_picture_url,
      coverPhoto: apiData.cover_photo_url,
      userId: apiData.user_id,
      // Map other fields as needed
    };
  };

  // Handle provider selection for viewing details
  const handleViewProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsViewDialogOpen(true);
  };

  // Handle approval action
  const handleApproveProvider = async () => {
    if (!providerToAction) return;
    
    try {
      await adminService.approveServiceProvider(providerToAction.id);
      toast.success("Service provider approved successfully");
      setIsApproveDialogOpen(false);
      setProviderToAction(null);
      
      // Refresh the data
      fetchServiceProviders();
    } catch (error) {
      console.error("Error approving service provider:", error);
      toast.error("Failed to approve service provider");
    }
  };

  // Handle rejection action
  const handleRejectProvider = async () => {
    if (!providerToAction) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      await adminService.rejectServiceProvider(providerToAction.id, rejectionReason);
      toast.success("Service provider rejected successfully");
      setIsRejectDialogOpen(false);
      setProviderToAction(null);
      setRejectionReason("");
      
      // Refresh the data
      fetchServiceProviders();
    } catch (error) {
      console.error("Error rejecting service provider:", error);
      toast.error("Failed to reject service provider");
    }
  };

  // Open approval confirmation dialog
  const openApproveDialog = (provider: ServiceProvider) => {
    setProviderToAction(provider);
    setIsApproveDialogOpen(true);
  };

  // Open rejection dialog
  const openRejectDialog = (provider: ServiceProvider) => {
    setProviderToAction(provider);
    setIsRejectDialogOpen(true);
  };

  // Filter service providers based on search query and filters
  const getFilteredProviders = () => {
    let providers: ServiceProvider[] = [];
    
    if (activeTab === "pending") {
      providers = pendingProviders;
    } else if (activeTab === "approved") {
      providers = approvedProviders;
    } else if (activeTab === "rejected") {
      providers = rejectedProviders;
    }
    
    return providers.filter(provider => {
      const matchesSearch = searchQuery === "" || 
        provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        provider.providerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesServiceType = serviceTypeFilter === "all" || 
        provider.serviceType === serviceTypeFilter;
      
      const matchesLocation = locationFilter === "all" || 
        provider.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesServiceType && matchesLocation;
    });
  };

  // Get paginated providers
  const getPaginatedProviders = () => {
    const filteredProviders = getFilteredProviders();
    const indexOfLastProvider = currentPage * providersPerPage;
    const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
    return filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  };

  // Calculate total pages
  const totalPages = Math.ceil(getFilteredProviders().length / providersPerPage);

  // Pagination controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Service Provider Approvals</h2>
        
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "approved"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => {
              setActiveTab("approved");
              setCurrentPage(1);
            }}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "rejected"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => {
              setActiveTab("rejected");
              setCurrentPage(1);
            }}
          >
            Rejected
          </button>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by business or provider name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Add filters as needed */}
        </div>
        
        {/* Service provider list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : getPaginatedProviders().length === 0 ? (
          <div className="py-16 text-center">
            <FileX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No service providers found</h3>
            <p className="mt-2 text-gray-500">
              {activeTab === "pending"
                ? "There are no pending service provider applications."
                : activeTab === "approved"
                ? "There are no approved service providers."
                : "There are no rejected service providers."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {getPaginatedProviders().map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {provider.profilePicture ? (
                              <img
                                src={provider.profilePicture}
                                alt={provider.businessName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <Building className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{provider.businessName}</h3>
                            <p className="text-sm text-gray-500">{provider.providerName}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span>{provider.serviceType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{provider.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{provider.registrationDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center gap-2 justify-end border-t md:border-t-0 md:border-l border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProvider(provider)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {activeTab === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => openApproveDialog(provider)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => openRejectDialog(provider)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Service Provider Details Dialog */}
      <ServiceProviderDetailsDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        provider={selectedProvider}
        onApprove={openApproveDialog}
        onReject={openRejectDialog}
        showActions={activeTab === "pending"}
      />
      
      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Service Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this service provider? They will be able to 
              access the system and create packages once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{providerToAction?.businessName}</p>
            <p className="text-sm text-gray-500">{providerToAction?.providerName}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveProvider} className="bg-green-600 hover:bg-green-700">
              Approve Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Service Provider</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this service provider application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{providerToAction?.businessName}</p>
            <p className="text-sm text-gray-500 mb-4">{providerToAction?.providerName}</p>
            
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectProvider} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderApproval;
