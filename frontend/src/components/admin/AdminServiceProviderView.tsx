import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Building, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceProvider } from "@/types";

interface AdminServiceProviderViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider | null;
}

const AdminServiceProviderView: React.FC<AdminServiceProviderViewProps> = ({
  isOpen,
  onOpenChange,
  provider
}) => {
  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Provider Image */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border overflow-hidden bg-gray-100">
                {provider.profileImage ? (
                  <img 
                    src={provider.profileImage}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mt-3">{provider.businessName}</h3>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {provider.serviceType.map((service) => (
                  <Badge key={service} variant="outline" className="bg-blue-50 text-blue-800">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Provider Details */}
            <div className="w-full md:w-2/3 space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Service Provider Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner Name</p>
                    <p>{provider.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{provider.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                    <p>{provider.contactNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{provider.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Registration</p>
                    <p>{provider.businessRegNumber || "Not provided"}</p>
                  </div>
                </div>
                
                {provider.business_description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-500 mb-2">Business Description</p>
                    <p className="text-sm">{provider.business_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Cover Photo Section */}
          {provider.coverPhoto && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Business Cover Photo</p>
              <div className="rounded-lg overflow-hidden border h-48">
                <img 
                  src={provider.coverPhoto}
                  alt="Business Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminServiceProviderView;