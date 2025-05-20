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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg p-0">
        {/* Colorful header section - make it more compact */}
        <div className={`
          p-4 text-white relative
          ${booking.status === 'pending' ? 'bg-amber-500' : 
            booking.status === 'completed' ? 'bg-blue-500' :
            'bg-red-500'}
        `}>
          <DialogHeader className="text-white p-0">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 px-2 py-0.5 text-xs font-medium bg-white/20 border-0">
                  {booking.status === 'pending' ? 'UPCOMING EVENT' : 
                   booking.status === 'completed' ? 'COMPLETED EVENT' :
                   'CANCELLED EVENT'}
                </Badge>
                <DialogTitle className="text-xl font-bold">
                  Booking {booking.bookingId}
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-1">
                  {booking.packageName} • {formattedDate}
                </DialogDescription>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">${booking.fullAmount}</div>
                <div className="text-white/80 text-xs">
                  ${booking.advanceAmount} advanced payment
                </div>
              </div>
            </div>
            
            {booking.status === 'pending' && (
              <div className="mt-2 flex items-center bg-white/20 rounded-md p-1 pl-2 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="font-medium">
                  {diffDays} {diffDays === 1 ? 'day' : 'days'} until event
                </span>
              </div>
            )}
          </DialogHeader>
        </div>
        
        {/* Content section - make it more compact */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="space-y-3">
              <div className="flex items-center pb-1 mb-1 border-b border-gray-200">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <h3 className="font-semibold text-base">Customer Details</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer Name</p>
                    <p className="font-medium">{booking.fullDetails.nameWithInitial}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <FileText className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">NIC Number</p>
                    <p className="font-medium">{booking.fullDetails.nicNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <Phone className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{booking.fullDetails.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <Mail className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{booking.fullDetails.email}</p>
                  </div>
                </div>
                
                {booking.fullDetails.eventCoordinatorName && (
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event Coordinator</p>
                      <p className="font-medium">{booking.fullDetails.eventCoordinatorName}</p>
                      {booking.fullDetails.eventCoordinatorNumber && (
                        <p className="text-xs text-blue-600">{booking.fullDetails.eventCoordinatorNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-center pb-1 mb-1 border-b border-gray-200">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <h3 className="font-semibold text-base">Event Details</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Package</p>
                    <p className="font-medium">{booking.packageName}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <FileText className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Event Type</p>
                    <p className="font-medium">{booking.fullDetails.eventType}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Event Location</p>
                    <p className="font-medium">{booking.fullDetails.eventLocation.name}</p>
                    {booking.fullDetails.eventLocation.mapLink && (
                      <a 
                        href={booking.fullDetails.eventLocation.mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center mt-1 text-xs"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Crowd Size</p>
                    <p className="font-medium">{booking.fullDetails.crowdSize} people</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1.5 rounded-md mr-2 flex-shrink-0">
                    <Home className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium">{booking.fullDetails.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Notes Section */}
          {booking.fullDetails.additionalNotes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
              <h3 className="flex items-center font-medium text-base mb-2 text-amber-800">
                <StickyNote className="h-4 w-4 mr-1" />
                Additional Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-line text-sm">{booking.fullDetails.additionalNotes}</p>
            </div>
          )}
          
          {/* Payment Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
            <h3 className="flex items-center font-medium text-base mb-2">
              <DollarSign className="h-4 w-4 mr-1" />
              Payment Information
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <p className="text-xs text-gray-500">Full Amount</p>
                <p className="text-base font-bold">${booking.fullAmount}</p>
              </div>
              <div className="p-2 bg-white rounded-md shadow-sm">
                <p className="text-xs text-gray-500">Advanced</p>
                <p className="text-base font-bold text-green-600">${booking.advanceAmount}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md shadow-sm">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-base font-bold text-blue-600">${booking.fullAmount - booking.advanceAmount}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with actions - make buttons more compact */}
        <DialogFooter className="flex-col sm:flex-row gap-2 px-4 py-3 border-t bg-gray-50">
          {booking.status === 'pending' && (
            <>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 h-9 text-sm"
                onClick={handleMarkAsPaid}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark Paid
              </Button>
              <Button 
                variant="destructive"
                className="h-9 text-sm"
                onClick={handleCancelBooking}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-9 text-sm"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) };