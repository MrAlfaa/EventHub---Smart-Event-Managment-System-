import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  CreditCard,
  Calendar,
  Tag,
  ZoomIn,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

// Define the service provider interface
export interface ServiceProvider {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  username: string;
  contactNumber: string;
  nicNumber: string;
  businessRegNumber: string;
  location: string;
  address?: string;
  city?: string;
  province?: string;
  serviceType: string[];
  status: string;
  profileImage: string;
  coverPhoto: string;
  nicFrontImage: string | null;
  nicBackImage: string | null;
  submittedDate?: string;
  rejectedDate?: string;
  rejectedReason?: string;
  businessDescription?: string;
  slogan?: string;
  serviceLocations?: string[];
  coveredEventTypes?: string[];
  eventOrganizerContact: {
    name: string;
    email: string;
    phone: string;
  };
  // Bank account details
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  accountOwnerName?: string;
  // Additional fields
  signupTime?: string;
  phoneNumber?: string;
}

interface ServiceProviderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider | null;
  onApprove?: (provider: ServiceProvider) => void;
  onReject?: (provider: ServiceProvider) => void;
}

const ServiceProviderDetailsDialog: React.FC<ServiceProviderDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  provider,
  onApprove,
  onReject
}) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Debug the provider data when the dialog opens
  useEffect(() => {
    if (isOpen && provider) {
      console.log("Provider data in dialog:", provider);
      console.log("Service locations:", provider.serviceLocations);
      console.log("Covered event types:", provider.coveredEventTypes);
      console.log("Business slogan:", provider.slogan);
      console.log("Business description:", provider.businessDescription);
    }
  }, [isOpen, provider]);

  if (!provider) return null;

  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setIsImageModalOpen(true);
  };

  const getStatusBadge = () => {
    switch (provider.status) {
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Approval</Badge>;
      case "Active":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case "Rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  <AvatarImage 
                    src={provider.profileImage} 
                    alt={provider.businessName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl bg-blue-100 text-blue-800">
                    {provider.businessName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{provider.businessName}</DialogTitle>
                  <DialogDescription>
                    Service provider details and verification documents
                  </DialogDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </DialogHeader>

          {/* Cover Photo */}
          <div className="relative h-48 w-full rounded-md overflow-hidden mb-6">
            {provider.coverPhoto ? (
              <img 
                src={provider.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white">
                <Building className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              {/* Personal Information Section */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Provider Name</p>
                      <p className="text-sm">{provider.ownerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-full">
                      <CreditCard className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">NIC Number</p>
                      <p className="text-sm">{provider.nicNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information Section */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Business Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-full">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Business Name</p>
                      <p className="text-sm">{provider.businessName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-full">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Business Registration Number</p>
                      <p className="text-sm">{provider.businessRegNumber || "Not provided"}</p>
                    </div>
                  </div>

                  {provider.businessDescription && (
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 p-2 rounded-full mt-1">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Business Description</p>
                        <p className="text-sm">{provider.businessDescription}</p>
                      </div>
                    </div>
                  )}

                  {provider.slogan && (
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 p-2 rounded-full">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Business Slogan</p>
                        <p className="text-sm italic">"{provider.slogan}"</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm">{provider.address ? `${provider.address}, ` : ''}{provider.city ? `${provider.city}, ` : ''}{provider.province || provider.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service Information Section */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Service Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full">
                      <Tag className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Types</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.serviceType.map((service) => (
                          <Badge key={service} variant="outline" className="bg-blue-50 text-blue-800">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {provider.serviceLocations && provider.serviceLocations.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-full mt-1">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Service Locations</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {provider.serviceLocations.map((location) => (
                            <Badge key={location} variant="outline" className="bg-green-50 text-green-800">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {provider.coveredEventTypes && provider.coveredEventTypes.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-full mt-1">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Covered Event Types</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {provider.coveredEventTypes.map((eventType) => (
                            <Badge key={eventType} variant="outline" className="bg-amber-50 text-amber-800">
                              {eventType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason (for rejected providers) */}
              {provider.status === "Rejected" && provider.rejectedReason && (
                <div>
                  <h4 className="font-medium mb-2 text-red-700 border-b pb-1">Rejection Reason</h4>
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{provider.rejectedReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div className="flex-1 space-y-6">
              {/* Account Information Section */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Account Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-full">
                      <User className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Username</p>
                      <p className="text-sm">@{provider.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm">{provider.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone Number (at Signup)</p>
                      <p className="text-sm">{provider.phoneNumber || provider.contactNumber}</p>
                    </div>
                  </div>

                  {provider.signupTime && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Signup Time</p>
                        <p className="text-sm">{provider.signupTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Application Status</p>
                      <div className="mt-1">{getStatusBadge()}</div>
                    </div>
                  </div>

                  {provider.submittedDate && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Submitted Date</p>
                        <p className="text-sm">{provider.submittedDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-sm">{provider.contactNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact Email</p>
                      <p className="text-sm">{provider.eventOrganizerContact?.email || provider.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Bank Account Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bank Name</p>
                      <p className="text-sm">{provider.bankName || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Branch Name</p>
                      <p className="text-sm">{provider.branchName || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Number</p>
                      <p className="text-sm">{provider.accountNumber || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Owner Name</p>
                      <p className="text-sm">{provider.accountOwnerName || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Section Header */}
              <div>
                <h4 className="font-medium mb-2 text-blue-800 border-b pb-1">Media</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Provider has uploaded profile photo and cover photo which are displayed at the top of this dialog.</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* NIC Document Images Section */}
          <div>
            <h4 className="font-medium mb-4 text-blue-800 border-b pb-1">Identification Documents (NIC Images)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">NIC Front Side</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="relative h-40 border rounded-md bg-gray-50 overflow-hidden cursor-pointer group"
                        onClick={() => provider.nicFrontImage && openImageModal(provider.nicFrontImage, "NIC Front Side")}
                      >
                        {provider.nicFrontImage ? (
                          <>
                            <img 
                              src={provider.nicFrontImage} 
                              alt="NIC Front" 
                              className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                              <ZoomIn className="text-white h-6 w-6" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-400 mt-2">No image available</p>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view full image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">NIC Back Side</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="relative h-40 border rounded-md bg-gray-50 overflow-hidden cursor-pointer group"
                        onClick={() => provider.nicBackImage && openImageModal(provider.nicBackImage, "NIC Back Side")}
                      >
                        {provider.nicBackImage ? (
                          <>
                            <img 
                              src={provider.nicBackImage} 
                              alt="NIC Back" 
                              className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                              <ZoomIn className="text-white h-6 w-6" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-400 mt-2">No image available</p>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view full image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            {provider.status === "Pending" && (
              <>
                <Button 
                  type="button"
                  variant="default" 
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  onClick={() => {
                    if (onApprove) {
                      onApprove(provider);
                      onOpenChange(false); // Close dialog after action
                    }
                  }}
                >
                  <CheckCircle size={16} />
                  Approve Provider
                </Button>
                <Button 
                  type="button"
                  variant="destructive"
                  className="flex items-center gap-1 w-full sm:w-auto"
                  onClick={() => {
                    if (onReject) {
                      onReject(provider);
                      onOpenChange(false); // Close dialog after action
                    }
                  }}
                >
                  <XCircle size={16} />
                  Reject Provider
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Modal for Enlarged View */}
      {selectedImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedImage.title}</DialogTitle>
              <DialogDescription>View full resolution document</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ServiceProviderDetailsDialog;