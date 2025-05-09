import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, User, FileText, Phone, Mail, MapPin, Users, Calendar as CalendarIcon2, Package, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingData } from "./booking-tabs/BookingsDetailsTab";

interface AddBookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingAdded?: (newBooking: BookingData) => void;
}

// Common event types
const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Graduation",
  "Baby Shower",
  "Engagement",
  "Conference",
  "Seminar",
  "Exhibition",
  "Other"
];

// Sample package options
const PACKAGE_OPTIONS = [
  "Wedding Deluxe",
  "Birthday Special",
  "Corporate Event",
  "Anniversary Package",
  "Graduation Celebration",
  "Custom Package"
];

// Generate a random booking ID
const generateBookingId = () => {
  return `BK${1000 + Math.floor(Math.random() * 9000)}`;
};

// Generate a random ID for the booking
const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

const AddBookingForm = ({ open, onOpenChange, onBookingAdded }: AddBookingFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    nicNumber: "",
    phoneNumber: "",
    email: "",
    coordinatorName: "",
    coordinatorContact: "",
    eventType: "",
    address: "",
    eventLocation: "",
    mapLink: "",
    crowdSize: "",
    eventDate: undefined as Date | undefined,
    additionalNotes: "",
    // New fields for package and payment
    packageName: "",
    fullAmount: "",
    advanceAmount: "",
    paymentMethod: "cash", // Default payment method
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, eventDate: date }));
    
    // Clear date error if it exists
    if (errors.eventDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.eventDate;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.nicNumber) newErrors.nicNumber = "NIC number is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.eventType) newErrors.eventType = "Event type is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.eventLocation) newErrors.eventLocation = "Event location is required";
    if (!formData.crowdSize) newErrors.crowdSize = "Crowd size is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.packageName) newErrors.packageName = "Package name is required";
    if (!formData.fullAmount) newErrors.fullAmount = "Full amount is required";
    else if (isNaN(Number(formData.fullAmount)) || Number(formData.fullAmount) <= 0) 
      newErrors.fullAmount = "Full amount must be a positive number";
    if (!formData.advanceAmount) newErrors.advanceAmount = "Advance amount is required";
    else if (isNaN(Number(formData.advanceAmount)) || Number(formData.advanceAmount) <= 0) 
      newErrors.advanceAmount = "Advance amount must be a positive number";
    else if (Number(formData.advanceAmount) > Number(formData.fullAmount))
      newErrors.advanceAmount = "Advance amount cannot be greater than full amount";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Submit form data to backend API
      console.log("Form submitted:", formData);
      
      // Show success message
      toast.success("Booking added successfully!");
      
      // Reset form and close dialog
      setFormData({
        fullName: "",
        nicNumber: "",
        phoneNumber: "",
        email: "",
        coordinatorName: "",
        coordinatorContact: "",
        eventType: "",
        address: "",
        eventLocation: "",
        mapLink: "",
        crowdSize: "",
        eventDate: undefined,
        additionalNotes: "",
        packageName: "",
        fullAmount: "",
        advanceAmount: "",
        paymentMethod: "cash",
      });
      
      onOpenChange(false);

      // Call onBookingAdded prop if provided
      if (onBookingAdded) {
        const newBooking: BookingData = {
            id: generateId(),
            bookingId: generateBookingId(),
            ...formData,
            customerName: "",
            bookingDate: new Date(),
            status: "pending",
            fullDetails: {
                nameWithInitial: "",
                nicNumber: "",
                phoneNumber: "",
                email: "",
                eventCoordinatorName: undefined,
                eventCoordinatorNumber: undefined,
                address: "",
                eventLocation: {
                    name: "",
                    mapLink: undefined
                },
                crowdSize: 0,
                eventType: "",
                additionalNotes: undefined
            }
        };
        onBookingAdded(newBooking);
      }
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-blue-50">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Add New Booking
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Customer Information Section */}
            <div className="col-span-2 mb-2">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">Customer Information</h3>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"></div>
            </div>
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name with initials *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={cn("transition-all", errors.fullName ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="E.g., J. Smith"
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
            </div>
            
            {/* NIC Number */}
            <div className="space-y-1.5">
              <Label htmlFor="nicNumber" className="text-sm font-medium">
                NIC Number *
              </Label>
              <Input
                id="nicNumber"
                name="nicNumber"
                value={formData.nicNumber}
                onChange={handleInputChange}
                className={cn("transition-all", errors.nicNumber ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="E.g., 987654321V"
              />
              {errors.nicNumber && <p className="text-red-500 text-xs">{errors.nicNumber}</p>}
            </div>
            
            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number *
              </Label>
              <div className="flex items-center">
                <div className="bg-gray-100 border rounded-l-md border-r-0 px-3 py-2 text-sm text-gray-500">+94</div>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={cn("transition-all rounded-l-none", errors.phoneNumber ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                  placeholder="7X XXX XXXX"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber}</p>}
            </div>
            
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn("transition-all", errors.email ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
            
            {/* Event Details Section */}
            <div className="col-span-2 mb-2 mt-4">
              <div className="flex items-center mb-2">
                <CalendarIcon2 className="h-5 w-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-700">Event Details</h3>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full"></div>
            </div>
            
            {/* Event Type Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="eventType" className="text-sm font-medium">
                Event Type *
              </Label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className={cn(
                  "w-full h-10 px-3 rounded-md border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                  errors.eventType ? "border-red-500 ring-1 ring-red-500" : ""
                )}
              >
                <option value="" disabled>Select an event type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.eventType && <p className="text-red-500 text-xs">{errors.eventType}</p>}
            </div>
            
            {/* Event Date - Completely rebuilt implementation */}
            <div className="space-y-1.5">
              <Label htmlFor="eventDate" className="text-sm font-medium">
                Event Date *
              </Label>
              <div className="relative">
                <button
                  type="button"
                  id="eventDate"
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-left text-sm rounded-md border",
                    !formData.eventDate && "text-gray-500",
                    errors.eventDate ? "border-red-500 ring-1 ring-red-500" : "",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  )}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {formData.eventDate ? format(formData.eventDate, "PPP") : "Select a date"}
                </button>
                
                {showCalendar && (
                  <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg p-1 border">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate}
                      onSelect={(date) => {
                        handleDateChange(date);
                        setShowCalendar(false);
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
              {errors.eventDate && <p className="text-red-500 text-xs">{errors.eventDate}</p>}
            </div>
            
            {/* Crowd Size */}
            <div className="space-y-1.5">
              <Label htmlFor="crowdSize" className="text-sm font-medium">
                Crowd Size *
              </Label>
              <Input
                id="crowdSize"
                name="crowdSize"
                type="number"
                value={formData.crowdSize}
                onChange={handleInputChange}
                className={cn("transition-all", errors.crowdSize ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="Number of attendees"
                min="1"
              />
              {errors.crowdSize && <p className="text-red-500 text-xs">{errors.crowdSize}</p>}
            </div>
            
            {/* Event Location */}
            <div className="space-y-1.5">
              <Label htmlFor="eventLocation" className="text-sm font-medium">
                Event Location Name *
              </Label>
              <Input
                id="eventLocation"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleInputChange}
                className={cn("transition-all", errors.eventLocation ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="E.g., Grand Hotel"
              />
              {errors.eventLocation && <p className="text-red-500 text-xs">{errors.eventLocation}</p>}
            </div>
            
            {/* Address */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">
                Address *
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={cn("transition-all", errors.address ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                placeholder="Full address of the event venue"
                rows={2}
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>
            
            {/* Map Link */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="mapLink" className="text-sm font-medium">
                Google Maps Link (optional)
              </Label>
              <Input
                id="mapLink"
                name="mapLink"
                type="url"
                value={formData.mapLink}
                onChange={handleInputChange}
                className="transition-all focus:ring-2 focus:ring-blue-500/40"
                placeholder="https://maps.google.com/..."
              />
            </div>
            
            {/* Additional Notes */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="additionalNotes" className="text-sm font-medium flex items-center">
                <span>Additional Notes</span>
                <span className="ml-1 text-xs text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                className="transition-all focus:ring-2 focus:ring-blue-500/40"
                placeholder="Any special requirements, preferences, or additional information"
                rows={3}
              />
            </div>
            
            {/* Package Information Section */}
            <div className="col-span-2 mb-2 mt-4">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 mr-2 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-700">Package Information</h3>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full"></div>
            </div>
            
            {/* Package Name */}
            <div className="space-y-1.5">
              <Label htmlFor="packageName" className="text-sm font-medium">
                Package Name *
              </Label>
              <select
                id="packageName"
                name="packageName"
                value={formData.packageName}
                onChange={handleInputChange}
                className={cn(
                  "w-full h-10 px-3 rounded-md border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                  errors.packageName ? "border-red-500 ring-1 ring-red-500" : ""
                )}
              >
                <option value="" disabled>Select a package</option>
                {PACKAGE_OPTIONS.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
              {errors.packageName && <p className="text-red-500 text-xs">{errors.packageName}</p>}
            </div>
            
            {/* Payment Details Section */}
            <div className="col-span-2 mb-2 mt-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-700">Payment Details</h3>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"></div>
            </div>
            
            {/* Full Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="fullAmount" className="text-sm font-medium">
                Full Amount (USD) *
              </Label>
              <div className="flex items-center">
                <div className="bg-gray-100 border rounded-l-md border-r-0 px-3 py-2 text-sm text-gray-500">$</div>
                <Input
                  id="fullAmount"
                  name="fullAmount"
                  type="text"
                  inputMode="decimal"
                  value={formData.fullAmount}
                  onChange={handleInputChange}
                  className={cn("transition-all rounded-l-none", errors.fullAmount ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                  placeholder="0.00"
                />
              </div>
              {errors.fullAmount && <p className="text-red-500 text-xs">{errors.fullAmount}</p>}
            </div>
            
            {/* Advance Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="advanceAmount" className="text-sm font-medium">
                Advance Payment (USD) *
              </Label>
              <div className="flex items-center">
                <div className="bg-gray-100 border rounded-l-md border-r-0 px-3 py-2 text-sm text-gray-500">$</div>
                <Input
                  id="advanceAmount"
                  name="advanceAmount"
                  type="text"
                  inputMode="decimal"
                  value={formData.advanceAmount}
                  onChange={handleInputChange}
                  className={cn("transition-all rounded-l-none", errors.advanceAmount ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-blue-500/40")}
                  placeholder="0.00"
                />
              </div>
              {errors.advanceAmount && <p className="text-red-500 text-xs">{errors.advanceAmount}</p>}
              {!errors.advanceAmount && formData.fullAmount && formData.advanceAmount && (
                <p className="text-gray-500 text-xs mt-1">
                  Balance due: ${(Number(formData.fullAmount) - Number(formData.advanceAmount)).toFixed(2)}
                </p>
              )}
            </div>
            
            {/* Optional Coordinator Information */}
            <div className="col-span-2 mb-2 mt-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-700">Event Coordinator (Optional)</h3>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"></div>
            </div>
            
            {/* Coordinator Name */}
            <div className="space-y-1.5">
              <Label htmlFor="coordinatorName" className="text-sm font-medium">
                Coordinator Name
              </Label>
              <Input
                id="coordinatorName"
                name="coordinatorName"
                value={formData.coordinatorName}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-blue-500/40"
                placeholder="Full name of coordinator"
              />
            </div>
            
            {/* Coordinator Contact */}
            <div className="space-y-1.5">
              <Label htmlFor="coordinatorContact" className="text-sm font-medium">
                Coordinator Contact
              </Label>
              <Input
                id="coordinatorContact"
                name="coordinatorContact"
                value={formData.coordinatorContact}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-blue-500/40"
                placeholder="Phone number or email"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Save Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookingForm;