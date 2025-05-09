import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  Check, 
  X, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Mail,
  DollarSign,
  Clock,
  User,
  FileText,
  Link as LinkIcon,
  StickyNote,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { FullPaymentConfirmationDialog } from "./FullPaymentConfirmationDialog";
import { BookingCancelDialog } from "./BookingCancelDialog";
import AddBookingForm from "../AddBookingForm";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Mock booking data interface
export interface BookingData {
  id: number;
  bookingId: string;
  customerName: string;
  packageName: string;
  bookingDate: Date;
  fullAmount: number;
  advanceAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  // Detailed info for hover popup
  fullDetails: {
    nameWithInitial: string;
    nicNumber: string;
    phoneNumber: string;
    email: string;
    eventCoordinatorName?: string;
    eventCoordinatorNumber?: string;
    address: string;
    eventLocation: {
      name: string;
      mapLink?: string;
    };
    crowdSize: number;
    eventType: string;
    additionalNotes?: string; // Optional additional notes field
  };
}

// Generate mock booking data
const generateMockBookings = (): BookingData[] => {
  return Array(10).fill(0).map((_, i) => ({
    id: i + 1,
    bookingId: `BK${1000 + i}`,
    customerName: `Customer ${String.fromCharCode(65 + i % 26)}`,
    packageName: i % 3 === 0 ? 'Wedding Deluxe' : i % 3 === 1 ? 'Corporate Event' : 'Birthday Special',
    bookingDate: new Date(Date.now() + (i * 2 * 86400000)), // Every 2 days
    fullAmount: 1000 + (i * 200),
    advanceAmount: 300 + (i * 50),
    status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'completed' : 'cancelled',
    fullDetails: {
      nameWithInitial: `${String.fromCharCode(65 + i % 26)}. Smith`,
      nicNumber: `98${Math.floor(7000000 + i * 111111)}V`,
      phoneNumber: `+94 77${Math.floor(1000000 + i * 111111)}`,
      email: `customer${i}@example.com`,
      eventCoordinatorName: i % 2 === 0 ? `Coordinator ${String.fromCharCode(65 + i % 26)}` : undefined,
      eventCoordinatorNumber: i % 2 === 0 ? `+94 76${Math.floor(1000000 + i * 111111)}` : undefined,
      address: `${123 + i} Main St, Colombo ${i + 1}`,
      eventLocation: {
        name: i % 2 === 0 ? `${['Grand', 'Royal', 'Luxury', 'Premium'][i % 4]} Hotel` : `${['City Park', 'Beach Side', 'Mountain View', 'Lake Garden'][i % 4]}`,
        mapLink: i % 3 === 0 ? `https://maps.google.com/?q=${6 + i}.927079,79.${800000 + i * 1000}` : undefined,
      },
      crowdSize: 50 + (i * 20),
      eventType: ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Graduation'][i % 5],
    }
  }));
};

// Create the initial bookings data
const initialBookings = generateMockBookings();

interface BookingsDetailsTabProps {
  filter: string;
}

