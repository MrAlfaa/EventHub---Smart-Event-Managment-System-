import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Filter } from "lucide-react";
import { BookingHoverCard } from "./BookingHoverCard";
import { BookingDetailsDialog } from "./BookingDetailsDialog";
import { BookingCancelDialog } from "./BookingCancelDialog";
import { toast } from "sonner";
import providerBookingService from "@/services/providerBookingService";
import { cn } from "@/lib/utils";

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
      
      // Log the exact data we received
      console.log("BookingsDetailsTab received data:", JSON.stringify(data).substring(0, 200) + "...");
      
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
      
      // Show a more informative error toast
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
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-500 text-white";
      case 'confirmed':
        return "bg-blue-500 text-white";
      case 'completed':
        return "bg-green-500 text-white";
      case 'cancelled':
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No bookings match your search" : "No bookings found"}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-4 py-2 bg-gray-100 rounded-t-md hidden lg:grid">
            <div className="text-sm font-semibold">ID</div>
            <div className="text-sm font-semibold">Customer</div>
            <div className="text-sm font-semibold text-right">Amount</div>
            <div className="text-sm font-semibold text-center">Status</div>
            <div className="text-sm font-semibold text-right">Actions</div>
          </div>

          {/* Booking list */}
          {filteredBookings.map((booking) => (
            <BookingHoverCard key={booking.bookingId} booking={booking}>
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto_auto_auto] gap-2 lg:gap-x-4 p-4 bg-white rounded-md shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                {/* Booking ID */}
                <div className="flex lg:flex-col lg:items-start justify-between">
                  <div className="font-mono text-xs text-gray-500 lg:mb-1">#{booking.bookingId.slice(-6)}</div>
                  <div className="lg:hidden text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {booking.bookingDate.toLocaleDateString()}
                  </div>
                </div>
                
                {/* Customer info */}
                <div className="mt-1 lg:mt-0">
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="text-sm text-gray-500 truncate">{booking.packageName}</div>
                  <div className="text-xs text-gray-400 hidden lg:block">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {booking.bookingDate.toLocaleDateString()}
                  </div>
                </div>
                
                {/* Amount */}
                <div className="mt-2 lg:mt-0 flex flex-col items-end">
                  <div className="font-semibold">{formatCurrency(booking.fullAmount)}</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(booking.advanceAmount)} paid
                  </div>
                </div>
                
                {/* Status */}
                <div className="mt-2 lg:mt-0 flex justify-end lg:justify-center">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusBadge(booking.status)
                  )}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="mt-3 lg:mt-0 flex justify-end gap-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="px-3 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    View
                  </button>
                  
                  {booking.status === "pending" && canCancelBooking(booking.bookingDate) && (
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </BookingHoverCard>
          ))}
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
