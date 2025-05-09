import React, { useState, useEffect } from 'react';
import { Package } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, MapPin, Users, ChevronRight, CalendarCheck, CreditCard } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentDetailsForm from './PaymentDetailsForm';
import DigitalBill from './DigitalBill';

interface SystemBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package;
}

export const SystemBookingForm: React.FC<SystemBookingFormProps> = ({
  isOpen,
  onClose,
  selectedPackage
}) => {
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorContact, setCoordinatorContact] = useState('');
  const [address, setAddress] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [crowdSize, setCrowdSize] = useState<number | ''>(
    selectedPackage ? selectedPackage.capacity.min : ''
  );
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventType, setEventType] = useState<string>('');
  const [supportedEventTypes, setSupportedEventTypes] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Calculate advanced payment (assumed to be 20% of total package price)
  const advancedPaymentPercentage = 20;
  const advancedPaymentAmount = selectedPackage 
    ? (selectedPackage.price * advancedPaymentPercentage / 100) 
    : 0;
  
  // Load supported event types
  useEffect(() => {
    if (selectedPackage) {
      // In a real app, you would fetch the supported event types for this package from an API
      // For now, we'll use a mock list based on the package's primary event type
      const mockSupportedTypes = getMockEventTypes(selectedPackage.eventType);
      setSupportedEventTypes(mockSupportedTypes);
      // Set default event type to the package's primary type
      setEventType(selectedPackage.eventType);
    }
  }, [selectedPackage]);

  // Mock function to get supported event types based on the package's primary type
  const getMockEventTypes = (primaryType: string): string[] => {
    // These would come from your API in a real application
    const eventTypesMap: Record<string, string[]> = {
      'Wedding': ['Wedding', 'Engagement', 'Anniversary'],
      'Birthday': ['Birthday', 'Graduation', 'Baby Shower'],
      'Conference': ['Conference', 'Corporate Event', 'Seminar', 'Workshop'],
      'Concert': ['Concert', 'Music Festival', 'Live Performance']
    };

    return eventTypesMap[primaryType] || [primaryType];
  };
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!nic.trim()) newErrors.nic = "NIC number is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!address.trim()) newErrors.address = "Address is required";
    if (!eventLocation.trim()) newErrors.eventLocation = "Event location is required";
    if (!eventType) newErrors.eventType = "Event type is required";
    if (!crowdSize) {
      newErrors.crowdSize = "Crowd size is required";
    } else if (
      selectedPackage && 
      (crowdSize < selectedPackage.capacity.min || crowdSize > selectedPackage.capacity.max)
    ) {
      newErrors.crowdSize = `Crowd size must be between ${selectedPackage.capacity.min} and ${selectedPackage.capacity.max}`;
    }
    if (!eventDate) newErrors.eventDate = "Event date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Show payment form instead of closing
      setShowPayment(true);
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (paymentDetails: any) => {
    // Hide payment form and show bill
    setShowPayment(false);
    setShowBill(true);
    
    toast.success("Payment processed successfully!");
  };

  // Handle bill confirmation
  const handleConfirmBill = () => {
    setShowBill(false);
    onClose();
    toast.success("Booking confirmed! Check your email for details.");
  };
  
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  if (!isOpen) return null;
  
  // If payment form should be shown
  if (showPayment) {
    return (
      <PaymentDetailsForm
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={(details) => {
          setPaymentDetails({
            ...details,
            paymentDate: new Date()
          });
          handlePaymentComplete(details);
        }}
        amount={advancedPaymentAmount}
        currency={selectedPackage?.currency || 'LKR'}
      />
    );
  }
  
  // If bill should be shown
  if (showBill && paymentDetails) {
    return (
      <DigitalBill
        isOpen={showBill}
        onClose={() => setShowBill(false)}
        onConfirm={handleConfirmBill}
        bookingDetails={{
          fullName,
          email,
          phone,
          packageName: selectedPackage.name,
          eventType,
          eventDate: eventDate!,
          eventLocation,
          crowdSize: crowdSize as number,
          totalAmount: selectedPackage.price,
          advancedAmount: advancedPaymentAmount,
          currency: selectedPackage.currency || 'LKR'
        }}
        paymentDetails={paymentDetails}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <DialogTitle className="text-2xl font-semibold">Book Your Event Package</DialogTitle>
          <DialogDescription className="text-blue-100">
            Fill in your details to book the {selectedPackage?.name} package.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Package summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <CalendarCheck className="h-4 w-4 text-blue-600" />
                </div>
                Package Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-500">Package Name</span>
                  <span className="font-bold text-gray-900">{selectedPackage?.name}</span>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-500">Event Type</span>
                  <span className="font-bold text-gray-900">{selectedPackage?.eventType}</span>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-500">Full Package Price</span>
                  <span className="font-bold text-blue-800">
                    {formatPrice(selectedPackage?.price || 0, selectedPackage?.currency || 'LKR')}
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-500">Advanced Payment ({advancedPaymentPercentage}%)</span>
                  <span className="font-bold text-green-700">
                    {formatPrice(advancedPaymentAmount, selectedPackage?.currency || 'LKR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Personal Information */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
              <div className="p-2 rounded-full bg-blue-100 mr-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Full Name with Initials <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="e.g., K. A. J. Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.fullName ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nic" className="text-sm">NIC Number <span className="text-red-500">*</span></Label>
                <Input
                  id="nic"
                  placeholder="e.g., 982761234V or 199827600123"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.nic ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.nic && <p className="text-sm text-red-500">{errors.nic}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="e.g., 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.phone ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.email ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
          </div>
          
          {/* Coordinator Information */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
              <div className="p-2 rounded-full bg-purple-100 mr-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              Event Coordinator (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="coordinatorName" className="text-sm">Coordinator Name</Label>
                <Input
                  id="coordinatorName"
                  placeholder="e.g., John Silva"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="bg-gray-50 border focus:bg-white transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coordinatorContact" className="text-sm">Coordinator Contact Number</Label>
                <Input
                  id="coordinatorContact"
                  placeholder="e.g., 0712345678"
                  value={coordinatorContact}
                  onChange={(e) => setCoordinatorContact(e.target.value)}
                  className="bg-gray-50 border focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
              <div className="p-2 rounded-full bg-green-100 mr-2">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              Location Information
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Your Address <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  placeholder="Enter your home/billing address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.address ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventLocation" className="text-sm">Event Location <span className="text-red-500">*</span></Label>
                <Input
                  id="eventLocation"
                  placeholder="e.g., Cinnamon Grand Colombo"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.eventLocation ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                {errors.eventLocation && <p className="text-sm text-red-500">{errors.eventLocation}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mapLink" className="text-sm">Google Maps Link (Optional)</Label>
                <Input
                  id="mapLink"
                  placeholder="e.g., https://maps.google.com/?q=..."
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  className="bg-gray-50 border focus:bg-white transition-colors"
                />
                <p className="text-xs text-gray-500">Providing a map link helps the service provider locate the venue easily.</p>
              </div>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
              <div className="p-2 rounded-full bg-amber-100 mr-2">
                <CalendarCheck className="h-5 w-5 text-amber-600" />
              </div>
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-sm">Event Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <input 
                    type="date"
                    id="eventDate"
                    className={cn(
                      "w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400",
                      errors.eventDate ? "border-red-300 focus:border-red-500" : "bg-gray-50 border focus:bg-white transition-colors"
                    )}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setEventDate(new Date(e.target.value));
                        // Clear error if it exists
                        if (errors.eventDate) {
                          const newErrors = { ...errors };
                          delete newErrors.eventDate;
                          setErrors(newErrors);
                        }
                      }
                    }}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crowdSize" className="text-sm">Crowd Size <span className="text-red-500">*</span></Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="crowdSize"
                    type="number"
                    placeholder="Enter number of guests"
                    value={crowdSize}
                    onChange={(e) => setCrowdSize(e.target.value ? parseInt(e.target.value) : '')}
                    className={cn(
                      "bg-gray-50 border focus:bg-white transition-colors",
                      errors.crowdSize ? "border-red-300 focus:border-red-500" : ""
                    )}
                  />
                  <span className="text-gray-500">People</span>
                </div>
                {errors.crowdSize && <p className="text-sm text-red-500">{errors.crowdSize}</p>}
                {selectedPackage && (
                  <p className="text-xs text-gray-500">
                    This package supports {selectedPackage.capacity.min} to {selectedPackage.capacity.max} people.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-sm">Event Type <span className="text-red-500">*</span></Label>
                <Select onValueChange={setEventType} value={eventType}>
                  <SelectTrigger id="eventType" className={cn(
                    "bg-gray-50 border focus:bg-white transition-colors",
                    errors.eventType ? "border-red-300 focus:border-red-500" : ""
                  )}>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedEventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventType && <p className="text-sm text-red-500">{errors.eventType}</p>}
              </div>
            </div>
          </div>
          
          {/* Special Requirements */}
          <div className="space-y-2 rounded-lg border border-gray-200 p-5">
            <Label htmlFor="specialRequirements" className="text-sm">Special Requirements or Notes (Optional)</Label>
            <Textarea 
              id="specialRequirements" 
              placeholder="Enter any special requirements or notes for your event"
              rows={4}
              className="bg-gray-50 border focus:bg-white transition-colors resize-none"
            />
          </div>
          
          {/* Terms and Payment Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-lg border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-3">Payment Information</h4>
            <div className="space-y-3 text-sm text-amber-700">
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 mr-2">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p>An advance payment of {advancedPaymentPercentage}% ({formatPrice(advancedPaymentAmount, selectedPackage?.currency || 'LKR')}) is required to confirm your booking.</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 mr-2">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p>The remaining balance must be paid 7 days before the event date.</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 mr-2">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p>Cancellation policy: Full refund if cancelled 30 days before the event, 50% refund if cancelled 15-30 days before.</p>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              Proceed to Payment
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemBookingForm;