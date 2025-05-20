import React, { useState, useEffect } from 'react';
import { Package } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, MapPin, Users, Clock, ChevronRight, CalendarCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package;
  onComplete: (details: any) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onComplete
}) => {
  const { user } = useAuthStore();
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
  
  // Auto-fill user details
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
    }
  }, [user, isOpen]);
  
  // Calculate advanced payment (assumed to be 20% of total package price)
  const advancedPaymentPercentage = 20;
  const advancedPaymentAmount = selectedPackage 
    ? Math.round(selectedPackage.price * advancedPaymentPercentage / 100) 
    : 0;
  
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
      const bookingData = {
        fullName,
        nic,
        phone,
        email,
        coordinatorName,
        coordinatorContact,
        address,
        eventLocation,
        mapLink,
        crowdSize,
        eventDate,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        totalAmount: selectedPackage.price,
        advancedAmount: advancedPaymentAmount,
        currency: selectedPackage.currency || "LKR"
      };

      onComplete(bookingData);
    
      // Show a toast notification
      toast.success(`Booking request sent! The service provider will be notified.`, {
        duration: 5000,
      });
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
  
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b bg-blue-50">
          <DialogTitle className="text-2xl font-semibold text-blue-900">Book Your Event Package</DialogTitle>
          <DialogDescription>
            Please fill in the details below to book the {selectedPackage?.name} package.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6" aria-label="Event Booking Form">
          {/* Package summary */}
          <Card className="bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Package Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Package</Label>
                  <p className="font-semibold">{selectedPackage?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Event Type</Label>
                  <p className="font-semibold">{selectedPackage?.eventType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Full Package Price</Label>
                  <p className="font-semibold text-blue-900">
                    {formatPrice(selectedPackage?.price || 0, selectedPackage?.currency || 'LKR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Advanced Payment ({advancedPaymentPercentage}%)</Label>
                  <p className="font-semibold text-green-700">
                    {formatPrice(advancedPaymentAmount, selectedPackage?.currency || 'LKR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="p-2 rounded-full bg-blue-100 mr-2">
                <Users className="h-5 w-5 text-blue-600" />
              </span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name with Initials <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="e.g., K. A. J. Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                  aria-label="Full Name"
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nic">NIC Number <span className="text-red-500">*</span></Label>
                <Input
                  id="nic"
                  placeholder="e.g., 982761234V or 199827600123"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className={errors.nic ? "border-red-500" : ""}
                  aria-label="NIC Number"
                />
                {errors.nic && <p className="text-sm text-red-500">{errors.nic}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="e.g., 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  aria-label="Phone Number"
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  aria-label="Email Address"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
          </div>
          
          {/* Coordinator Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="p-2 rounded-full bg-purple-100 mr-2">
                <Users className="h-5 w-5 text-purple-600" />
              </span>
              Event Coordinator (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coordinatorName">Coordinator Name</Label>
                <Input
                  id="coordinatorName"
                  placeholder="e.g., John Silva"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  aria-label="Coordinator Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coordinatorContact">Coordinator Contact Number</Label>
                <Input
                  id="coordinatorContact"
                  placeholder="e.g., 0712345678"
                  value={coordinatorContact}
                  onChange={(e) => setCoordinatorContact(e.target.value)}
                  aria-label="Coordinator Contact Number"
                />
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="p-2 rounded-full bg-green-100 mr-2">
                <MapPin className="h-5 w-5 text-green-600" />
              </span>
              Location Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Your Address <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  placeholder="Enter your home/billing address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                  aria-label="Your Address"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventLocation">Event Location <span className="text-red-500">*</span></Label>
                <Input
                  id="eventLocation"
                  placeholder="e.g., Cinnamon Grand Colombo"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={errors.eventLocation ? "border-red-500" : ""}
                  aria-label="Event Location"
                />
                {errors.eventLocation && <p className="text-sm text-red-500">{errors.eventLocation}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mapLink">Google Maps Link (Optional)</Label>
                <Input
                  id="mapLink"
                  placeholder="e.g., https://maps.google.com/?q=..."
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  aria-label="Google Maps Link"
                />
                <p className="text-xs text-gray-500">Providing a map link helps the service provider locate the venue easily.</p>
              </div>
            </div>
          </div>
          
          {/* Event Details */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="p-2 rounded-full bg-amber-100 mr-2">
                <CalendarCheck className="h-5 w-5 text-amber-600" />
              </span>
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <input 
                    type="date"
                    id="eventDate"
                    className={cn(
                      "w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400",
                      errors.eventDate ? "border-red-500" : "border-gray-200"
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
                    aria-label="Event Date"
                    title="Select event date"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crowdSize">Crowd Size <span className="text-red-500">*</span></Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="crowdSize"
                    type="number"
                    placeholder="Enter number of guests"
                    value={crowdSize}
                    onChange={(e) => setCrowdSize(e.target.value ? parseInt(e.target.value) : '')}
                    className={errors.crowdSize ? "border-red-500" : ""}
                    aria-label="Crowd Size"
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
                <Label>Event Type</Label>
                <p className="py-2 px-3 border rounded-md bg-gray-50">{selectedPackage?.eventType}</p>
              </div>
            </div>
          </div>
          
          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements or Notes (Optional)</Label>
            <Textarea 
              id="specialRequirements" 
              placeholder="Enter any special requirements or notes for your event"
              rows={4}
              aria-label="Special Requirements"
            />
          </div>
          
          {/* Terms and Payment Notice */}
          <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Payment Terms</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• An advance payment of {advancedPaymentPercentage}% ({formatPrice(advancedPaymentAmount, selectedPackage?.currency || 'LKR')}) is required to confirm your booking.</li>
              <li>• The remaining balance must be paid 7 days before the event date.</li>
              <li>• Cancellation policy: Full refund if cancelled 30 days before the event, 50% refund if cancelled 15-30 days before.</li>
            </ul>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Proceed to Payment
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );};

export default BookingForm;
