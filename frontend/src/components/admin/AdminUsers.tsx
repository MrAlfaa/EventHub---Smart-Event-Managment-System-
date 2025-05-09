import React, { useState } from "react";
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
  ChevronsRight
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

// Define interfaces for type safety
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  contactNumber: string;
  nicNumber: string;
  address: string;
  role: string;
  status: string;
  registrationDate: string;
  lastLogin: string;
  bookingsCount: number;
  profileImage: string | null;
  nicFrontImage: string | null;
  nicBackImage: string | null;
}

interface SelectedImage {
  url: string;
  title: string;
}

// Mock user data with expanded information (filtered to only show users/event organizers)
const mockUsers: User[] = [
  {
    id: "1001",
    name: "John Smith",
    email: "john@example.com",
    username: "johnsmith",
    contactNumber: "+94 71 234 5678",
    nicNumber: "912345678V",
    address: "123 Main Street, Colombo 03",
    role: "User",
    status: "Active",
    registrationDate: "2024-01-15",
    lastLogin: "2024-04-20",
    bookingsCount: 5,
    profileImage: "https://i.pravatar.cc/300?img=1",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
  },
  {
    id: "1003",
    name: "Michael Davis",
    email: "michael@example.com",
    username: "mikedavis",
    contactNumber: "+94 77 456 7890",
    nicNumber: "945678912V",
    address: "789 Beach Road, Negombo",
    role: "User",
    status: "Inactive",
    registrationDate: "2023-12-05",
    lastLogin: "2024-03-15",
    bookingsCount: 2,
    profileImage: "https://i.pravatar.cc/300?img=9",
    nicFrontImage: null,
    nicBackImage: null,
  },
  {
    id: "1005",
    name: "Amal Perera",
    email: "amal@example.com",
    username: "amalp",
    contactNumber: "+94 70 123 4567",
    nicNumber: "957890234V",
    address: "45 Lake Road, Colombo 05",
    role: "User",
    status: "Active",
    registrationDate: "2024-03-01",
    lastLogin: "2024-04-18",
    bookingsCount: 3,
    profileImage: "https://i.pravatar.cc/300?img=11",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
  },
  {
    id: "1006",
    name: "Kamala Jayawardena",
    email: "kamala@example.com",
    username: "kamalaj",
    contactNumber: "+94 71 789 0123",
    nicNumber: "968901245V",
    address: "23 Hill Street, Kandy",
    role: "User",
    status: "Active",
    registrationDate: "2024-02-20",
    lastLogin: "2024-04-21",
    bookingsCount: 7,
    profileImage: "https://i.pravatar.cc/300?img=22",
    nicFrontImage: "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format",
    nicBackImage: "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format",
  },
];

// Generate more mock users for pagination demo
const generateMoreUsers = () => {
  const additionalUsers: User[] = [];
  
  for (let i = 0; i < 25; i++) {
    additionalUsers.push({
      id: `${2000 + i}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      username: `user${i + 1}`,
      contactNumber: `+94 7${i} ${i}00 ${i}${i}${i}${i}`,
      nicNumber: `98${i}${i}${i}${i}${i}${i}V`,
      address: `${i}${i} Street, City ${i}`,
      role: "User",
      status: i % 3 === 0 ? "Inactive" : "Active",
      registrationDate: `2024-0${i % 9 + 1}-${i + 1}`,
      lastLogin: `2025-04-${i + 1}`,
      bookingsCount: i % 10,
      profileImage: `https://i.pravatar.cc/300?img=${30 + i}`,
      nicFrontImage: i % 2 === 0 ? "https://images.unsplash.com/photo-1599022160646-a0a8c4407277?q=80&w=400&auto=format" : null,
      nicBackImage: i % 2 === 0 ? "https://images.unsplash.com/photo-1599022160619-9d26661c68ef?q=80&w=400&auto=format" : null,
    });
  }
  
  return [...mockUsers, ...additionalUsers];
};

const allUsers = generateMoreUsers();

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Filter users based on search query
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleViewUser = (user: User) => {
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
      <h1 className="text-2xl font-bold">Event Organizers Management</h1>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search event organizers..." 
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
                  <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">#{user.id}</td>
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewUser(user)} className="flex items-center gap-1">
                            <User size={14} />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No event organizers found matching your search.
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
                of <span className="font-medium">{filteredUsers.length}</span> event organizers
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
                <DialogTitle className="text-2xl">Event Organizer Profile</DialogTitle>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Event Organizer
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
                        src={selectedUser.profileImage ?? undefined} 
                        alt={selectedUser.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                    <div className="flex items-center justify-center mt-1">
                      <Badge variant="secondary" className="mt-2">
                        {selectedUser.status === 'Active' ? 'Active Account' : 'Inactive Account'}
                      </Badge>
                    </div>
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
                        <p className="text-sm">{selectedUser.contactNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 p-2 rounded-full">
                        <MapPin size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm">{selectedUser.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="flex-1">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">ACCOUNT INFORMATION</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-full">
                      <CreditCard size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">NIC Number</p>
                      <p className="text-sm">{selectedUser.nicNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-full">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm">{new Date(selectedUser.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-50 p-2 rounded-full">
                      <Clock size={16} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-sm">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                <div className="mt-6">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">ACTIVITY</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Total Bookings</p>
                      <p className="text-lg font-semibold">{selectedUser.bookingsCount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last booking on {selectedUser.bookingsCount > 0 ? "March 15, 2024" : "N/A"}
                    </p>
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
                          onClick={() => selectedUser.nicFrontImage && openImageModal(selectedUser.nicFrontImage, "NIC Front Side")}
                        >
                          {selectedUser.nicFrontImage ? (
                            <>
                              <img 
                                src={selectedUser.nicFrontImage} 
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
                          onClick={() => selectedUser.nicBackImage && openImageModal(selectedUser.nicBackImage, "NIC Back Side")}
                        >
                          {selectedUser.nicBackImage ? (
                            <>
                              <img 
                                src={selectedUser.nicBackImage} 
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
