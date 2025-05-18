import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Eye, XCircle, DollarSign, Check, Clock, AlertCircle } from "lucide-react";
import { BookingHoverCard } from "./BookingHoverCard";
import { BookingDetailsDialog } from "./BookingDetailsDialog";
import { BookingCancelDialog } from "./BookingCancelDialog";
import { toast } from "sonner";
import providerBookingService from "@/services/providerBookingService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface BookingData {
  bookingId: string;
  customerName: string;
  packageName: string;
  bookingDate: Date;
  advanceAmount: number;
  fullAmount: number;
  status: string;
  fullDetails: {
    nameWithInitial: string;
    nicNumber: string;
    phoneNumber: string;
    email: string;
    eventType: string;
    crowdSize: number;
    eventLocation: {
      name: string;
      mapLink: string | null;
    };
    address: string;
    eventCoordinatorName: string | null;
    eventCoordinatorNumber: string | null;
    additionalNotes: string | null;
  };
}

interface BookingsDetailsTabProps {
  filter: string;
}

export const BookingsDetailsTab = forwardRef<
  { handleBookingAdded: (booking: BookingData) => void },
  BookingsDetailsTabProps
>(({ filter }, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Expose functions to parent component via ref
  useImperativeHandle(ref, () => ({
    handleBookingAdded: (booking: BookingData) => {
      setBookings(prev => [booking, ...prev]);
    }
  }));

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings when filter prop changes
  useEffect(() => {
    if (bookings.length > 0) {
      filterBookings();
    }
  }, [filter, bookings, searchTerm]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      console.log("Starting to fetch provider bookings...");
      const data = await providerBookingService.getProviderBookings();
      
      if (Array.isArray(data)) {
        console.log(`Received ${data.length} bookings`);
        setBookings(data);
        
        if (data.length === 0) {
          // This is normal for new providers
          toast.info("No bookings found. Bookings will appear here when customers make reservations.", {
            duration: 5000
          });
        }
      } else {
        console.warn("Received non-array data:", data);
        setBookings([]);
        toast.warning("Unexpected data format received. Contact support if this persists.");
      }
    } catch (error) {
      console.error("Error in fetchBookings:", error);
      setBookings([]);
      
      toast.error("Failed to load bookings. This could be due to network issues or you may need to log in again.", {
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(booking => booking.status === filter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customerName.toLowerCase().includes(search) || 
        booking.packageName.toLowerCase().includes(search) ||
        booking.bookingId.toLowerCase().includes(search)
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleCancelBooking = (booking: BookingData) => {
    // Only proceed if the booking can be cancelled
    if (canCancelBooking(booking.bookingDate) && booking.status === "pending") {
      setSelectedBooking(booking);
      setIsCancelDialogOpen(true);
    } else {
      // Show message explaining why cancellation isn't allowed
      if (!canCancelBooking(booking.bookingDate)) {
        toast.error("Bookings can only be cancelled within 12 hours of creation");
      } else {
        toast.error(`Cannot cancel a booking with ${booking.status} status`);
      }
    }
  };

  const onConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      await providerBookingService.cancelProviderBooking(selectedBooking.bookingId);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.bookingId === selectedBooking.bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      toast.success("Booking cancelled successfully");
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel booking");
    }
  };

  const handleMarkAsPaid = async (booking: BookingData) => {
    // Only proceed if the booking can be marked as paid
    if (booking.status === "pending" && booking.advanceAmount < booking.fullAmount) {
      try {
        await providerBookingService.markBookingAsPaid(booking.bookingId);
        
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b.bookingId === booking.bookingId
              ? { ...b, status: 'confirmed', advanceAmount: b.fullAmount }
              : b
          )
        );
        
        toast.success("Booking marked as fully paid");
        setIsDetailsDialogOpen(false);
      } catch (error: any) {
        console.error("Error marking booking as paid:", error);
        toast.error(error.response?.data?.detail || "Failed to mark as paid");
      }
    } else {
      // Show message explaining why marking as paid isn't allowed
      if (booking.status !== "pending") {
        toast.error(`Cannot mark a ${booking.status} booking as paid`);
      } else {
        toast.info("This booking is already fully paid");
      }
    }
  };

  // Check if a booking is within 12 hours to enable/disable cancel button
  const canCancelBooking = (date: Date): boolean => {
    const bookingTime = date.getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - bookingTime) / (1000 * 60 * 60);
    
    return hoursDifference <= 12;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} LKR`;
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3.5 w-3.5 mr-1.5" />;
      case 'confirmed':
        return <Check className="h-3.5 w-3.5 mr-1.5" />;
      case 'completed':
        return <Check className="h-3.5 w-3.5 mr-1.5" />;
      case 'cancelled':
        return <XCircle className="h-3.5 w-3.5 mr-1.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 mr-1.5" />;
    }
  };

  // Get status text color
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "text-amber-700";
      case 'confirmed':
        return "text-blue-700";
      case 'completed':
        return "text-green-700";
      case 'cancelled':
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            className="pl-9 border-gray-300 focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading your bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm ? "No bookings match your search" : "No bookings found"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? "Try a different search term or clear the search field."
              : "When customers make bookings, they will appear here. You'll be notified for new bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-[0.8fr_1.5fr_0.8fr_0.6fr_0.8fr] gap-x-4 px-6 py-3 bg-gray-100 rounded-t-md hidden lg:grid">
            <div className="text-sm font-medium text-gray-600">ID</div>
            <div className="text-sm font-medium text-gray-600">Customer & Package</div>
            <div className="text-sm font-medium text-gray-600 text-right">Amount</div>
            <div className="text-sm font-medium text-gray-600">Status</div>
            <div className="text-sm font-medium text-gray-600 text-right">Actions</div>
          </div>

          {/* Booking list */}
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingHoverCard key={booking.bookingId} booking={booking}>
                <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.5fr_0.8fr_0.6fr_0.8fr] gap-x-4 gap-y-3 p-4">
                    {/* Column 1: Booking ID */}
                    <div className="flex justify-between lg:block">
                      <div>
                        <div className="lg:hidden text-xs text-gray-500 mb-1">Booking ID</div>
                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-md inline-block">
                          #{booking.bookingId.slice(-6)}
                        </div>
                      </div>
                      <div className="lg:hidden">
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <div className="text-sm flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Column 2: Customer details */}
                    <div>
                      <div className="lg:hidden text-xs text-gray-500 mb-1">Customer</div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{booking.customerName}</span>
                        <span className="text-sm text-gray-600">{booking.packageName}</span>
                        <span className="text-xs text-gray-500 hidden lg:flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Column 3: Payment details */}
                    <div className="flex lg:flex-col lg:items-end">
                      <div className="lg:hidden text-xs text-gray-500 mr-2 mt-1">Amount:</div>
                      <div>
                        <div className="font-medium text-right">{formatCurrency(booking.fullAmount)}</div>
                        <div className="text-xs text-green-600 text-right mt-1">
                          {formatCurrency(booking.advanceAmount)} paid
                        </div>
                      </div>
                    </div>
                                        {/* Column 4: Status - Text only without borders/squares */}
                    <div className="flex lg:justify-start items-center">
                      <div className="lg:hidden text-xs text-gray-500 mr-2 mt-1">Status:</div>
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <span className={cn(
                          "text-sm font-medium",
                          getStatusTextColor(booking.status)
                        )}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Column 5: Actions - Always show buttons but disable based on conditions */}
                    <div className="flex justify-end gap-2 items-center">
                      <TooltipProvider>
                        {/* View Details Button - Always enabled */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(booking);
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Cancel Booking Button - Always shown but disabled if conditions not met */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking);
                              }}
                              variant="ghost"
                              size="icon"
                              disabled={booking.status !== "pending" || !canCancelBooking(booking.bookingDate)}
                              className={cn(
                                "h-8 w-8 rounded-full border",
                                booking.status === "pending" && canCancelBooking(booking.bookingDate)
                                  ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                              )}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {booking.status !== "pending"
                              ? `Cannot cancel a ${booking.status} booking`
                              : !canCancelBooking(booking.bookingDate)
                                ? "Cancellation period (12 hours) has expired"
                                : "Cancel booking"
                            }
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Mark as Fully Paid Button - Always shown but disabled if conditions not met */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsPaid(booking);
                              }}
                              variant="ghost"
                              size="icon"
                              disabled={booking.status !== "pending" || booking.advanceAmount >= booking.fullAmount}
                              className={cn(
                                "h-8 w-8 rounded-full border",
                                booking.status === "pending" && booking.advanceAmount < booking.fullAmount
                                  ? "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                              )}
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {booking.status !== "pending"
                              ? `Cannot mark a ${booking.status} booking as paid`
                              : booking.advanceAmount >= booking.fullAmount
                                ? "This booking is already fully paid"
                                : "Mark as fully paid"
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Mobile view dividers between bookings */}
                  <div className="lg:hidden border-t border-gray-100 mx-4"></div>
                </div>
              </BookingHoverCard>
            ))}
          </div>
        </div>
      )}
      
      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        booking={selectedBooking}
        onMarkPaid={handleMarkAsPaid}
        onCancel={handleCancelBooking}
      />
      
      {/* Booking Cancel Dialog */}
      <BookingCancelDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        booking={selectedBooking}
        onConfirm={onConfirmCancel}
      />
    </div>
  );
});

BookingsDetailsTab.displayName = "BookingsDetailsTab";

