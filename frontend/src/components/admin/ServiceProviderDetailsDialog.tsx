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
import {
  Building,
  User,
  FileText,
  MapPin,
  CalendarDays,
  Phone,
  Mail,
  Tag,
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface ServiceProvider {
  id: string;
  businessName: string;
  providerName: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  registrationDate: string;
  status: string;
  nicNumber: string;
  nicFrontImage: string;
  nicBackImage: string;
  businessRegistrationNumber?: string;
  businessDescription?: string;
  profilePicture?: string;
  coverPhoto?: string;
  userId: string;
}

interface ServiceProviderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider | null;
  onApprove: (provider: ServiceProvider) => void;
  onReject: (provider: ServiceProvider) => void;
  showActions?: boolean;
}

const ServiceProviderDetailsDialog: React.FC<ServiceProviderDetailsDialogProps> = ({
  isOpen,
  onClose,
  provider,
  onApprove,
  onReject,
  showActions = true,
}) => {
  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Service Provider Details</DialogTitle>
          <DialogDescription>
            Review the service provider's information before making your decision.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {/* Cover Photo */}
          <div className="h-48 bg-gray-100 rounded-md overflow-hidden mb-4 relative">
            {provider.coverPhoto ? (
              <img
                src={provider.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No cover photo</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Profile & Business Info */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {provider.profilePicture ? (
                      <img
                        src={provider.profilePicture}
                        alt={provider.businessName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{provider.businessName}</h3>
                    <p className="text-sm text-gray-500">{provider.serviceType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${provider.status === 'approved' ? 'bg-green-500' : 
                          provider.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}
                      `}></div>
                      <span className="text-xs capitalize">{provider.status}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Provider Name</p>
                      <p className="text-sm text-gray-600">{provider.providerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm text-gray-600">{provider.registrationDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{provider.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Service Type</p>
                      <p className="text-sm text-gray-600">{provider.serviceType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{provider.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column */}
            <div className="space-y-6">
              {/* NIC Information */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-3">NIC Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">NIC Number</p>
                      <p className="text-sm text-gray-600">{provider.nicNumber}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">NIC Front Image</p>
                    <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
                      {provider.nicFrontImage ? (
                        <img
                          src={provider.nicFrontImage}
                          alt="NIC Front"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">NIC Back Image</p>
                    <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
                      {provider.nicBackImage ? (
                        <img
                          src={provider.nicBackImage}
                          alt="NIC Back"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Business Information */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Business Information</h3>
                <div className="space-y-3">
                  {provider.businessRegistrationNumber && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Registration Number</p>
                        <p className="text-sm text-gray-600">{provider.businessRegistrationNumber}</p>
                      </div>
                    </div>
                  )}

                  {provider.businessDescription && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Business Description</p>
                        <p className="text-sm text-gray-600">{provider.businessDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
          <div>
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${provider.status === 'approved' ? 'bg-green-100 text-green-800' : 
                provider.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
            `}>
              {provider.status === 'approved' ? 'Approved' : 
                provider.status === 'rejected' ? 'Rejected' : 'Pending'}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {showActions && (
              <>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onApprove(provider)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => onReject(provider)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceProviderDetailsDialog;