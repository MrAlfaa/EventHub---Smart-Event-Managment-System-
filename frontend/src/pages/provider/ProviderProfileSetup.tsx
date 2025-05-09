import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { User, MapPin, Upload, Building, FileText, CheckCircle, CreditCard, Phone, Mail, Camera, IdCard } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const SERVICE_TYPES = [
  "Hotel",
  "Catering",
  "Photography",
  "Videography",
  "Decoration",
  "Band",
  "DJ",
  "Entertainment",
  "Venue",
  "Transportation",
  "Wedding Planning",
  "Audio/Visual",
  "Lighting",
  "Other"
];

const LOCATIONS = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Negombo",
  "Batticaloa",
  "Anuradhapura",
  "Other"
];

const ProviderProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from location state (from signup form)
  const { name = "", email = "", phone = "", username = "", password = "" } = location.state || {};
  
  // Personal details
  const [providerName, setProviderName] = useState(name);
  const [nicNumber, setNicNumber] = useState("");
  const [nicFrontImage, setNicFrontImage] = useState<File | null>(null);
  const [nicBackImage, setNicBackImage] = useState<File | null>(null);
  
  // Business details
  const [businessName, setBusinessName] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState(email);
  const [businessPhone, setBusinessPhone] = useState(phone);
  
  // Event organizer contact
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  
  // Location and services
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  
  // Images
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  
  // Others
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  
  const handleServiceToggle = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service]
    );
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleNicFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNicFrontImage(e.target.files[0]);
    }
  };

  const handleNicBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNicBackImage(e.target.files[0]);
    }
  };

  const handlePaymentSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentSlip(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !providerName || 
      !nicNumber || 
      !nicFrontImage || 
      !nicBackImage || 
      !businessName || 
      !businessEmail || 
      !businessPhone || 
      !organizerEmail || 
      !organizerPhone || 
      !address || 
      !city || 
      services.length === 0 || 
      !profileImage || 
      !paymentSlip
    ) {
      toast.error("Please fill all required fields and upload necessary documents");
      return;
    }

    try {
      // In a real app, we would upload files and submit data to an API
      // For this demo, we'll simulate storing the profile data in localStorage
      
      // Create profile data object
      const profileData = {
        // Personal details
        providerName,
        nicNumber,
        nicFrontImageName: nicFrontImage?.name || "",
        nicBackImageName: nicBackImage?.name || "",
        
        // Business details
        businessName,
        businessRegNumber,
        businessEmail,
        businessPhone,
        
        // Event organizer contact
        organizerEmail,
        organizerPhone,
        
        // Location and services
        address,
        city,
        services,
        description,
        
        // Images - in a real app, would be URLs after upload
        profileImageName: profileImage?.name || "",
        paymentSlipName: paymentSlip?.name || "",
        
        // Username from registration
        username,
        email,
        
        // Status info
        submissionDate: new Date().toISOString(),
        status: "pending" // Initial status is pending
      };
      
      // Store the profile data
      if (username) {
        const userData = localStorage.getItem(`sp_${username}`);
        if (userData) {
          const parsedData = JSON.parse(userData);
          parsedData.profileData = profileData;
          localStorage.setItem(`sp_${username}`, JSON.stringify(parsedData));
        }
      }
      
      // Also store by email for backup
      localStorage.setItem(`sp_${email}`, JSON.stringify({
        username,
        email,
        isApproved: false,
        profileData
      }));
      
      // Show approval dialog
      setShowApprovalDialog(true);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Profile submission error:", error);
    }
  };

  const handleContinue = () => {
    // Close the dialog
    setShowApprovalDialog(false);
    
    // Show a completion toast
    toast.success("Profile setup completed successfully!");
    toast.info("Your application is now pending admin approval");
    
    // Redirect to login page - since users need to wait for approval
    navigate("/login", {
      state: {
        message: "Your profile has been submitted successfully. You'll be able to access your account after admin approval.",
        type: "provider"
      }
    });
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-blue-900">Complete Your Provider Profile</h1>
            <p className="text-gray-600">
              Please provide your details to complete your service provider registration. 
              Your profile will be reviewed by an admin before activation.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Service Provider Information</CardTitle>
                <CardDescription>
                  Fill in all required information to create your service provider profile
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <User className="mr-2 h-5 w-5 text-blue-500" />
                    Personal Information
                  </h3>
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="provider-name">Service Provider Name*</Label>
                      <Input
                        id="provider-name"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nic-number">NIC Number*</Label>
                      <Input
                        id="nic-number"
                        value={nicNumber}
                        onChange={(e) => setNicNumber(e.target.value)}
                        placeholder="000000000V"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nic-front">NIC Front Image*</Label>
                      <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50">
                        <Input
                          id="nic-front"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleNicFrontImageChange}
                          required
                        />
                        <label htmlFor="nic-front" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <IdCard className="mb-2 h-6 w-6 text-blue-500" />
                            <span className="text-sm text-gray-500">
                              Upload NIC front image
                            </span>
                            <span className="mt-1 text-xs text-gray-400">
                              Click to browse files
                            </span>
                          </div>
                        </label>
                      </div>
                      {nicFrontImage && (
                        <p className="text-xs text-green-600">
                          Uploaded: {nicFrontImage.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nic-back">NIC Back Image*</Label>
                      <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50">
                        <Input
                          id="nic-back"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleNicBackImageChange}
                          required
                        />
                        <label htmlFor="nic-back" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <IdCard className="mb-2 h-6 w-6 text-blue-500" />
                            <span className="text-sm text-gray-500">
                              Upload NIC back image
                            </span>
                            <span className="mt-1 text-xs text-gray-400">
                              Click to browse files
                            </span>
                          </div>
                        </label>
                      </div>
                      {nicBackImage && (
                        <p className="text-xs text-green-600">
                          Uploaded: {nicBackImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Business Information Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <Building className="mr-2 h-5 w-5 text-blue-500" />
                    Business Information
                  </h3>
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name*</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-reg">Business Registration Number (optional)</Label>
                      <Input
                        id="business-reg"
                        value={businessRegNumber}
                        onChange={(e) => setBusinessRegNumber(e.target.value)}
                        placeholder="BRN12345678"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="business-email">Business Email*</Label>
                      <Input
                        id="business-email"
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="business@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-phone">Business Phone*</Label>
                      <Input
                        id="business-phone"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description*</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell potential customers about your business and services"
                      rows={4}
                      required
                    />
                  </div>
                </div>
                
                {/* Event Organizer Contact Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <Phone className="mr-2 h-5 w-5 text-blue-500" />
                    Event Organizer Contact
                  </h3>
                  <Separator />
                  
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-amber-800">
                    <p className="text-sm">
                      Please provide contact details that will be used by event organizers to reach you
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organizer-email">Contact Email for Customers*</Label>
                      <Input
                        id="organizer-email"
                        type="email"
                        value={organizerEmail}
                        onChange={(e) => setOrganizerEmail(e.target.value)}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organizer-phone">Contact Phone for Customers*</Label>
                      <Input
                        id="organizer-phone"
                        value={organizerPhone}
                        onChange={(e) => setOrganizerPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                    Location
                  </h3>
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address*</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Business Street"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Region*</Label>
                      <Select
                        value={city}
                        onValueChange={setCity}
                        required
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Services Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    Service Information
                  </h3>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-base">Select Service Types*</Label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {SERVICE_TYPES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service}`}
                            checked={services.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <label
                            htmlFor={`service-${service}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                    {services.length === 0 && (
                      <p className="text-xs text-red-500">Please select at least one service type</p>
                    )}
                  </div>
                </div>
                
                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <Camera className="mr-2 h-5 w-5 text-blue-500" />
                    Images
                  </h3>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-image">Profile Picture*</Label>
                      <div className="flex items-center gap-4">
                        {profileImage ? (
                          <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                            <img
                              src={URL.createObjectURL(profileImage)}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="cursor-pointer"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Upload a professional logo or business image (will be shown to customers)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* User Information Section - Read Only */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <Mail className="mr-2 h-5 w-5 text-blue-500" />
                    Account Information
                  </h3>
                  <Separator />
                  
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                      This information was provided during registration and cannot be changed.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                {/* Payment Information Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-medium">
                    <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                    Payment Information
                  </h3>
                  <Separator />
                  
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                      Your card will be charged the monthly subscription fee of 3000 LKR once your account is approved.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number*</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="font-mono"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Name on Card*</Label>
                      <Input
                        id="card-name"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry-month">Month*</Label>
                        <Select required>
                          <SelectTrigger id="expiry-month">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              return (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiry-year">Year*</Label>
                        <Select required>
                          <SelectTrigger id="expiry-year">
                            <SelectValue placeholder="YY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = (new Date().getFullYear() + i).toString().slice(-2);
                              return (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV*</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          maxLength={3}
                          className="font-mono"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="save-card"
                        defaultChecked
                      />
                      <label
                        htmlFor="save-card"
                        className="text-sm text-gray-500"
                      >
                        Save this card for future billing
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="w-full rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After submission, your profile will be reviewed by our admin team. This process typically takes 1-3 business days. You'll receive an email notification once your profile is approved.
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Submit for Approval
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Application Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Your service provider profile has been submitted for admin approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-green-50 p-4">
              <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-green-700">
                <li>Our admin team will review your application</li>
                <li>This process typically takes 1-3 business days</li>
                <li>You'll receive an email notification when your profile is approved</li>
                <li>If rejected, your monthly fee of 3000 LKR will be refunded within 7 days</li>
              </ul>
              <p className="mt-3 text-sm text-green-700">
                For any questions, contact our support team at +94 77 123 4567
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleContinue}
              className="w-full"
            >
              Okay, I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProviderProfileSetup;
