import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X, AlertTriangle, Eye } from "lucide-react";
import { BookingDetailsDialog, BookingDetails } from "./BookingDetailsDialog";
import { BookingCancelConfirmationDialog } from "./BookingCancelConfirmationDialog";
import { toast } from "sonner";

interface Booking {
  id: string;
  providerName: string;
  services: string[];
  date: string;
  status: string;
  total: number;
}

interface BookingsTabProps {
  bookings: Booking[];
}

export const BookingsTab = ({ bookings }: BookingsTabProps) => {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [bookingsState, setBookingsState] = useState<Booking[]>(bookings);

  const handleViewDetails = (booking: Booking) => {
    // Convert the simplified booking object to the detailed format needed for the dialog
    // In a real app, you'd fetch these details from an API based on the booking ID
    const detailedBooking: BookingDetails = {
      id: booking.id,
      packageName: booking.services.join(", "),
      packagePrice: booking.total,
      providerName: booking.providerName,
      providerBusinessName: `${booking.providerName} Events`,
      providerContactNumber: "+94 77 123 4567",  // Sample data
      providerContactEmail: `${booking.providerName.toLowerCase().replace(/\s/g, '')}@eventshub.lk`,
      providerAddress: "123 Event Street, Colombo, Sri Lanka",  // Sample data
      bookingDate: new Date().toLocaleDateString(),  // Current date as booking date
      eventOrganizerName: "John Doe",  // Sample data
      organizerNIC: "991234567V",  // Sample data
      organizerContactNumber: "+94 71 987 6543",  // Sample data
      organizerAddress: "456 Customer Lane, Colombo, Sri Lanka",  // Sample data
      eventLocation: "Grand Ballroom, Hilton Colombo",  // Sample data
      crowdSize: 150,  // Sample data
      eventDate: booking.date,
      eventType: "Wedding",  // Sample data
      specialNotes: "Please arrange for additional lighting equipment and ensure the sound system is tested before the event.",  // Sample data
    };
    
    setSelectedBooking(detailedBooking);
    setIsDetailsDialogOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    // Create the detailed booking object
    const detailedBooking: BookingDetails = {
      id: booking.id,
      packageName: booking.services.join(", "),
      packagePrice: booking.total,
      providerName: booking.providerName,
      providerBusinessName: `${booking.providerName} Events`,
      providerContactNumber: "+94 77 123 4567", 
      providerContactEmail: `${booking.providerName.toLowerCase().replace(/\s/g, '')}@eventshub.lk`,
      providerAddress: "123 Event Street, Colombo, Sri Lanka",
      bookingDate: new Date().toLocaleDateString(),
      eventOrganizerName: "John Doe",
      organizerNIC: "991234567V",
      organizerContactNumber: "+94 71 987 6543",
      organizerAddress: "456 Customer Lane, Colombo, Sri Lanka",
      eventLocation: "Grand Ballroom, Hilton Colombo",
      crowdSize: 150,
      eventDate: booking.date,
      eventType: "Wedding",
      specialNotes: "Please arrange for additional lighting equipment and ensure the sound system is tested before the event.",
    };
    
    
    setSelectedBooking(detailedBooking);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (!selectedBooking) return;
    
    // In a real app, you'd make an API call to cancel the booking
    // For now, we'll update the local state
    setBookingsState(prevBookings => 
      prevBookings.map(booking => 
        booking.id === selectedBooking.id
          ? { ...booking, status: 'cancelled' }
          : booking
      )
    );
    
    // Show success message
    toast.success("Booking cancelled successfully", {
      description: "You'll receive a confirmation email shortly with refund details.",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
    });
    
    // Close the dialog
    setIsCancelDialogOpen(false);
  };

  // Check if a booking can be cancelled (more than 2 weeks before the event)
  const canCancelBooking = (date: string): boolean => {
    const eventDate = new Date(date);
    const today = new Date();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    
    // Return true if event date is more than 2 weeks away
    return eventDate.getTime() - today.getTime() > twoWeeksMs;
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-6 text-xl font-semibold">Your Bookings</h2>
          <div className="space-y-6">
            {bookingsState.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{booking.providerName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar size={14} className="mr-1" />
                      {booking.date}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {booking.services.map((service, idx) => (
                        <Badge key={idx} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      booking.status === 'completed' ? 'bg-green-500' : 
                      booking.status === 'cancelled' ? 'bg-red-500' : 
                      'bg-blue-500'
                    }>
                      {booking.status === 'completed' ? 'Completed' : 
                       booking.status === 'cancelled' ? 'Cancelled' : 
                       'Upcoming'}
                    </Badge>
                    <p className="mt-2 font-medium">
                      LKR {booking.total.toLocaleString()}
                    </p>
                    <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                        className="flex items-center"
                      >
                        <Eye size={14} className="mr-1" />
                        View Details
                      </Button>
                      
                      {booking.status === 'upcoming' && canCancelBooking(booking.date) && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                          className="flex items-center"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog 
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        booking={selectedBooking}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <BookingCancelConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        booking={selectedBooking}
        onConfirm={confirmCancelBooking}
      />
    </>
  );
};
