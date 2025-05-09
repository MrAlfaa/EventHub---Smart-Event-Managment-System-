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
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Package, 
  CreditCard, 
  Check, 
  X,
  Link as LinkIcon,
  User,
  FileText,
  Home,
  DollarSign,
  StickyNote
} from "lucide-react";
import { toast } from "sonner";
import { BookingData } from "./BookingsDetailsTab";
import { Badge } from "@/components/ui/badge";

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  onMarkPaid: (booking: BookingData) => void;
  onCancel: (booking: BookingData) => void;
}

export const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  booking,
  onMarkPaid,
  onCancel
}) => {
  if (!booking) return null;
  
  const handleMarkAsPaid = () => {
    onMarkPaid(booking);
  };
  
  const handleCancelBooking = () => {
    onCancel(booking);
  };

  // Calculate remaining days until event
  const today = new Date();
  const eventDate = new Date(booking.bookingDate);
  const diffTime = Math.abs(eventDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format date to display
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-xl">
        {/* Colorful header section */}
        <div className={`
          p-6 text-white relative overflow-hidden
          ${booking.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
            booking.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'}
        `}>
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <circle cx="80" cy="20" r="15" />
              <circle cx="10" cy="40" r="5" />
              <circle cx="40" cy="70" r="10" />
              <circle cx="70" cy="50" r="8" />
            </svg>
          </div>
          
          <DialogHeader className="text-white p-0">
            <div className="flex items-center justify-between">
              <div>
                <Badge className={`
                  mb-3 px-3 py-1 text-xs font-medium border-0
                  ${booking.status === 'pending' ? 'bg-white/20' : 
                    booking.status === 'completed' ? 'bg-white/20' :
                    'bg-white/20'}
                `}>
                  {booking.status === 'pending' ? 'UPCOMING EVENT' : 
                   booking.status === 'completed' ? 'COMPLETED EVENT' :
                   'CANCELLED EVENT'}
                </Badge>
                <DialogTitle className="text-2xl font-bold">
                  Booking {booking.bookingId}
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-1">
                  {booking.packageName} • {formattedDate}
                </DialogDescription>
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold">${booking.fullAmount}</div>
                <div className="text-white/80 text-sm">
                  ${booking.advanceAmount} advanced payment
                </div>
              </div>
            </div>
            
            {booking.status === 'pending' && (
              <div className="mt-4 flex items-center bg-white/20 rounded-lg p-2 pl-3">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {diffDays} {diffDays === 1 ? 'day' : 'days'} until event
                </span>
              </div>
            )}
          </DialogHeader>
        </div>
        
        {/* Content section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-5">
              <div className="flex items-center pb-2 mb-2 border-b border-gray-200">
                <User className="h-5 w-5 mr-2 text-gray-500" />
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
                
                {booking.fullDetails.eventCoordinatorName && (
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <User className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event Coordinator</p>
                      <p className="font-medium">{booking.fullDetails.eventCoordinatorName}</p>
                      {booking.fullDetails.eventCoordinatorNumber && (
                        <p className="text-sm text-blue-600">{booking.fullDetails.eventCoordinatorNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Details */}
            <div className="space-y-5">
              <div className="flex items-center pb-2 mb-2 border-b border-gray-200">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <h3 className="font-semibold text-lg">Event Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Package className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium">{booking.packageName}</p>
                  </div>
                </div>
                
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
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Home className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{booking.fullDetails.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Notes Section */}
          {booking.fullDetails.additionalNotes && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h3 className="flex items-center font-medium text-lg mb-3 text-amber-800">
                <StickyNote className="h-5 w-5 mr-1" />
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
        <DialogFooter className="flex-col sm:flex-row gap-2 px-6 py-4 border-t bg-gray-50">
          {booking.status === 'pending' && (
            <>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                onClick={handleMarkAsPaid}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark as Fully Paid
              </Button>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleCancelBooking}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};