export const BookingsDetailsTab = forwardRef<{ handleBookingAdded: (booking: any) => void }, BookingsDetailsTabProps>(
  ({ filter }, ref) => {
  // State for bookings with their updated status
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showFullPaymentDialog, setShowFullPaymentDialog] = useState(false);
  const [showCancelBookingDialog, setShowCancelBookingDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  // New state for add booking form
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);

  // Create function to handle adding new bookings
  const handleBookingAdded = (formData: any) => {
    // Convert form data to a valid BookingData object
    const newBooking: BookingData = {
      id: formData.id || Math.floor(Math.random() * 10000),
      bookingId: formData.bookingId || `BK${1000 + Math.floor(Math.random() * 9000)}`,
      customerName: formData.fullName || "New Customer",
      packageName: formData.packageName || "Standard Package",
      bookingDate: formData.eventDate || new Date(),
      fullAmount: Number(formData.fullAmount) || 0,
      advanceAmount: Number(formData.advanceAmount) || 0,
      status: 'pending',
      fullDetails: {
        nameWithInitial: formData.fullName || "New Customer",
        nicNumber: formData.nicNumber || "00000000V",
        phoneNumber: formData.phoneNumber ? `+94 ${formData.phoneNumber}` : "+94 000000000",
        email: formData.email || "customer@example.com",
        eventCoordinatorName: formData.coordinatorName || undefined,
        eventCoordinatorNumber: formData.coordinatorContact || undefined,
        address: formData.address || "Not specified",
        eventLocation: {
          name: formData.eventLocation || "Not specified",
          mapLink: formData.mapLink || undefined,
        },
        crowdSize: Number(formData.crowdSize) || 0,
        eventType: formData.eventType || "Not specified",
        additionalNotes: formData.additionalNotes || undefined,
      }
    };

    // Add the new booking to the bookings state
    setBookings(prevBookings => [newBooking, ...prevBookings]);
    
    // Show success message
    toast.success(`Booking ${newBooking.bookingId} added successfully`, {
      icon: <Check className="h-4 w-4 text-green-500" />
    });
    
    // Reset to the first page to show the new booking
    setCurrentPage(1);
  };

  // Expose the handleBookingAdded method to parent component through ref
  useImperativeHandle(ref, () => ({
    handleBookingAdded
  }));

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  // Search bookings based on search query
  const searchedBookings = filteredBookings.filter(booking =>
    booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = searchedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(searchedBookings.length / bookingsPerPage);

  // Open mark as paid confirmation dialog
  const handleOpenMarkAsPaid = (booking: BookingData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBooking(booking);
    setShowFullPaymentDialog(true);
  };

  // Open cancel booking confirmation dialog
  const handleOpenCancelBooking = (booking: BookingData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBooking(booking);
    setShowCancelBookingDialog(true);
  };

  // Handle marking booking as fully paid
  const handleMarkAsFullyPaid = () => {
    if (!selectedBooking) return;
    
    // Update booking status in the state
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, status: 'completed' as const } 
          : booking
      )
    );
    
    // Show success message
    toast.success(`Booking ${selectedBooking.bookingId} marked as fully paid and completed`, {
      icon: <Check className="h-4 w-4 text-green-500" />
    });
    
    // Close dialog
    setShowFullPaymentDialog(false);
    setOpenViewDialog(null);
  };

  // Handle canceling booking
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    
    // Update booking status in the state
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, status: 'cancelled' as const } 
          : booking
      )
    );
    
    // Show success message
    toast.success(`Booking ${selectedBooking.bookingId} has been cancelled`, {
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />
    });
    
    // Close dialog
    setShowCancelBookingDialog(false);
    setOpenViewDialog(null);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate days remaining until event
  const getDaysRemaining = (date: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(date.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0 relative">
          <div className="p-4 flex justify-between items-center">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowAddBookingForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Booking
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Full Amount</TableHead>
                  <TableHead>Advanced Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBookings.map((booking) => (
                  <HoverCard key={booking.id} openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <TableRow 
                        className={`cursor-pointer group ${booking.status === 'pending' ? 'hover:bg-green-50' : 
                        booking.status === 'completed' ? 'hover:bg-blue-50' : 'hover:bg-red-50'}`}
                      >
                        <TableCell>{booking.bookingId}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.packageName}</TableCell>
                        <TableCell>{booking.bookingDate.toLocaleDateString()}</TableCell>
                        <TableCell>${booking.fullAmount}</TableCell>
                        <TableCell>${booking.advanceAmount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'pending' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={openViewDialog === booking.id} onOpenChange={(open) => setOpenViewDialog(open ? booking.id : null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="outline"
                                  className="h-8 w-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[85vh] max-w-[700px] overflow-y-auto p-0 rounded-xl">
                                {/* Colored header based on booking status */}
                                <div className={`
                                  p-6 text-white relative
                                  ${booking.status === 'pending' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                                  booking.status === 'completed' ? 'bg-gradient-to-r from-blue-600 to-blue-800' :
                                  'bg-gradient-to-r from-red-500 to-rose-600'}
                                `}>
                                  {/* Decorative elements */}
                                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                                    <div className="absolute top-10 left-10 w-20 h-20 rounded-full border border-white"></div>
                                    <div className="absolute top-5 right-10 w-16 h-16 rounded-full border border-white"></div>
                                    <div className="absolute bottom-5 left-32 w-12 h-12 rounded-full border border-white"></div>
                                    <div className="absolute -bottom-5 right-20 w-24 h-24 rounded-full border border-white"></div>
                                  </div>
                                  
                                  {/* Header content */}
                                  <div className="relative z-10">
                                    <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30 border-0">
                                      {booking.status === 'pending' ? 'UPCOMING' : 
                                      booking.status === 'completed' ? 'COMPLETED' : 'CANCELLED'}
                                    </Badge>
                                    
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h2 className="text-2xl font-bold">Booking {booking.bookingId}</h2>
                                        <p className="text-white/80 mt-1">{booking.packageName}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-3xl font-bold">${booking.fullAmount}</div>
                                        <div className="text-sm text-white/80">
                                          {booking.status === 'pending' 
                                            ? `$${booking.fullAmount - booking.advanceAmount} remaining`
                                            : booking.status === 'completed'
                                              ? 'Fully Paid'
                                              : 'Cancelled'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center">
                                      <Calendar className="h-5 w-5 mr-2" />
                                      <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                                      
                                      {booking.status === 'pending' && (
                                        <div className="ml-auto bg-white/20 rounded-full px-3 py-1 text-sm flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          <span>{getDaysRemaining(booking.bookingDate)} days remaining</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Main content */}
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Customer Information */}
                                    <div className="space-y-5">
                                      <div className="flex items-center pb-2 mb-2 border-b">
                                        <User className="h-5 w-5 mr-2 text-blue-600" />
                                        <h3 className="font-semibold text-lg">Customer Details</h3>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <div className="flex items-start">
                                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <User className="h-4 w-4 text-blue-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Customer Name</p>
                                            <p className="font-medium">{booking.fullDetails.nameWithInitial}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <FileText className="h-4 w-4 text-blue-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">NIC Number</p>
                                            <p className="font-medium">{booking.fullDetails.nicNumber}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <Phone className="h-4 w-4 text-blue-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{booking.fullDetails.phoneNumber}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <Mail className="h-4 w-4 text-blue-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{booking.fullDetails.email}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Event Details */}
                                    <div className="space-y-5">
                                      <div className="flex items-center pb-2 mb-2 border-b">
                                        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                                        <h3 className="font-semibold text-lg">Event Details</h3>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <div className="flex items-start">
                                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                                            <FileText className="h-4 w-4 text-purple-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Event Type</p>
                                            <p className="font-medium">{booking.fullDetails.eventType}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                                            <MapPin className="h-4 w-4 text-purple-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Event Location</p>
                                            <p className="font-medium">{booking.fullDetails.eventLocation.name}</p>
                                            {booking.fullDetails.eventLocation.mapLink && (
                                              <a 
                                                href={booking.fullDetails.eventLocation.mapLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center mt-1 text-sm"
                                              >
                                                <LinkIcon className="h-3 w-3 mr-1" />
                                                View on Google Maps
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                                            <Users className="h-4 w-4 text-purple-700" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Crowd Size</p>
                                            <p className="font-medium">{booking.fullDetails.crowdSize} people</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Additional Notes Section (if available) */}
                                  {booking.fullDetails.additionalNotes && (
                                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                      <h3 className="flex items-center font-medium text-lg mb-3 text-amber-800">
                                        <StickyNote className="h-5 w-5 mr-2" />
                                        Additional Notes
                                      </h3>
                                      <p className="text-gray-700 whitespace-pre-line">{booking.fullDetails.additionalNotes}</p>
                                    </div>
                                  )}
                                  
                                  {/* Payment Information */}
                                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="flex items-center font-medium text-lg mb-3">
                                      <DollarSign className="h-5 w-5 mr-1" />
                                      Payment Information
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div className="p-3 bg-white rounded-md shadow-sm">
                                        <p className="text-sm text-gray-500">Full Amount</p>
                                        <p className="text-xl font-bold">${booking.fullAmount}</p>
                                      </div>
                                      <div className="p-3 bg-white rounded-md shadow-sm">
                                        <p className="text-sm text-gray-500">Advanced Payment</p>
                                        <p className="text-xl font-bold text-green-600">${booking.advanceAmount}</p>
                                      </div>
                                      <div className="p-3 bg-blue-50 rounded-md shadow-sm">
                                        <p className="text-sm text-gray-500">Balance Due</p>
                                        <p className="text-xl font-bold text-blue-600">${booking.fullAmount - booking.advanceAmount}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Footer with actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-2 justify-end">
                                  {booking.status === 'pending' && (
                                    <>
                                      <Button 
                                        variant="default" 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleOpenMarkAsPaid(booking)}
                                      >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Mark as Fully Paid
                                      </Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleOpenCancelBooking(booking)}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Booking
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setOpenViewDialog(null)}
                                  >
                                    Close
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {/* Action buttons with proper disabled state */}
                            <Button
                              size="icon"
                              variant="default"
                              className={`h-8 w-8 ${
                                booking.status === 'pending' 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-green-300 cursor-not-allowed'
                              }`}
                              onClick={(e) => booking.status === 'pending' && handleOpenMarkAsPaid(booking, e)}
                              disabled={booking.status !== 'pending'}
                              title={booking.status === 'pending' ? 'Mark as Paid' : 'Cannot mark as paid'}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="destructive"
                              className={`h-8 w-8 ${
                                booking.status === 'pending' 
                                  ? '' 
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              onClick={(e) => booking.status === 'pending' && handleOpenCancelBooking(booking, e)}
                              disabled={booking.status !== 'pending'}
                              title={booking.status === 'pending' ? 'Cancel Booking' : 'Cannot cancel booking'}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="right" 
                      align="start"
                      sideOffset={40}
                      alignOffset={-10}
                      avoidCollisions={true}
                      collisionBoundary={document.body}
                      className="w-96 p-0 shadow-lg border-0 rounded-xl overflow-hidden z-50"
                      style={{ position: 'fixed' }}
                    >
                      {/* Colorful header based on status */}
                      <div className={`
                        p-4 text-white relative
                        ${booking.status === 'pending' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                          booking.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                          'bg-gradient-to-r from-red-500 to-rose-600'}
                      `}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-lg">{booking.packageName}</h4>
                            <p className="text-sm opacity-90">
                              {booking.customerName}
                            </p>
                          </div>
                          <div className="bg-white text-gray-800 font-bold rounded-full h-16 w-16 flex items-center justify-center">
                            ${booking.fullAmount - booking.advanceAmount}
                          </div>
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="mt-2 flex items-center bg-white/20 rounded-md p-1.5 px-3 text-sm">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            <span>{getDaysRemaining(booking.bookingDate)} days until event</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Event details */}
                      <div className="p-4 bg-white space-y-3.5">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="bg-blue-100 p-1.5 rounded-md">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="bg-green-100 p-1.5 rounded-md">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-500">Event Type:</span>
                          <span className="font-medium">{booking.fullDetails.eventType}</span>
                        </div>
                        
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="bg-purple-100 p-1.5 rounded-md mt-0.5">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-2">Location:</span>
                              <span className="font-medium">{booking.fullDetails.eventLocation.name}</span>
                            </div>
                            {booking.fullDetails.eventLocation.mapLink && (
                              <a 
                                href={booking.fullDetails.eventLocation.mapLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center mt-0.5"
                              >
                                <LinkIcon className="h-3 w-3 mr-1" />
                                View on Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="bg-amber-100 p-1.5 rounded-md">
                            <Users className="h-4 w-4 text-amber-600" />
                          </div>
                          <span className="text-gray-500">Crowd Size:</span>
                          <span className="font-medium">{booking.fullDetails.crowdSize} people</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="bg-indigo-100 p-1.5 rounded-md">
                            <Phone className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-medium">{booking.fullDetails.phoneNumber}</span>
                        </div>
                      </div>
                      
                      {/* Payment info footer */}
                      <div className="border-t p-3 bg-gray-50">
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Full Amount</p>
                            <p className="font-medium">${booking.fullAmount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Advanced</p>
                            <p className="font-medium text-green-600">${booking.advanceAmount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Balance</p>
                            <p className="font-medium text-blue-600">${booking.fullAmount - booking.advanceAmount}</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination controls */}
          <div className="p-4 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Payment Confirmation Dialog */}
      <FullPaymentConfirmationDialog
        open={showFullPaymentDialog}
        onOpenChange={setShowFullPaymentDialog}
        booking={selectedBooking}
        onConfirm={handleMarkAsFullyPaid}
      />

      {/* Booking Cancellation Dialog */}
      <BookingCancelDialog
        open={showCancelBookingDialog}
        onOpenChange={setShowCancelBookingDialog}
        booking={selectedBooking}
        onConfirm={handleCancelBooking}
      />

      {/* Add Booking Form Dialog */}
      <AddBookingForm
        open={showAddBookingForm}
        onOpenChange={setShowAddBookingForm}
        onBookingAdded={handleBookingAdded}
      />
    </div>
  );
});