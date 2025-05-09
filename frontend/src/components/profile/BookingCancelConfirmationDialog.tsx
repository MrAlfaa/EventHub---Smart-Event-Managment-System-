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
import { AlertTriangle, Calendar, Package } from "lucide-react";
import { BookingDetails } from "./BookingDetailsDialog";

interface BookingCancelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDetails | null;
  onConfirm: () => void;
}

export const BookingCancelConfirmationDialog: React.FC<BookingCancelConfirmationDialogProps> = ({
  open,
  onOpenChange,
  booking,
  onConfirm
}) => {
  if (!booking) return null;

  // Parse the event date string to a Date object
  const eventDate = new Date(booking.eventDate);
  
  // Format date for display
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <h3 className="font-medium mb-3 text-red-800">Booking Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-white p-1.5 rounded-full mr-3">
                  <Package className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Package</p>
                  <p className="font-medium">{booking.packageName}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-1.5 rounded-full mr-3">
                  <Calendar className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Event Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 p-3 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> According to our cancellation policy, you will receive a full refund if your cancellation is more than 30 days before the event, 50% refund if it's between 15-30 days before, and no refund if less than 15 days before the event.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-300"
          >
            Keep Booking
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
          >
            Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};