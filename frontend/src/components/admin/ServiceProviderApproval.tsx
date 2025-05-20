import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building,
  User,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ServiceProviderDetailsDialog from "./ServiceProviderDetailsDialog";
import adminService from "@/services/adminService";
import { formatDistanceToNow } from "date-fns";

// Interfaces
interface ServiceProvider {
  id: string;
  businessName: string;
  providerName: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  registrationDate: string;
  status: string;
  nicNumber: string;
  nicFrontImage: string;
  nicBackImage: string;
  businessRegistrationNumber?: string;
  businessDescription?: string;
  profilePicture?: string;
  coverPhoto?: string;
  userId: string;
}

// Main component
const ServiceProviderApproval: React.FC = () => {
  // State
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortField, setSortField] = useState<string>("registrationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch service providers
  const fetchServiceProviders = async () => {
    try {
      setIsLoading(true);
      
      // Get pending providers from your API
      const pendingProviders = await adminService.getPendingServiceProviders();
      // Get approved and rejected providers
      const approvedProviders = await adminService.getApprovedServiceProviders();
      const rejectedProviders = await adminService.getRejectedServiceProviders();
      
      // Transform all data to match ServiceProvider interface
      const formattedProviders = [...pendingProviders, ...approvedProviders, ...rejectedProviders].map(provider => ({
        id: provider.id || provider.user_id || '',
        businessName: provider.business_name || '',
        providerName: provider.provider_name || '',
        email: provider.contact_email || provider.email || '',
        phone: provider.contact_phone || provider.phone || '',
        serviceType: provider.service_types || '',
        location: provider.city ? `${provider.city}, ${provider.province || ''}` : '',
        registrationDate: provider.created_at || new Date().toISOString(),
        status: provider.approval_status || 'pending',
        nicNumber: provider.nic_number || '',
        nicFrontImage: provider.nic_front_image_url || '',
        nicBackImage: provider.nic_back_image_url || '',
        businessRegistrationNumber: provider.business_registration_number || '',
        businessDescription: provider.business_description || '',
        profilePicture: provider.profile_picture_url || '',
        coverPhoto: provider.cover_photo_url || '',
        userId: provider.user_id || '',
        bankName: provider.bank_name || '',
        branchName: provider.branch_name || '',
        accountNumber: provider.account_number || '',
        accountOwnerName: provider.account_owner_name || ''
      }));
      
      setServiceProviders(formattedProviders);
      applyFilters(formattedProviders, searchTerm, filterStatus, filterServiceType, sortField, sortDirection);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      toast.error("Failed to load service providers");
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchServiceProviders();
  }, []);

  // Apply filters, search, and sorting
  const applyFilters = (
    providers: ServiceProvider[], 
    search: string, 
    status: string, 
    serviceType: string,
    field: string,
    direction: "asc" | "desc"
  ) => {
    let filtered = [...providers];
    
    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter(provider => provider.status === status);
    }
    
    // Filter by service type
    if (serviceType !== "all") {
      filtered = filtered.filter(provider => provider.serviceType === serviceType);
    }
    
    // Search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.businessName.toLowerCase().includes(searchLower) ||
        provider.providerName.toLowerCase().includes(searchLower) ||
        provider.email.toLowerCase().includes(searchLower) ||
        provider.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort the results
    filtered.sort((a, b) => {
      // For date fields
      if (field === "registrationDate") {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // For string fields
      const valueA = (a[field as keyof ServiceProvider] as string) || "";
      const valueB = (b[field as keyof ServiceProvider] as string) || "";
      
      return direction === "asc" 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    
    setFilteredProviders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters(serviceProviders, searchTerm, filterStatus, filterServiceType, sortField, sortDirection);
  }, [searchTerm, filterStatus, filterServiceType, sortField, sortDirection, itemsPerPage]);

  // Get current page items
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProviders.slice(startIndex, endIndex);
  };

  // Handle view details
  const handleViewDetails = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowDetailsDialog(true);
  };

  // Handle approve provider
  const handleApprove = async (provider: ServiceProvider) => {
    try {
      const response = await adminService.approveServiceProvider(provider.id);
      
      // Update local state
      const updatedProviders = serviceProviders.map(p => 
        p.id === provider.id ? {...p, status: 'approved'} : p
      );
      
      setServiceProviders(updatedProviders);
      applyFilters(updatedProviders, searchTerm, filterStatus, filterServiceType, sortField, sortDirection);
      
      setShowDetailsDialog(false);
      
      // Show toast with email status
      if (response.email_sent) {
        toast.success(`${provider.businessName} has been approved and an email notification has been sent.`);
      } else {
        toast.success(`${provider.businessName} has been approved but the email notification could not be sent.`);
      }
    } catch (error) {
      console.error("Error approving provider:", error);
      toast.error("Failed to approve provider");
    }
  };

  // Handle reject provider
  const handleOpenRejectDialog = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowRejectDialog(true);
    setShowDetailsDialog(false);
  };

  const handleReject = async () => {
    if (!selectedProvider || !rejectionReason) return;
    
    try {
      const response = await adminService.rejectServiceProvider(selectedProvider.id, rejectionReason);
      
      // Update local state
      const updatedProviders = serviceProviders.map(p => 
        p.id === selectedProvider.id ? {...p, status: 'rejected'} : p
      );
      
      setServiceProviders(updatedProviders);
      applyFilters(updatedProviders, searchTerm, filterStatus, filterServiceType, sortField, sortDirection);
      
      setShowRejectDialog(false);
      setRejectionReason("");
      
      // Show toast with email status
      if (response.email_sent) {
        toast.success(`${selectedProvider.businessName} has been rejected and an email notification has been sent.`);
      } else {
        toast.success(`${selectedProvider.businessName} has been rejected but the email notification could not be sent.`);
      }
    } catch (error) {
      console.error("Error rejecting provider:", error);
      toast.error("Failed to reject provider");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServiceProviders();
    setIsRefreshing(false);
  };

  // Get service type options
  const getServiceTypeOptions = () => {
    const types = new Set<string>();
    serviceProviders.forEach(provider => {
      if (provider.serviceType) {
        types.add(provider.serviceType);
      }
    });
    
    return Array.from(types).sort();
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Render skeleton loaders during loading state
  const renderSkeletons = () => {
    return Array(itemsPerPage).fill(0).map((_, index) => (
      <Card key={index} className="overflow-hidden border border-gray-200">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-20 rounded" />
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Provider Approvals</h1>
          <p className="text-gray-500">Review and manage service provider registrations</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {/* Filters and search bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search providers..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filterServiceType}
          onValueChange={setFilterServiceType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            {getServiceTypeOptions().map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={`${sortField}-${sortDirection}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-');
            setSortField(field);
            setSortDirection(direction as "asc" | "desc");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registrationDate-desc">Newest First</SelectItem>
            <SelectItem value="registrationDate-asc">Oldest First</SelectItem>
            <SelectItem value="businessName-asc">Business Name (A-Z)</SelectItem>
            <SelectItem value="businessName-desc">Business Name (Z-A)</SelectItem>
            <SelectItem value="location-asc">Location (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Count and results summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {filteredProviders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProviders.length)} of {filteredProviders.length} providers
        </p>
        
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 items per page</SelectItem>
            <SelectItem value="12">12 items per page</SelectItem>
            <SelectItem value="24">24 items per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tabs for quick filtering */}
      <Tabs defaultValue="pending" onValueChange={(value) => setFilterStatus(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Service provider cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <AlertCircle className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No providers found</h3>
          <p className="mt-2 text-sm text-gray-500">
            We couldn't find any service providers matching your criteria.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterServiceType("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentItems().map((provider) => (
            <Card 
              key={provider.id} 
              className={`overflow-hidden border hover:shadow-md transition-all duration-200 ${
                provider.status === 'pending' ? 'border-yellow-200 hover:border-yellow-300' : 
                provider.status === 'approved' ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'
              }`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    {provider.profilePicture ? (
                      <img
                        src={provider.profilePicture}
                        alt={provider.providerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold line-clamp-1 text-blue-900">{provider.businessName}</CardTitle>
                    <CardDescription className="line-clamp-1 flex items-center">
                      <Tag className="h-3 w-3 mr-1 text-blue-500" />
                      <span className="text-blue-600 font-medium">{provider.serviceType}</span>
                    </CardDescription>
                  </div>
                </div>
                {renderStatusBadge(provider.status)}
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-50 rounded-full p-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{provider.providerName}</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="bg-green-50 rounded-full p-1.5">
                      <MapPin className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-700">{provider.location || "No location specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="bg-amber-50 rounded-full p-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="text-gray-700">
                      {(() => {
                        try {
                          const date = new Date(provider.registrationDate);
                          return isNaN(date.getTime()) 
                            ? "Registration date unknown" 
                            : `Registered ${formatDistanceToNow(date, { addSuffix: true })}`;
                        } catch (error) {
                          return "Registration date unknown";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  ID: {provider.id.slice(0, 8)}...
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    onClick={() => handleViewDetails(provider)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {provider.status === 'pending' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wider">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="hover:bg-green-50 cursor-pointer" 
                          onClick={() => handleApprove(provider)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-green-700 font-medium">Approve</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-red-50 cursor-pointer" 
                          onClick={() => handleOpenRejectDialog(provider)}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          <span className="text-red-700 font-medium">Reject</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredProviders.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`w-9 ${currentPage === page ? 'bg-blue-600' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      {/* Details Dialog */}
      <ServiceProviderDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        provider={selectedProvider}
        onApprove={handleApprove}
        onReject={handleOpenRejectDialog}
      />
      
      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Service Provider</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this service provider. 
              This information will be shared with the provider.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <label htmlFor="rejectionReason" className="text-sm font-medium block mb-2">
              Rejection Reason
            </label>
            <textarea
              id="rejectionReason"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 h-24"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderApproval;
