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
import { CreditCard, DollarSign, Check } from "lucide-react";

interface FullPaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  onConfirm: () => void;
}

export const FullPaymentConfirmationDialog: React.FC<FullPaymentConfirmationDialogProps> = ({
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
          <DialogTitle className="text-xl flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            Confirm Full Payment
          </DialogTitle>
          <DialogDescription>
            Please confirm that the customer has paid the full balance amount for this booking.
            This action will mark the booking as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2 text-blue-800">Booking Information</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-blue-700">Booking ID:</span>
              <span className="font-medium">{booking.bookingId}</span>
              
              <span className="text-blue-700">Customer:</span>
              <span className="font-medium">{booking.customerName}</span>
              
              <span className="text-blue-700">Package:</span>
              <span className="font-medium">{booking.packageName}</span>
              
              <span className="text-blue-700">Date:</span>
              <span className="font-medium">{booking.bookingDate.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium mb-2 flex items-center text-green-800">
              <DollarSign className="h-4 w-4 mr-1" />
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-green-700">Full Amount:</span>
              <span className="font-medium">${booking.fullAmount}</span>
              
              <span className="text-green-700">Already Paid:</span>
              <span className="font-medium">${booking.advanceAmount}</span>
              
              <span className="text-green-700 font-medium">Balance Due:</span>
              <span className="font-bold">${booking.fullAmount - booking.advanceAmount}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};