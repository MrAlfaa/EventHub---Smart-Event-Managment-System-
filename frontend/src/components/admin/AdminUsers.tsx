import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Clock,
  ZoomIn,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import adminService, { AdminUserData } from "@/services/adminService";
import { toast } from "sonner";
import { formatDate, getTimeAgo } from "@/utils/dateUtils";

// Define interfaces for type safety
interface SelectedImage {
  url: string;
  title: string;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await adminService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleViewUser = (user: AdminUserData) => {
    setSelectedUser(user);
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
      <h1 className="text-2xl font-bold">Users Management</h1>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search users..." 
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
                  <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Registration Date</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">#{user.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_image || undefined} alt={user.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        {user.created_at ? formatDate(user.created_at) : 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewUser(user)} className="flex items-center gap-1">
                            <User size={14} />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span> users
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
                    // Logic for displaying page numbers with ellipsis
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

      {/* Enhanced User Details Dialog */}
      {selectedUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl">User Profile</DialogTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  Regular User
                </Badge>
              </div>
              <DialogDescription>
                Complete details and identification documents
              </DialogDescription>
            </DialogHeader>

            {/* User Profile Details */}
            <div className="flex flex-col md:flex-row gap-6 pt-4">
              {/* Profile Image and Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={selectedUser.profile_image ?? undefined} 
                        alt={selectedUser.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                        {selectedUser.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-sm text-muted-foreground">CONTACT INFORMATION</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <Mail size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email Address</p>
                        <p className="text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded-full">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contact Number</p>
                        <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    {selectedUser.address && (
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2 rounded-full">
                          <MapPin size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm">{selectedUser.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="flex-1">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">ACCOUNT INFORMATION</h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedUser.nic_number && (
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 p-2 rounded-full">
                        <CreditCard size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">NIC Number</p>
                        <p className="text-sm">{selectedUser.nic_number}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-full">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-50 p-2 rounded-full">
                      <Clock size={16} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">{getTimeAgo(selectedUser.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* NIC Document Images */}
            <div>
              <h4 className="font-medium mb-4">Identification Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">NIC Front Side</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="relative h-40 border rounded-md bg-gray-50 overflow-hidden cursor-pointer group"
                          onClick={() => selectedUser.nic_front_image && openImageModal(selectedUser.nic_front_image, "NIC Front Side")}
                        >
                          {selectedUser.nic_front_image ? (
                            <>
                              <img 
                                src={selectedUser.nic_front_image} 
                                alt="NIC Front" 
                                className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                <ZoomIn className="text-white h-6 w-6" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-400 mt-2">No image available</p>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view full image</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">NIC Back Side</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="relative h-40 border rounded-md bg-gray-50 overflow-hidden cursor-pointer group"
                          onClick={() => selectedUser.nic_back_image && openImageModal(selectedUser.nic_back_image, "NIC Back Side")}
                        >
                          {selectedUser.nic_back_image ? (
                            <>
                              <img 
                                src={selectedUser.nic_back_image} 
                                alt="NIC Back" 
                                className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                <ZoomIn className="text-white h-6 w-6" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-400 mt-2">No image available</p>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view full image</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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

export default AdminUsers;
