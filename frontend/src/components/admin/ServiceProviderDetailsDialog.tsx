import React, { useState } from "react";
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
  Clock,
  ExternalLink,
  AlertTriangle,
  Info,
  Shield,
  Banknote,
  Calendar,
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  accountOwnerName?: string;
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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [imageViewerSrc, setImageViewerSrc] = useState<string>("");

  if (!provider) return null;

  const handleApprove = () => {
    if (provider) {
      onApprove(provider);
    }
  };

  const handleReject = () => {
    if (provider) {
      onReject(provider);
    }
  };

  const openImageViewer = (src: string) => {
    setImageViewerSrc(src);
    setIsImageViewerOpen(true);
  };

  const images = [
    provider.profilePicture,
    provider.coverPhoto,
    provider.nicFrontImage,
    provider.nicBackImage
  ].filter(Boolean) as string[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl">Service Provider Details</DialogTitle>
                <DialogDescription>
                  Review the service provider's information before making your decision.
                </DialogDescription>
              </div>
              <div>{getStatusBadge(provider.status)}</div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger 
                  value="overview" 
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none",
                    "data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                  )}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="verification" 
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none",
                    "data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                  )}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none",
                    "data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                  )}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Financial
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className={cn(
                    "data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none",
                    "data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                  )}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 p-6 h-full data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="mb-6">
                  {/* Hero section with cover photo and profile */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-44 mb-4">
                    {provider.coverPhoto ? (
                      <img
                        src={provider.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        onClick={() => openImageViewer(provider.coverPhoto!)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No cover photo</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-white bg-opacity-90 p-2 rounded-lg shadow">
                      <div className="h-16 w-16 rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center shadow-sm">
                        {provider.profilePicture ? (
                          <img
                            src={provider.profilePicture}
                            alt={provider.businessName}
                            className="h-full w-full object-cover"
                            onClick={() => openImageViewer(provider.profilePicture!)}
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{provider.businessName}</h3>
                        <Badge variant="outline" className="bg-blue-50">
                          <Tag className="h-3 w-3 mr-1" />
                          {provider.serviceType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Business & Provider Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h3 className="font-medium text-blue-800 flex items-center mb-3">
                          <Building className="h-4 w-4 mr-2 text-blue-600" />
                          Business Information
                        </h3>
                        <Separator className="my-2" />
                        
                        <div className="space-y-3 mt-3">
                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Business Name</p>
                              <p className="text-sm text-gray-600">{provider.businessName}</p>
                            </div>
                          </div>

                          {provider.businessRegistrationNumber && (
                            <div className="flex items-start gap-3">
                              <div className="min-w-[24px] flex justify-center">
                                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Registration Number</p>
                                <p className="text-sm text-gray-600">{provider.businessRegistrationNumber}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Registration Date</p>
                              <p className="text-sm text-gray-600">{provider.registrationDate}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-gray-600">{provider.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {provider.businessDescription && (
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h3 className="font-medium text-blue-800 flex items-center mb-3">
                            <Info className="h-4 w-4 mr-2 text-blue-600" />
                            Business Description
                          </h3>
                          <Separator className="my-2" />
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{provider.businessDescription}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h3 className="font-medium text-blue-800 flex items-center mb-3">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          Provider Information
                        </h3>
                        <Separator className="my-2" />
                        
                        <div className="space-y-3 mt-3">
                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Provider Name</p>
                              <p className="text-sm text-gray-600">{provider.providerName}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-gray-600">{provider.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Phone</p>
                              <p className="text-sm text-gray-600">{provider.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="min-w-[24px] flex justify-center">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">NIC Number</p>
                              <p className="text-sm text-gray-600">{provider.nicNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h3 className="font-medium text-blue-800 flex items-center mb-3">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                          Approval Status
                        </h3>
                        <Separator className="my-2" />
                        
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(provider.status)}
                            <span className="text-sm text-gray-500">Since {provider.registrationDate}</span>
                          </div>
                          
                          {provider.status === 'pending' && showActions && (
                            <div className="flex flex-col gap-2 mt-4">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white w-full"
                                onClick={handleApprove}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Provider
                              </Button>
                              <Button 
                                className="bg-red-600 hover:bg-red-700 text-white w-full"
                                onClick={handleReject}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Provider
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Verification Tab */}
              <TabsContent value="verification" className="m-0 p-6 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-medium text-blue-800 flex items-center mb-3">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      Identity Verification
                    </h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">NIC Front Image</p>
                        <div className="h-48 bg-gray-100 rounded-md overflow-hidden border hover:opacity-90 transition-opacity cursor-pointer">
                          {provider.nicFrontImage ? (
                            <img
                              src={provider.nicFrontImage}
                              alt="NIC Front"
                              className="w-full h-full object-contain"
                              onClick={() => openImageViewer(provider.nicFrontImage)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">NIC Back Image</p>
                        <div className="h-48 bg-gray-100 rounded-md overflow-hidden border hover:opacity-90 transition-opacity cursor-pointer">
                          {provider.nicBackImage ? (
                            <img
                              src={provider.nicBackImage}
                              alt="NIC Back"
                              className="w-full h-full object-contain"
                              onClick={() => openImageViewer(provider.nicBackImage)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-blue-50 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Verify that the provided NIC details match the information in the images.
                          Check for clear visibility of all information and ensure the NIC is valid.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-medium text-blue-800 flex items-center mb-3">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      Business Verification
                    </h3>
                    <Separator className="my-2" />
                    
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-[24px] flex justify-center">
                          <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Business Name</p>
                          <p className="text-sm text-gray-600">{provider.businessName}</p>
                        </div>
                      </div>

                      {provider.businessRegistrationNumber && (
                        <div className="flex items-start gap-3">
                          <div className="min-w-[24px] flex justify-center">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Registration Number</p>
                            <p className="text-sm text-gray-600">{provider.businessRegistrationNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 bg-amber-50 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                          Verify that the business is legitimate and registered. Consider checking external
                          business registration databases if necessary.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="m-0 p-6 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-medium text-blue-800 flex items-center mb-3">
                      <Banknote className="h-4 w-4 mr-2 text-blue-600" />
                      Bank Account Details
                    </h3>
                    <Separator className="my-2" />
                    
                    <div className="space-y-3 mt-3">
                      {provider.bankName && (
                        <div className="flex items-start gap-3">
                          <div className="min-w-[24px] flex justify-center">
                            <Banknote className="h-4 w-4 text-gray-500 mt-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Bank Name</p>
                            <p className="text-sm text-gray-600">{provider.bankName}</p>
                          </div>
                        </div>
                      )}

                      {provider.branchName && (
                        <div className="flex items-start gap-3">
                          <div className="min-w-[24px] flex justify-center">
                            <Banknote className="h-4 w-4 text-gray-500 mt-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Branch</p>
                            <p className="text-sm text-gray-600">{provider.branchName}</p>
                          </div>
                        </div>
                      )}

                      {provider.accountNumber && (
                        <div className="flex items-start gap-3">
                          <div className="min-w-[24px] flex justify-center">
                            <Banknote className="h-4 w-4 text-gray-500 mt-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Number</p>
                            <p className="text-sm text-gray-600">{provider.accountNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1********$3')}</p>
                          </div>
                        </div>
                      )}

                      {provider.accountOwnerName && (
                        <div className="flex items-start gap-3">
                          <div className="min-w-[24px] flex justify-center">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Owner</p>
                            <p className="text-sm text-gray-600">{provider.accountOwnerName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(!provider.bankName && !provider.accountNumber) && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No bank account details provided</p>
                      </div>
                    )}
                    
                    <div className="mt-4 bg-blue-50 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Bank account details must match the business or provider name to ensure
                          proper payment handling. This information is encrypted for security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="m-0 p-6 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <div className="h-64 bg-gray-100 rounded-md overflow-hidden border hover:opacity-90 transition-opacity cursor-pointer">
                      {provider.profilePicture ? (
                        <img
                          src={provider.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-contain"
                          onClick={() => openImageViewer(provider.profilePicture!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No profile picture</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cover Photo</p>
                    <div className="h-64 bg-gray-100 rounded-md overflow-hidden border hover:opacity-90 transition-opacity cursor-pointer">
                      {provider.coverPhoto ? (
                        <img
                          src={provider.coverPhoto}
                          alt="Cover"
                          className="w-full h-full object-contain"
                          onClick={() => openImageViewer(provider.coverPhoto!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No cover photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-6 border-t">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              
              {showActions && provider.status === 'pending' && (
                <>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleReject}
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

      {/* Full-screen image viewer */}
      {isImageViewerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setIsImageViewerOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageViewerOpen(false);
              }}
            >
              <XCircle className="h-6 w-6" />
            </Button>
            
            <img
              src={imageViewerSrc}
              alt="Full-size view"
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.indexOf(imageViewerSrc);
                    const newIndex = (currentIndex - 1 + images.length) % images.length;
                    setImageViewerSrc(images[newIndex]);
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.indexOf(imageViewerSrc);
                    const newIndex = (currentIndex + 1) % images.length;
                    setImageViewerSrc(images[newIndex]);
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceProviderDetailsDialog;