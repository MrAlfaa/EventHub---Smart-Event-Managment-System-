import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, Mail, User, CreditCard, Users, FileText } from "lucide-react";

// Define a more comprehensive booking interface with all the details needed
export interface BookingDetails {
  id: string;
  packageName: string;
  packagePrice: number;
  providerName: string;
  providerBusinessName: string;
  providerContactNumber: string;
  providerContactEmail: string;
  providerAddress: string;
  bookingDate: string;
  eventOrganizerName: string;
  organizerNIC: string;
  organizerContactNumber: string;
  organizerAddress: string;
  eventLocation: string;
  crowdSize: number;
  eventDate: string;
  eventType: string;
  specialNotes?: string;
  status?: string;  // Add this property
  createdAt?: string;  // Add this property
  cancelledAt?: string;  // Add this property
}

interface BookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
}

export const BookingDetailsDialog = ({ isOpen, onClose, booking }: BookingDetailsDialogProps) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Booking Details</DialogTitle>
          <DialogDescription>
            Complete information about your booking with {booking.providerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Package Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Package Name</p>
                <p className="font-medium">{booking.packageName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Package Price</p>
                <p className="font-medium">LKR {(booking.packagePrice || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Date</p>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.bookingDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Status</p>
                <p className="font-medium">
                  {booking.status === 'pending' ? 'Pending' : 
                   booking.status === 'confirmed' ? 'Confirmed' : 
                   booking.status === 'completed' ? 'Completed' : 
                   booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                </p>
              </div>
              {booking.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Booking Created</p>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-muted-foreground" />
                    <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {booking.status === 'cancelled' && booking.cancelledAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled On</p>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-muted-foreground" />
                    <p>{new Date(booking.cancelledAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Provider Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Service Provider Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Provider Name</p>
                <p className="font-medium">{booking.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{booking.providerBusinessName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <div className="flex items-center">
                  <Phone size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.providerContactNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <div className="flex items-center">
                  <Mail size={16} className="mr-1 text-muted-foreground" />
                  <p className="break-all">{booking.providerContactEmail}</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-muted-foreground shrink-0" />
                  <p>{booking.providerAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Organizer Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Event Organizer Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Organizer Name</p>
                <div className="flex items-center">
                  <User size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.eventOrganizerName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIC Number</p>
                <p className="font-medium">{booking.organizerNIC}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <div className="flex items-center">
                  <Phone size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.organizerContactNumber}</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-muted-foreground shrink-0" />
                  <p>{booking.organizerAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Event Details</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Event Location</p>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-muted-foreground shrink-0" />
                  <p>{booking.eventLocation}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Event Date</p>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.eventDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Event Type</p>
                <p className="font-medium">{booking.eventType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crowd Size</p>
                <div className="flex items-center">
                  <Users size={16} className="mr-1 text-muted-foreground" />
                  <p>{booking.crowdSize} people</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Notes Section (if available) */}
          {booking.specialNotes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">Special Notes</h3>
              <div className="flex items-start">
                <FileText size={16} className="mr-1 text-muted-foreground mt-1 shrink-0" />
                <p className="text-sm">{booking.specialNotes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};