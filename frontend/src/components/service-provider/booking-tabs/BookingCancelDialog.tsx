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
import { BookingData } from "./BookingsDetailsTab";
import { AlertTriangle, Calendar, User, Package } from "lucide-react";

interface BookingCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  onConfirm: () => void;
}

export const BookingCancelDialog: React.FC<BookingCancelDialogProps> = ({
  open,
  onOpenChange,
  booking,
  onConfirm
}) => {
  if (!booking) return null;

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
                  <p className="text-sm text-red-700">Booking ID</p>
                  <p className="font-medium">{booking.bookingId}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-1.5 rounded-full mr-3">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Customer</p>
                  <p className="font-medium">{booking.customerName}</p>
                </div>
              </div>

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
                  <p className="text-sm text-red-700">Date</p>
                  <p className="font-medium">{booking.bookingDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Canceling this booking might affect your service rating. The customer has already made an advance payment of ${booking.advanceAmount}.
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