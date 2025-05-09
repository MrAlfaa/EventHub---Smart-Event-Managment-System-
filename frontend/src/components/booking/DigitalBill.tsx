import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, CheckCircle, Download, Printer, Copy, Share2, Ticket } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface DigitalBillProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingDetails: {
    fullName: string;
    email: string;
    phone: string;
    packageName: string;
    eventType: string;
    eventDate: Date;
    eventLocation: string;
    crowdSize: number;
    totalAmount: number;
    advancedAmount: number;
    currency: string;
  };
  paymentDetails: {
    lastFourDigits: string;
    cardName: string;
    paymentDate: Date;
  };
}

const DigitalBill: React.FC<DigitalBillProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
  paymentDetails
}) => {
  
  // Reference to the receipt element for PDF generation
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Generate booking reference
  const bookingReference = React.useMemo(() => {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datePart = format(new Date(), 'yyMMdd');
    return `EH${datePart}${randomChars}`;
  }, []);
  
  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'PPP');
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };
  
  // Format payment method
  const formatPaymentMethod = (lastFour: string) => {
    return `•••• •••• •••• ${lastFour}`;
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleCopy = () => {
    // Create a text representation of the receipt
    const receiptText = `
    BOOKING CONFIRMATION
    Reference: ${bookingReference}
    
    CUSTOMER DETAILS
    Name: ${bookingDetails.fullName}
    Email: ${bookingDetails.email}
    Phone: ${bookingDetails.phone}
    
    BOOKING DETAILS
    Package: ${bookingDetails.packageName}
    Event Type: ${bookingDetails.eventType}
    Event Date: ${formatDate(bookingDetails.eventDate)}
    Event Location: ${bookingDetails.eventLocation}
    Crowd Size: ${bookingDetails.crowdSize} people
    
    PAYMENT DETAILS
    Total Amount: ${formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}
    Advanced Payment: ${formatCurrency(bookingDetails.advancedAmount, bookingDetails.currency)}
    Balance Due: ${formatCurrency(bookingDetails.totalAmount - bookingDetails.advancedAmount, bookingDetails.currency)}
    Payment Method: Card ending in ${paymentDetails.lastFourDigits}
    Payment Date: ${formatDate(paymentDetails.paymentDate)}
    
    Thank you for booking with EventHub!
    `;
    
    navigator.clipboard.writeText(receiptText);
    toast({
      title: "Receipt copied",
      description: "Receipt details copied to clipboard"
    });
  };
  
  const handleDownload = () => {
    try {
      // Create a printable version of the receipt in a new window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Pop-up blocked",
          description: "Please allow pop-ups to download the receipt as PDF",
          variant: "destructive",
        });
        return;
      }
      
      // Generate HTML content for the receipt
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>EventHub Receipt - ${bookingReference}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .receipt-header {
              background: linear-gradient(to right, #1e40af, #1e3a8a);
              color: white;
              padding: 20px;
              display: flex;
              justify-content: space-between;
            }
            .receipt-body {
              padding: 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 0.8rem;
              text-transform: uppercase;
              color: #666;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .field-label {
              font-size: 0.85rem;
              color: #666;
            }
            .field-value {
              font-weight: 500;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .reference-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .reference-circle {
              width: 100px;
              height: 100px;
              background-color: #e6f0ff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.5rem;
              color: #1e40af;
              margin-bottom: 10px;
            }
            .reference-id {
              font-family: monospace;
              font-size: 1.2rem;
              font-weight: 600;
              color: #1e40af;
            }
            .footer {
              text-align: center;
              font-size: 0.8rem;
              color: #666;
              margin-top: 25px;
              padding-top: 25px;
              border-top: 1px solid #eee;
            }
            /* Print-specific styles */
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <h2>EventHub Receipt</h2>
            <p>Click the button below or use Ctrl+P (Cmd+P on Mac) to save as PDF</p>
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">
              Save as PDF
            </button>
          </div>
          
          <div class="receipt">
            <div class="receipt-header">
              <div>
                <h2 style="margin: 0; font-size: 1.5rem;">EventHub</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Digital Receipt</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.85rem; opacity: 0.8;">Booking Reference</div>
                <div style="font-family: monospace; font-size: 1.2rem; letter-spacing: 0.05rem;">${bookingReference}</div>
              </div>
            </div>
            
            <div class="receipt-body">
              <!-- Customer details -->
              <div class="section">
                <h3 class="section-title">Customer Details</h3>
                <div class="grid">
                  <div>
                    <div class="field-label">Name</div>
                    <div class="field-value">${bookingDetails.fullName}</div>
                  </div>
                  <div>
                    <div class="field-label">Email</div>
                    <div class="field-value">${bookingDetails.email}</div>
                  </div>
                  <div>
                    <div class="field-label">Phone</div>
                    <div class="field-value">${bookingDetails.phone}</div>
                  </div>
                  <div>
                    <div class="field-label">Payment Date</div>
                    <div class="field-value">${formatDate(paymentDetails.paymentDate)}</div>
                  </div>
                </div>
              </div>
              
              <!-- Booking details -->
              <div class="section">
                <h3 class="section-title">Booking Details</h3>
                <div class="grid">
                  <div>
                    <div class="field-label">Package</div>
                    <div class="field-value">${bookingDetails.packageName}</div>
                  </div>
                  <div>
                    <div class="field-label">Event Type</div>
                    <div class="field-value">${bookingDetails.eventType}</div>
                  </div>
                  <div>
                    <div class="field-label">Event Date</div>
                    <div class="field-value">${formatDate(bookingDetails.eventDate)}</div>
                  </div>
                  <div>
                    <div class="field-label">Crowd Size</div>
                    <div class="field-value">${bookingDetails.crowdSize} people</div>
                  </div>
                  <div style="grid-column: span 2;">
                    <div class="field-label">Event Location</div>
                    <div class="field-value">${bookingDetails.eventLocation}</div>
                  </div>
                </div>
              </div>
              
              <!-- Payment details -->
              <div class="section">
                <h3 class="section-title">Payment Details</h3>
                <div>
                  <div class="payment-row">
                    <span style="color: #555;">Total Package Price:</span>
                    <span style="font-weight: 500;">${formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}</span>
                  </div>
                  <div class="payment-row">
                    <span style="color: #555;">Advanced Payment (20%):</span>
                    <span style="font-weight: 500; color: #15803d;">${formatCurrency(bookingDetails.advancedAmount, bookingDetails.currency)}</span>
                  </div>
                  <div class="payment-row" style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
                    <span style="font-weight: 500;">Balance Due (Before event):</span>
                    <span style="font-weight: 700;">${formatCurrency(bookingDetails.totalAmount - bookingDetails.advancedAmount, bookingDetails.currency)}</span>
                  </div>
                  <div class="payment-row" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9rem;">
                    <span style="color: #555;">Payment Method:</span>
                    <span>•••• •••• •••• ${paymentDetails.lastFourDigits}</span>
                  </div>
                </div>
              </div>
              
              <!-- Booking reference section -->
              <div class="reference-box">
                <div class="reference-circle">
                  🎫
                </div>
                <div class="reference-id">${bookingReference}</div>
                <p style="font-size: 0.75rem; color: #666; margin: 5px 0 0 0;">Reference ID for your booking</p>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p style="margin: 0 0 5px 0;">Thank you for booking with EventHub!</p>
                <p style="margin: 0;">If you have any questions, please contact us at support@eventhub.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Write the content to the new window
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Focus on the new window
      printWindow.focus();
      
      // Show success toast
      toast({
        title: "PDF Ready",
        description: "Use the print dialog to save as PDF",
      });
    } catch (error) {
      console.error("Error generating PDF receipt:", error);
      toast({
        title: "Download failed",
        description: "Failed to generate PDF receipt. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Receipt className="mr-2 h-5 w-5" />
            Booking Confirmation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Success message */}
          <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3 border border-green-100">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Payment Successful</h3>
              <p className="text-sm text-green-600">Your booking has been confirmed. A confirmation has been sent to your email.</p>
            </div>
          </div>
          
          {/* Digital receipt */}
          <div className="border rounded-lg overflow-hidden print:border-none" id="digital-receipt" ref={receiptRef}>
            {/* Receipt header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white print:bg-blue-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">EventHub</h2>
                  <p className="text-blue-100">Digital Receipt</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Booking Reference</div>
                  <div className="font-mono text-lg tracking-wide">{bookingReference}</div>
                </div>
              </div>
            </div>
            
            {/* Receipt content */}
            <div className="p-5 bg-white">
              {/* Customer details */}
              <div className="mb-6">
                <h3 className="text-sm uppercase text-gray-500 border-b pb-1 mb-3">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{bookingDetails.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{bookingDetails.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{bookingDetails.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payment Date</div>
                    <div className="font-medium">{formatDate(paymentDetails.paymentDate)}</div>
                  </div>
                </div>
              </div>
              
              {/* Booking details */}
              <div className="mb-6">
                <h3 className="text-sm uppercase text-gray-500 border-b pb-1 mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Package</div>
                    <div className="font-medium">{bookingDetails.packageName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Event Type</div>
                    <div className="font-medium">{bookingDetails.eventType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Event Date</div>
                    <div className="font-medium">{formatDate(bookingDetails.eventDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Crowd Size</div>
                    <div className="font-medium">{bookingDetails.crowdSize} people</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Event Location</div>
                    <div className="font-medium">{bookingDetails.eventLocation}</div>
                  </div>
                </div>
              </div>
              
              {/* Payment details */}
              <div className="mb-6">
                <h3 className="text-sm uppercase text-gray-500 border-b pb-1 mb-3">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Package Price:</span>
                    <span className="font-medium">{formatCurrency(bookingDetails.totalAmount, bookingDetails.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advanced Payment (20%):</span>
                    <span className="font-medium text-green-700">{formatCurrency(bookingDetails.advancedAmount, bookingDetails.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium">Balance Due (Before event):</span>
                    <span className="font-bold">{formatCurrency(bookingDetails.totalAmount - bookingDetails.advancedAmount, bookingDetails.currency)}</span>
                  </div>
                  <div className="flex justify-between mt-4 pt-3 border-t text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{formatPaymentMethod(paymentDetails.lastFourDigits)}</span>
                  </div>
                </div>
              </div>
              
              {/* Booking reference section */}
              <div className="flex items-center justify-center border-t pt-5">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <Ticket className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="mt-2 font-mono text-lg tracking-wide font-semibold text-blue-800">{bookingReference}</div>
                  <p className="text-xs text-gray-500 mt-1">Reference ID for your booking</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t">
                <p>Thank you for booking with EventHub!</p>
                <p>If you have any questions, please contact us at support@eventhub.com</p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap justify-between gap-3 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="flex items-center text-gray-600"
                onClick={handlePrint}
                type="button"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center text-gray-600"
                onClick={handleCopy}
                type="button"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center text-gray-600"
                onClick={handleDownload}
                type="button"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center text-gray-600"
                type="button"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            <Button 
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DigitalBill;