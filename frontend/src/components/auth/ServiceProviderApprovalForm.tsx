import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, User, Building, CreditCard, MapPin, ListChecks, Image, Mail, Phone, Lock, FileText, AlertCircle, ArrowLeft, Globe, ChevronDown, Check, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

// Available service types for selection
const serviceTypes = [
  { label: "Hotel", value: "hotel" },
  { label: "Venue", value: "venue" },
  { label: "Catering", value: "catering" },
  { label: "Photography", value: "photography" },
  { label: "Videography", value: "videography" },
  { label: "Decoration", value: "decoration" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Band", value: "band" },
  { label: "DJ", value: "dj" },
  { label: "Transportation", value: "transport" },
  { label: "Wedding Planning", value: "wedding-planning" },
  { label: "Florist", value: "florist" },
  { label: "Makeup Artist", value: "makeup" },
  { label: "Cake", value: "cake" },
  { label: "Invitation", value: "invitation" },
  { label: "Other", value: "other" }
];

// Event types for selection
const eventTypes = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Corporate", value: "corporate" },
  { label: "Conference", value: "conference" },
  { label: "Festival", value: "festival" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Graduation", value: "graduation" },
  { label: "Engagement", value: "engagement" },
  { label: "Exhibition", value: "exhibition" },
  { label: "Concert", value: "concert" },
  { label: "Religious", value: "religious" },
  { label: "Other", value: "other" }
];

// Define major cities in Sri Lanka
const SRI_LANKA_CITIES = {
  "Western": ["Colombo", "Negombo", "Kalutara", "Gampaha", "Moratuwa", "Panadura"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya", "Dambulla", "Gampola"],
  "Southern": ["Galle", "Matara", "Hambantota", "Tangalle", "Ambalangoda"],
  "Northern": ["Jaffna", "Vavuniya", "Kilinochchi", "Mullaitivu", "Point Pedro"],
  "Eastern": ["Trincomalee", "Batticaloa", "Ampara", "Kalmunai", "Kattankudy"],
  "North Western": ["Kurunegala", "Puttalam", "Chilaw", "Kuliyapitiya", "Wariyapola"],
  "North Central": ["Anuradhapura", "Polonnaruwa", "Kekirawa", "Tambuttegama"],
  "Uva": ["Badulla", "Bandarawela", "Monaragala", "Haputale", "Welimada"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle", "Balangoda", "Embilipitiya"]
};

// Flatten all cities for dropdown
const ALL_SRI_LANKA_CITIES = Object.values(SRI_LANKA_CITIES).flat().sort();

interface ServiceProviderApprovalFormData {
  // Personal info
  providerName: string;
  nicNumber: string;
  nicFrontImage: File | null;
  nicBackImage: File | null;
  
  // Business info
  businessName: string;
  businessRegistrationNumber?: string;
  businessDescription?: string; // Made business description optional
  
  // Account info (from signup)
  username: string;
  email: string;
  phone: string;
  
  // Contact info (separate from account info)
  contactEmail: string;
  contactPhone: string;
  
  // Card details
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  
  // Location
  address: string;
  city: string;
  province: string; // Moved province to location section
  
  // Service locations
  serviceLocations: string[];
  
  // Service details
  serviceTypes: string;
  coveredEventTypes: string[];
  
  // Media
  profilePicture: File | null;
  coverPhoto: File | null;
  
  // Description
  slogan?: string;

  // Bank account details
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountOwnerName: string;
}

interface ServiceProviderApprovalFormProps {
  initialData: {
    email: string;
    username: string;
    phone: string;
  };
  onSubmit: (data: ServiceProviderApprovalFormData) => void;
}

export function ServiceProviderApprovalForm({ 
  initialData, 
  onSubmit 
}: ServiceProviderApprovalFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use location state if available
  const formInitialData = location.state?.initialData || initialData;
  
  const [formData, setFormData] = useState<ServiceProviderApprovalFormData>({
    providerName: "",
    nicNumber: "",
    nicFrontImage: null,
    nicBackImage: null,
    
    businessName: formInitialData.businessName || "",  // Pre-fill business name
    businessRegistrationNumber: "",
    businessDescription: "", // Initialize business description
    
    username: formInitialData.username || "",
    email: formInitialData.email || "",
    phone: formInitialData.phone || "", // Initialize with phone from initialData
    
    contactEmail: formInitialData.email || "", // Pre-fill with registration email
    contactPhone: formInitialData.phone || "", // Pre-fill with registration phone
    
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    
    address: "",
    city: "",
    province: "", // Initialize province
    
    serviceLocations: [],
    
    serviceTypes: "",
    coveredEventTypes: [], // Initialize covered event types array
    
    profilePicture: null,
    coverPhoto: null,
    
    slogan: "",

    bankName: "",
    branchName: "",
    accountNumber: "",
    accountOwnerName: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Dropdown state variables
  const [isServiceLocationsOpen, setIsServiceLocationsOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [isServiceTypesOpen, setIsServiceTypesOpen] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [isEventTypesOpen, setIsEventTypesOpen] = useState(false);
  const [eventTypeSearchQuery, setEventTypeSearchQuery] = useState("");

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    
    return v;
  };

  const validateCardDetails = () => {
    const errors: Record<string, string> = {};
    
    // Validate card number
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (formData.cardNumber.replace(/\s+/g, '').length !== 16) {
      errors.cardNumber = "Card number must be 16 digits";
    }
    
    // Validate card name
    if (!formData.cardName.trim()) {
      errors.cardName = "Name on card is required";
    }
    
    // Validate expiry date
    if (!formData.cardExpiry.trim()) {
      errors.cardExpiry = "Expiry date is required";
    } else if (!(/^\d{2}\/\d{2}$/).test(formData.cardExpiry)) {
      errors.cardExpiry = "Invalid format. Use MM/YY";
    } else {
      // Check if card is expired
      const [month, year] = formData.cardExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();
      
      if (expiryDate < today) {
        errors.cardExpiry = "Card is expired";
      }
    }
    
    // Validate CVV
    if (!formData.cardCvv.trim()) {
      errors.cardCvv = "CVV is required";
    } else if (formData.cardCvv.length < 3 || formData.cardCvv.length > 4) {
      errors.cardCvv = "CVV must be 3-4 digits";
    } else if (!/^\d+$/.test(formData.cardCvv)) {
      errors.cardCvv = "CVV must contain only numbers";
    }
    
    return errors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;
      setFormData(prev => ({
        ...prev,
        [id]: files?.[0] || null
      }));
    } else if (id === "cardNumber") {
      // Format card number with spaces
      setFormData(prev => ({
        ...prev,
        [id]: formatCardNumber(value)
      }));
      
      // Clear validation error if value is valid
      if (validationErrors.cardNumber && formatCardNumber(value).replace(/\s+/g, '').length === 16) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated.cardNumber;
          return updated;
        });
      }
    } else if (id === "cardExpiry") {
      // Format expiry date with slash
      setFormData(prev => ({
        ...prev,
        [id]: formatExpiryDate(value)
      }));
      
      // Clear validation error if it matches the format
      if (validationErrors.cardExpiry && /^\d{2}\/\d{2}$/.test(formatExpiryDate(value))) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated.cardExpiry;
          return updated;
        });
      }
    } else if (id === "cardCvv") {
      // Allow only numbers and limit to 4 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [id]: digitsOnly
      }));
      
      // Clear validation error if valid
      if (validationErrors.cardCvv && digitsOnly.length >= 3) {
        setValidationErrors(prev => {
          const updated = {...prev};
          delete updated.cardCvv;
          return updated;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const toggleServiceType = (value: string) => {
    setFormData(prev => {
      // If already selected, remove it; otherwise add it
      const serviceTypes = prev.serviceTypes.includes(value)
        ? prev.serviceTypes.filter(type => type !== value)
        : [...prev.serviceTypes, value];
      
      return {
        ...prev,
        serviceTypes
      };
    });
  };

  const removeServiceType = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.filter(type => type !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.providerName || !formData.nicNumber || !formData.businessName || 
        !formData.contactEmail || !formData.contactPhone || !formData.address ||
        !formData.city || formData.serviceTypes.length === 0 || 
        !formData.profilePicture || !formData.cardName || !formData.cardNumber ||
        !formData.cardExpiry || !formData.cardCvv || formData.serviceLocations.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate card details
    const cardErrors = validateCardDetails();
    if (Object.keys(cardErrors).length > 0) {
      setValidationErrors(cardErrors);
      toast.error("Please fix the errors in your card details");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would upload files and submit form data to your API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      onSubmit(formData);
      toast.success("Your service provider profile has been submitted for approval!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error submitting your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/register'); // Navigate back to registration page
  };

  return (
    <>
      <Button 
        type="button" 
        variant="ghost"
        size={"sm"} 
        className="mb-4 flex items-center gap-1 text-gray-500 hover:text-gray-700"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" size={16} />
        Back to Registration
      </Button>
      
      <Card className="w-full overflow-hidden relative border-blue-200 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-2"></div>
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-800">Service Provider Profile</CardTitle>
            <CardDescription className="text-center">
              Complete your service provider profile to start offering your services
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* Media Section - Moved to top for better focus on profile and cover photo */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <Image className="mr-2 h-5 w-5 text-blue-600" />
                Profile Media
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture <span className="text-red-500">*</span></Label>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden border-2 border-blue-100">
                      {formData.profilePicture ? (
                        <img 
                          src={URL.createObjectURL(formData.profilePicture)}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-300" />
                      )}
                    </div>
                    <Input 
                      id="profilePicture" 
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      required
                      className="max-w-xs border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Displayed as your business logo</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverPhoto">Cover Photo</Label>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-32 bg-gray-100 mb-2 overflow-hidden rounded-md border-2 border-blue-100">
                      {formData.coverPhoto ? (
                        <img 
                          src={URL.createObjectURL(formData.coverPhoto)}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400">Cover Photo</span>
                        </div>
                      )}
                    </div>
                    <Input 
                      id="coverPhoto" 
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="max-w-xs border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Displayed as your profile banner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Personal Information Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Personal Information
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="space-y-2">
                <Label htmlFor="providerName">Service Provider Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="providerName" 
                  placeholder="Your full name" 
                  value={formData.providerName}
                  onChange={handleInputChange}
                  required
                  className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nicNumber">NIC Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="nicNumber" 
                  placeholder="990123456V" 
                  value={formData.nicNumber}
                  onChange={handleInputChange}
                  required
                  className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label>NIC Images <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nicFrontImage" className="text-xs text-muted-foreground">Front Side</Label>
                    <div className="h-32 bg-gray-100 rounded-md overflow-hidden shadow-sm mb-1">
                      {formData.nicFrontImage ? (
                        <img 
                          src={URL.createObjectURL(formData.nicFrontImage)} 
                          alt="NIC Front Preview" 
                          className="h-full w-full object-contain" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm text-gray-400">NIC Front Image</span>
                        </div>
                      )}
                    </div>
                    <Input 
                      id="nicFrontImage" 
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nicBackImage" className="text-xs text-muted-foreground">Back Side</Label>
                    <div className="h-32 bg-gray-100 rounded-md overflow-hidden shadow-sm mb-1">
                      {formData.nicBackImage ? (
                        <img 
                          src={URL.createObjectURL(formData.nicBackImage)} 
                          alt="NIC Back Preview" 
                          className="h-full w-full object-contain" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm text-gray-400">NIC Back Image</span>
                        </div>
                      )}
                    </div>
                    <Input 
                      id="nicBackImage" 
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 2. Business Information Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                Business Information
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="businessName" 
                  placeholder="Your business name" 
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber">Business Registration Number (optional)</Label>
                <Input 
                  id="businessRegistrationNumber" 
                  placeholder="BR12345678" 
                  value={formData.businessRegistrationNumber}
                  onChange={handleInputChange}
                  className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Business Slogan (optional)</Label>
                <Input 
                  id="slogan" 
                  placeholder="Your catchy business slogan" 
                  value={formData.slogan}
                  onChange={handleInputChange}
                  className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description (optional)</Label>
                <textarea 
                  id="businessDescription" 
                  placeholder="Describe your business" 
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="border border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200 w-full rounded-md p-2 resize-vertical"
                />
              </div>
              
              {/* Location Information moved into business information section */}
              <div className="space-y-2 mt-4">
                <h4 className="text-md font-medium flex items-center text-blue-700">
                  <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                  Location Information
                </h4>
                <Separator className="bg-blue-100 mb-3" />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main St, Apartment 4" 
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => handleSelectChange(value, "province")}
                    >
                      <SelectTrigger
                        id="province"
                        className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                      >
                        <SelectValue placeholder="Select a province" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(SRI_LANKA_CITIES).map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleSelectChange(value, "city")}
                      disabled={!formData.province} // Disable if no province selected
                    >
                      <SelectTrigger
                        id="city"
                        className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                      >
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.province && SRI_LANKA_CITIES[formData.province]?.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 3. Service Information Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <ListChecks className="mr-2 h-5 w-5 text-blue-600" />
                Service Information
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="space-y-2">
                <Label htmlFor="serviceTypes">Service Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.serviceTypes}
                  onValueChange={(value) => handleSelectChange(value, "serviceTypes")}
                >
                  <SelectTrigger
                    id="serviceTypes"
                    className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                  >
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Locations */}
              <div className="space-y-2">
                <Label htmlFor="serviceLocations">Service Locations <span className="text-red-500">*</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Select all locations where you can offer your services</p>
                
                <div className="relative">
                  <div 
                    className={cn(
                      "flex min-h-10 items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background cursor-pointer",
                      "border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    )}
                    onClick={() => setIsServiceLocationsOpen(!isServiceLocationsOpen)}
                  >
                    <div className="flex flex-wrap gap-1">
                      {formData.serviceLocations.length > 0 ? (
                        formData.serviceLocations.map(location => (
                          <Badge key={location} variant="secondary" className="bg-green-100 text-green-700">
                            {location}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({
                                  ...prev,
                                  serviceLocations: prev.serviceLocations.filter(loc => loc !== location)
                                }));
                              }}
                              className="ml-1 h-4 w-4 p-0 text-green-700 hover:text-green-900"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Select locations...</span>
                      )}
                    </div>
                    <div className="ml-2">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isServiceLocationsOpen && "transform rotate-180")} />
                    </div>
                  </div>

                  {/* Service Locations dropdown content */}
                  {isServiceLocationsOpen && (
                    // ...existing code...
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-blue-100 bg-white shadow-lg">
                      <div className="max-h-60 overflow-y-auto p-2">
                        <div className="sticky top-0 bg-white pb-2 mb-1 border-b border-blue-100">
                          <Input
                            type="text"
                            placeholder="Search locations..."
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                          />
                        </div>
                        <div className="space-y-1">
                          {Object.entries(SRI_LANKA_CITIES).map(([province, cities]) => {
                            const filteredCities = cities.filter(city => 
                              city.toLowerCase().includes(locationSearchQuery.toLowerCase())
                            );
                            
                            if (filteredCities.length === 0) return null;
                            
                            return (
                              <div key={province} className="mb-2">
                                <div className="text-sm font-medium text-blue-800 mb-1 px-2">{province}</div>
                                {filteredCities.map(city => (
                                  <div
                                    key={city}
                                    className={cn(
                                      "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer",
                                      formData.serviceLocations.includes(city) 
                                        ? "bg-green-50 text-green-700"
                                        : "hover:bg-green-50/50"
                                    )}
                                    onClick={() => {
                                      setFormData(prev => {
                                        const serviceLocations = prev.serviceLocations.includes(city)
                                          ? prev.serviceLocations.filter(loc => loc !== city)
                                          : [...prev.serviceLocations, city];
                                        
                                        return {
                                          ...prev,
                                          serviceLocations
                                        };
                                      });
                                    }}
                                  >
                                    <span className="text-sm">{city}</span>
                                    {formData.serviceLocations.includes(city) && (
                                      <Check className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border-t border-blue-100">
                        <span className="text-sm text-gray-500">{formData.serviceLocations.length} selected</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsServiceLocationsOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Covered Event Types */}
              <div className="space-y-2">
                <Label htmlFor="coveredEventTypes">Covered Event Types <span className="text-red-500">*</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Select all event types your service can accommodate</p>
                
                <div className="relative">
                  <div 
                    className={cn(
                      "flex min-h-10 items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background cursor-pointer",
                      "border-purple-200 focus:border-purple-400 focus:ring focus:ring-purple-200"
                    )}
                    onClick={() => setIsEventTypesOpen(!isEventTypesOpen)}
                  >
                    <div className="flex flex-wrap gap-1">
                      {formData.coveredEventTypes.length > 0 ? (
                        formData.coveredEventTypes.map(type => {
                          const eventType = eventTypes.find(e => e.value === type);
                          return (
                            <Badge key={type} variant="secondary" className="bg-purple-100 text-purple-700">
                              {eventType?.label || type}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    coveredEventTypes: prev.coveredEventTypes.filter(t => t !== type)
                                  }));
                                }}
                                className="ml-1 h-4 w-4 p-0 text-purple-700 hover:text-purple-900"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">Select event types...</span>
                      )}
                    </div>
                    <div className="ml-2">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isEventTypesOpen && "transform rotate-180")} />
                    </div>
                  </div>

                  {/* Event Types dropdown content */}
                  {isEventTypesOpen && (
                    // ...existing code...
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-purple-100 bg-white shadow-lg">
                      <div className="max-h-60 overflow-y-auto p-2">
                        <div className="sticky top-0 bg-white pb-2 mb-1 border-b border-purple-100">
                          <Input
                            type="text"
                            placeholder="Search event types..."
                            value={eventTypeSearchQuery}
                            onChange={(e) => setEventTypeSearchQuery(e.target.value)}
                            className="border-purple-100 focus:border-purple-400 focus:ring focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-1">
                          {eventTypes
                            .filter(eventType => 
                              eventType.label.toLowerCase().includes(eventTypeSearchQuery.toLowerCase())
                            )
                            .map(eventType => (
                              <div
                                key={eventType.value}
                                className={cn(
                                  "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer",
                                  formData.coveredEventTypes.includes(eventType.value) 
                                    ? "bg-purple-50 text-purple-700"
                                    : "hover:bg-purple-50/50"
                                )}
                                onClick={() => {
                                  setFormData(prev => {
                                    const coveredEventTypes = prev.coveredEventTypes.includes(eventType.value)
                                      ? prev.coveredEventTypes.filter(type => type !== eventType.value)
                                      : [...prev.coveredEventTypes, eventType.value];
                                    
                                    return {
                                      ...prev,
                                      coveredEventTypes
                                    };
                                  });
                                }}
                              >
                                <span className="text-sm">{eventType.label}</span>
                                {formData.coveredEventTypes.includes(eventType.value) && (
                                  <Check className="h-4 w-4 text-purple-600" />
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border-t border-purple-100">
                        <span className="text-sm text-gray-500">{formData.coveredEventTypes.length} selected</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEventTypesOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 4. Account Information Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Account Information
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Username
                  </Label>
                  <Input 
                    id="username" 
                    value={formData.username}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Username from registration</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Email from registration</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Phone
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Phone from registration</p>
                </div>
              </div>
            </div>

            {/* 5. Contact Information Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <Phone className="mr-2 h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <Separator className="bg-blue-100" />
              <p className="text-sm text-gray-500">These contact details will be visible to customers</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Contact Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    placeholder="contact@business.com" 
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                  />
                  <p className="text-xs text-muted-foreground">Public email for customer inquiries</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Contact Phone <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <div className="bg-blue-50 border border-blue-100 rounded-l-md border-r-0 px-3 py-2 text-sm text-blue-700 font-medium">+94</div>
                    <Input 
                      id="contactPhone" 
                      placeholder="7X XXX XXXX" 
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200 rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Public phone number for customer inquiries</p>
                </div>
              </div>
            </div>
            
            {/* Card Details Section */}
            <div className="space-y-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
              <h3 className="text-lg font-medium flex items-center text-blue-800">
                <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                Card Details
              </h3>
              <Separator className="bg-blue-100" />
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card <span className="text-red-500">*</span></Label>
                <Input 
                  id="cardName" 
                  placeholder="John Smith" 
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200",
                    validationErrors.cardName ? "border-red-500" : ""
                  )}
                />
                {validationErrors.cardName && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.cardName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="cardNumber" 
                  placeholder="4242 4242 4242" 
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                  maxLength={19}
                  className={cn(
                    "border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200",
                    validationErrors.cardNumber ? "border-red-500" : ""
                  )}
                />
                {validationErrors.cardNumber && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.cardNumber}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date <span className="text-red-500">*</span></Label>
                  <Input 
                    id="cardExpiry" 
                    placeholder="MM/YY" 
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    required
                    maxLength={5}
                    className={cn(
                      "border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200",
                      validationErrors.cardExpiry ? "border-red-500" : ""
                    )}
                  />
                  {validationErrors.cardExpiry && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.cardExpiry}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardCvv">CVV <span className="text-red-500">*</span></Label>
                  <Input 
                    id="cardCvv" 
                    placeholder="123" 
                    value={formData.cardCvv}
                    onChange={handleInputChange}
                    required
                    maxLength={4}
                    className={cn(
                      "border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200",
                      validationErrors.cardCvv ? "border-red-500" : ""
                    )}
                  />
                  {validationErrors.cardCvv && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.cardCvv}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountDetails">Account Details <span className="text-red-500">*</span></Label>
                <div className="p-3 border border-blue-100 rounded-md bg-blue-50">
                  <p className="text-sm text-blue-700">
                    Your payment will be processed through our secure payment gateway. Monthly subscription fee will be charged to this card.
                  </p>
                </div>
              </div>
              
              {/* Bank Account Details Section */}
              <div className="space-y-4 mt-4">
                <h4 className="text-md font-medium flex items-center text-blue-700">
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Bank Account Details
                </h4>
                <Separator className="bg-blue-100 mb-3" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="bankName" 
                      placeholder="Commercial Bank" 
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch <span className="text-red-500">*</span></Label>
                    <Input 
                      id="branchName" 
                      placeholder="Colombo Main" 
                      value={formData.branchName}
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
                    <Input 
                      id="accountNumber" 
                      placeholder="12345678901" 
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountOwnerName">Account Owner Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="accountOwnerName" 
                      placeholder="John Smith" 
                      value={formData.accountOwnerName}
                      onChange={handleInputChange}
                      required
                      className="border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
            </div>
            </div>

            {/* Notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <h4 className="font-medium text-amber-800">Approval Process</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your application will be reviewed by our team. Once approved, your service provider profile will be visible to all users.
                This process typically takes 1-2 business days.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="px-6 py-4 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
            
          </CardFooter>
        </form>
      </Card>
    </>
  );
}