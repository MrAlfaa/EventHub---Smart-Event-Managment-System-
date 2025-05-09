import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
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

// Mock pending service provider data
const mockPendingProviders = [
  {
    id: "3001",
    businessName: "Sunset Caterers",
    ownerName: "Rohan Fernando",
    email: "rohan@sunsetcaterers.com",
    username: "rohanfernando",
    contactNumber: "+94 71 234 5699",
    nicNumber: "912345999V",
    businessRegNumber: "REG78909999",
    location: "Colombo",
    address: "42 Galle Road, Colombo 03",
    city: "Colombo",
    province: "Western",
    serviceType: ["Catering", "Food Delivery"],
    status: "Pending",
    submittedDate: "2024-04-01",
    signupTime: "2024-03-29 14:32:05",
    profileImage: "https://i.pravatar.cc/300?img=33",
    coverPhoto: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Rohan Fernando",
      email: "rohan@sunsetcaterers.com",
      phone: "+94 71 234 5699"
    },
    // Add bank account details
    bankName: "Commercial Bank",
    branchName: "Colombo Main",
    accountNumber: "1234567890123",
    accountOwnerName: "Rohan Fernando",
    // Add new mock data
    businessDescription: "Sunset Caterers is a premium catering service specializing in Sri Lankan and international cuisines for all types of events. With 15 years of experience, we provide exceptional food and service for weddings, corporate events, and private parties.",
    slogan: "Taste the difference, experience the excellence",
    serviceLocations: ["Colombo", "Gampaha", "Kalutara", "Negombo", "Kandy"],
    coveredEventTypes: ["wedding", "corporate", "birthday", "anniversary", "conference"]
  },
  {
    id: "3002",
    businessName: "Classic Photography",
    ownerName: "Nimal Perera",
    email: "nimal@classicphoto.com",
    username: "nimalperera",
    contactNumber: "+94 77 896 5432",
    nicNumber: "895432167V",
    businessRegNumber: "REG43219876",
    location: "Kandy",
    address: "156 Peradeniya Road",
    city: "Kandy",
    province: "Central",
    serviceType: ["Photography", "Videography"],
    status: "Pending",
    submittedDate: "2024-04-10",
    signupTime: "2024-04-09 09:15:23",
    profileImage: "https://i.pravatar.cc/300?img=58",
    coverPhoto: "https://images.unsplash.com/photo-1534131707746-25d604851a1f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: null,
    eventOrganizerContact: {
      name: "Nimal Perera",
      email: "nimal@classicphoto.com",
      phone: "+94 77 896 5432"
    },
    // Add bank account details
    bankName: "Bank of Ceylon",
    branchName: "Kandy City",
    accountNumber: "9876543210987",
    accountOwnerName: "Nimal Perera",
    // Add new mock data
    businessDescription: "Classic Photography offers high-quality photography and videography services for all occasions. We combine traditional techniques with modern technology to capture your perfect moments in stunning detail.",
    slogan: "Capturing moments, creating memories",
    serviceLocations: ["Kandy", "Matale", "Nuwara Eliya", "Peradeniya", "Colombo"],
    coveredEventTypes: ["wedding", "engagement", "graduation", "birthday", "religious"]
  },
  {
    id: "3003",
    businessName: "Elite Decorations",
    ownerName: "Kumari Silva",
    email: "kumari@elitedeco.com",
    username: "kumarisilva",
    contactNumber: "+94 70 765 4321",
    nicNumber: "905432198V",
    businessRegNumber: "",
    location: "Galle",
    address: "78 Lighthouse Street, Fort",
    city: "Galle",
    province: "Southern",
    serviceType: ["Decoration", "Floral Arrangements"],
    status: "Pending",
    submittedDate: "2024-04-15",
    signupTime: "2024-04-14 16:08:37",
    profileImage: "https://i.pravatar.cc/300?img=32",
    coverPhoto: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Kumari Silva",
      email: "kumari@elitedeco.com",
      phone: "+94 70 765 4321"
    },
    // Add bank account details
    bankName: "Sampath Bank",
    branchName: "Galle Fort",
    accountNumber: "5678901234567",
    accountOwnerName: "Kumari Silva",
    // Add new mock data
    businessDescription: "Elite Decorations is a boutique event decoration service that transforms ordinary spaces into extraordinary experiences. We specialize in luxury weddings, corporate events, and high-end private celebrations.",
    slogan: "Elevating events with elegance and style",
    serviceLocations: ["Galle", "Matara", "Hambantota", "Colombo", "Hikkaduwa"],
    coveredEventTypes: ["wedding", "corporate", "exhibition", "anniversary", "festival"]
  }
];

// Mock approved service provider data
const mockApprovedProviders = [
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
    address: "25 Park Street, Colombo 02",
    city: "Colombo",
    province: "Western",
    serviceType: ["Hotel", "Catering"],
    status: "Active",
    signupTime: "2024-02-15 10:22:45",
    profileImage: "https://i.pravatar.cc/300?img=28",
    coverPhoto: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Anna De Silva",
      email: "anna@elegantevents.com",
      phone: "+94 71 987 6543"
    },
    // Add bank account details
    bankName: "People's Bank",
    branchName: "Colombo Central",
    accountNumber: "7654321098765",
    accountOwnerName: "Priya Sharma",
    // Add new mock data
    businessDescription: "Elegant Events is a full-service event management company specializing in luxury weddings and corporate events. With over a decade of experience, we pride ourselves on attention to detail and personalized service.",
    slogan: "Where elegance meets perfection",
    serviceLocations: ["Colombo", "Negombo", "Gampaha", "Kalutara", "Bentota"],
    coveredEventTypes: ["wedding", "corporate", "conference", "gala", "anniversary"]
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
    address: "78 Duplication Road, Colombo 04",
    city: "Colombo",
    province: "Western",
    serviceType: ["Wedding Planning", "Decoration"],
    status: "Active",
    signupTime: "2024-01-22 16:45:12",
    profileImage: "https://i.pravatar.cc/300?img=33",
    coverPhoto: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
    eventOrganizerContact: {
      name: "Kumari Fernando",
      email: "kumari@luxeweddings.com",
      phone: "+94 76 234 5678"
    },
    // Add bank account details
    bankName: "National Savings Bank",
    branchName: "Battaramulla",
    accountNumber: "8765432109876",
    accountOwnerName: "Ranjith Perera",
    // Add new mock data
    businessDescription: "Luxe Weddings is dedicated to creating unforgettable wedding experiences for couples who dream of extraordinary celebrations. From intimate ceremonies to grand receptions, we handle every aspect with precision and creativity.",
    slogan: "Creating unforgettable wedding journeys",
    serviceLocations: ["Colombo", "Kandy", "Galle", "Nuwara Eliya", "Jaffna"],
    coveredEventTypes: ["wedding", "engagement", "pre-wedding", "reception", "anniversary"]
  }
];

// Mock rejected service provider data
const mockRejectedProviders = [
  {
    id: "4001",
    businessName: "Dream Events",
    ownerName: "Lasith Malinga",
    email: "lasith@dreamevents.com",
    username: "lasithmalinga",
    contactNumber: "+94 71 111 2222",
    nicNumber: "901112222V",
    businessRegNumber: "REG11122233",
    location: "Matara",
    address: "56 Beach Road",
    city: "Matara",
    province: "Southern",
    serviceType: ["Event Planning"],
    status: "Rejected",
    rejectedDate: "2024-03-15",
    rejectedReason: "Incomplete documentation and missing business verification",
    signupTime: "2024-03-01 09:30:15",
    profileImage: "https://i.pravatar.cc/300?img=59",
    coverPhoto: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    nicFrontImage: null,
    nicBackImage: null,
    eventOrganizerContact: {
      name: "Lasith Malinga",
      email: "lasith@dreamevents.com",
      phone: "+94 71 111 2222"
    },
    // Add bank account details
    bankName: "DFCC Bank",
    branchName: "Matara Main",
    accountNumber: "6543210987654",
    accountOwnerName: "Lasith Malinga",
    // Add new mock data
    businessDescription: "Dream Events specializes in creating unforgettable celebrations tailored to your unique vision and budget. Our team of experienced planners will handle every detail from venue selection to day-of coordination.",
    slogan: "Making your dreams come true",
    serviceLocations: ["Matara", "Galle", "Hambantota", "Tangalle", "Colombo"],
    coveredEventTypes: ["wedding", "birthday", "corporate", "cultural", "sports"]
  }
];

