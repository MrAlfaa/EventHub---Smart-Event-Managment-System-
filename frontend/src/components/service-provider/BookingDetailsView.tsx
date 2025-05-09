
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Mail, Users, Package } from "lucide-react";
import { toast } from "sonner";

interface BookingDetailsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number | null;
}

export const BookingDetailsView = ({ open, onOpenChange, bookingId }: BookingDetailsViewProps) => {
  if (!bookingId) return null;
  
  // In a real app, this would fetch booking details based on bookingId
  const bookingDetails = {
    id: `#${1000 + bookingId}`,
    customer: `Customer Name ${bookingId}`,
    email: `customer${bookingId}@example.com`,
    phone: `+1 555-${String(bookingId).padStart(3, '0')}-${String(bookingId * 1111).padStart(4, '0')}`,
    packageName: bookingId % 2 === 0 ? 'Wedding Deluxe' : 'Corporate Event',
    date: new Date(Date.now() + (bookingId * 86400000)).toLocaleDateString(),
    time: '3:00 PM - 9:00 PM',
    location: `${bookingId * 123} Main Street, Cityville`,
    amount: `$${800 + (bookingId * 100)}`,
    guestCount: 50 + (bookingId * 10),
    status: bookingId % 3 === 0 ? 'pending' : bookingId % 3 === 1 ? 'completed' : 'cancelled',
    notes: "Client requested special arrangements for the event. Follow-up needed regarding menu preferences.",
  };
  
  const handleCancelBooking = () => {
    // In a real app, this would make an API call to cancel the booking
    toast.success(`Booking ${bookingDetails.id} has been cancelled`);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Booking Details {bookingDetails.id}</DialogTitle>
          <DialogDescription>
            View detailed information about this booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="font-medium text-lg mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-medium w-24">Name:</span>
                <span>{bookingDetails.customer}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{bookingDetails.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{bookingDetails.phone}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{bookingDetails.guestCount} guests</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Event Details</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                <span>{bookingDetails.packageName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{bookingDetails.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{bookingDetails.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{bookingDetails.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Payment Information</h3>
          <div className="flex justify-between items-center">
            <span>Total Amount:</span>
            <span className="text-lg font-bold">{bookingDetails.amount}</span>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Status</h3>
          <span className={`px-3 py-1 text-sm rounded-full ${
            bookingDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            bookingDetails.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
          </span>
        </div>
        
        {bookingDetails.notes && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Additional Notes</h3>
            <p className="text-sm text-gray-600">{bookingDetails.notes}</p>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {bookingDetails.status === 'pending' && (
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