const ServiceProviderApproval: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // New state variables for confirmation dialogs and actions
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [providerToAction, setProviderToAction] = useState<ServiceProvider | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 5;

  // Combined service types from all providers
  const allServiceTypes = Array.from(new Set([
    ...mockPendingProviders.flatMap(p => p.serviceType),
    ...mockApprovedProviders.flatMap(p => p.serviceType),
    ...mockRejectedProviders.flatMap(p => p.serviceType)
  ]));

  // Combined locations from all providers
  const allLocations = Array.from(new Set([
    ...mockPendingProviders.map(p => p.location),
    ...mockApprovedProviders.map(p => p.location),
    ...mockRejectedProviders.map(p => p.location)
  ]));

  // Get the current providers based on active tab
  const getCurrentProviders = () => {
    let providers = [];
    
    switch (activeTab) {
      case "pending":
        providers = mockPendingProviders;
        break;
      case "approved":
        providers = mockApprovedProviders;
        break;
      case "rejected":
        providers = mockRejectedProviders;
        break;
      default:
        providers = mockPendingProviders;
    }
    
    // Apply search filter
    return providers.filter(provider => 
      (provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       provider.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       provider.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (serviceTypeFilter === "all" || provider.serviceType.includes(serviceTypeFilter)) &&
      (locationFilter === "all" || provider.location === locationFilter)
    );
  };

  // Filtered providers based on search and filters
  const filteredProviders = getCurrentProviders();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, serviceTypeFilter, locationFilter]);

  const handleViewProvider = (provider: ServiceProvider) => {
    // Make sure we're passing the full provider object with all fields
    console.log("Provider data being passed to dialog:", provider);
    setSelectedProvider({...provider});
    setIsViewDialogOpen(true);
  };

  // Open the approve confirmation dialog
  const openApproveDialog = (provider: ServiceProvider) => {
    setProviderToAction(provider);
    setIsApproveDialogOpen(true);
  };

  // Open the reject dialog with rejection form
  const openRejectDialog = (provider: ServiceProvider) => {
    setProviderToAction(provider);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  // Confirm provider approval
  const confirmApprove = () => {
    if (!providerToAction) return;
    
    // Get current date in YYYY-MM-DD format
    const approvalDate = new Date().toISOString().split('T')[0];
    
    // Create a new provider object with updated status
    const updatedProvider = {
      ...providerToAction,
      status: "Active",
      nicFrontImage: providerToAction.nicFrontImage || "",
      nicBackImage: providerToAction.nicBackImage || ""
    };
    
    // Here you would make an API call to update the provider status
    // For this mock implementation, we'll move the provider between arrays
    
    // Add to approved providers
    mockApprovedProviders.push(updatedProvider);
    
    // Remove from pending providers
    const index = mockPendingProviders.findIndex(p => p.id === updatedProvider.id);
    if (index !== -1) {
      mockPendingProviders.splice(index, 1);
    }
    
    // Close dialog and show success message
    setIsApproveDialogOpen(false);
    toast.success(`${updatedProvider.businessName} has been approved successfully`);
    
    // Immediately switch to approved tab to show the moved provider
    setActiveTab("approved");
  };

  // Confirm provider rejection
  const confirmReject = () => {
    if (!providerToAction || !rejectionReason.trim()) return;
    
    // Get current date in YYYY-MM-DD format
    const rejectionDate = new Date().toISOString().split('T')[0];
    
    // Create a new provider object with updated status, rejection date and reason
    const updatedProvider = {
      ...providerToAction,
      status: "Rejected",
      rejectedDate: rejectionDate,
      rejectedReason: rejectionReason.trim(),
      nicFrontImage: null,
      nicBackImage: null
    };
    
    // Here you would make an API call to update the provider status
    // For this mock implementation, we'll move the provider between arrays
    
    // Add to rejected providers
    mockRejectedProviders.push(updatedProvider);
    
    // Remove from pending providers
    const index = mockPendingProviders.findIndex(p => p.id === updatedProvider.id);
    if (index !== -1) {
      mockPendingProviders.splice(index, 1);
    }
    
    // Close dialog and show success message
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    toast.success(`${updatedProvider.businessName} has been rejected`);
    
    // Immediately switch to rejected tab to show the moved provider
    setActiveTab("rejected");
  };

  // Pagination functions
  const goToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setServiceTypeFilter("all");
    setLocationFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Service Provider Applications</h1>
        <div className="flex items-center gap-2">
          <Badge variant={activeTab === "pending" ? "destructive" : "outline"} className="text-xs">
            {mockPendingProviders.length} Pending
          </Badge>
          <Badge variant={activeTab === "approved" ? "default" : "outline"} className="text-xs bg-green-100 text-green-800 border-green-200">
            {mockApprovedProviders.length} Approved
          </Badge>
          <Badge variant={activeTab === "rejected" ? "secondary" : "outline"} className="text-xs">
            {mockRejectedProviders.length} Rejected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search providers..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {allServiceTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {allLocations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </div>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">Business</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Owner</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Location</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Services</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Submitted</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProviders.length > 0 ? (
                      currentProviders.map((provider) => (
                        <tr key={provider.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img 
                                  src={provider.profileImage} 
                                  alt={provider.businessName} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{provider.businessName}</p>
                                <p className="text-sm text-muted-foreground">{provider.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{provider.ownerName}</td>
                          <td className="p-4">{provider.location}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {provider.serviceType.map((service) => (
                                <Badge key={service} variant="outline" className="bg-blue-50 text-blue-800">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {"submittedDate" in provider ? provider.submittedDate : "N/A"}
                          </td>
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
                              <Button 
                                size="sm" 
                                variant="default" 
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => openApproveDialog(provider)}
                              >
                                <CheckCircle size={14} />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="flex items-center gap-1"
                                onClick={() => openRejectDialog(provider)}
                              >
                                <XCircle size={14} />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No pending applications found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">Business</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Owner</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Location</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Services</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProviders.length > 0 ? (
                      currentProviders.map((provider) => (
                        <tr key={provider.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img 
                                  src={provider.profileImage} 
                                  alt={provider.businessName} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{provider.businessName}</p>
                                <p className="text-sm text-muted-foreground">{provider.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{provider.ownerName}</td>
                          <td className="p-4">{provider.location}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {provider.serviceType.map((service) => (
                                <Badge key={service} variant="outline" className="bg-blue-50 text-blue-800">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewProvider(provider)}
                              className="flex items-center gap-1"
                            >
                              <User size={14} />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No approved service providers found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">Business</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Owner</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Rejection Date</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Reason</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProviders.length > 0 ? (
                      currentProviders.map((provider) => (
                        <tr key={provider.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img 
                                  src={provider.profileImage} 
                                  alt={provider.businessName} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{provider.businessName}</p>
                                <p className="text-sm text-muted-foreground">{provider.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{provider.ownerName}</td>
                          <td className="p-4">{("rejectedDate" in provider) ? provider.rejectedDate : "N/A"}</td>
                          <td className="p-4">{("rejectedReason" in provider) ? provider.rejectedReason : "N/A"}</td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewProvider(provider)}
                              className="flex items-center gap-1"
                            >
                              <User size={14} />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No rejected service providers found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Pagination Controls */}
      {filteredProviders.length > 0 && (
        <div className="flex items-center justify-between px-2">
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
      
      {/* Details Dialog */}
      <ServiceProviderDetailsDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        provider={selectedProvider}
        onApprove={openApproveDialog}
        onReject={openRejectDialog}
      />
      
      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Service Provider
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this service provider? 
              They will be able to list their services on the platform.
            </DialogDescription>
          </DialogHeader>
          
          {providerToAction && (
            <div className="flex items-center gap-3 py-3 border rounded-md px-3 bg-muted/30">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img 
                  src={providerToAction.profileImage} 
                  alt={providerToAction.businessName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{providerToAction.businessName}</p>
                <p className="text-sm text-muted-foreground">{providerToAction.email}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmApprove}
            >
              Approve Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Confirmation Dialog with Reason Form */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Service Provider
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be visible to the service provider.
            </DialogDescription>
          </DialogHeader>
          
          {providerToAction && (
            <div className="flex items-center gap-3 py-3 border rounded-md px-3 bg-muted/30 mb-4">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img 
                  src={providerToAction.profileImage} 
                  alt={providerToAction.businessName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{providerToAction.businessName}</p>
                <p className="text-sm text-muted-foreground">{providerToAction.email}</p>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason" className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                Rejection Reason
              </Label>
              <Textarea 
                id="rejection-reason" 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this provider is being rejected..."
                className="resize-none min-h-[120px]"
              />
              {isRejectDialogOpen && !rejectionReason.trim() && (
                <p className="text-xs text-red-500">A rejection reason is required</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
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
