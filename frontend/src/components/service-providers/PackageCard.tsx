import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Users, Calendar, ImageOff, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PackageCardProps {
  package: Package;
}

export const PackageCard = ({ package: pkg }: PackageCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showBundleDialog, setShowBundleDialog] = useState(false);
  
  // Check if this is a combined package
  const isCombined = pkg.combined === true && pkg.packages && pkg.packages.length > 0;
  
  const providerInfo = pkg.providerInfo || {
    id: "",
    name: "Unknown Provider",
    businessName: "",
    profileImage: null,
  };

  // Placeholder image URL
  const placeholderImage = "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
  
  // Get first image with error handling
  const coverImage = !imageError && pkg.images && pkg.images.length > 0 
    ? pkg.images[0] 
    : placeholderImage;

  // Limit description to 100 characters
  const shortDescription = pkg.description?.length > 100
    ? pkg.description.substring(0, 100) + "..."
    : pkg.description || "No description available";

  // Get crowd capacity range
  const capacityText = 
    pkg.crowdSizeMin === pkg.crowdSizeMax
      ? `${pkg.crowdSizeMax} guests`
      : `${pkg.crowdSizeMin}-${pkg.crowdSizeMax} guests`;
  
  // Handle image error
  const handleImageError = () => {
    console.log(`Image failed to load: ${coverImage}`);
    setImageError(true);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ImageOff className="h-12 w-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={coverImage}
              alt={pkg.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              onError={handleImageError}
            />
          )}
          
          {/* Combined Package Badge */}
          {isCombined && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              <Layers className="h-3 w-3 mr-1" />
              Combined Package
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 flex items-center bg-white/90 px-2 py-1 rounded-full">
            {isCombined ? (
              <span className="text-xs font-medium">Multiple Providers</span>
            ) : (
              <>
                <Avatar className="h-6 w-6 mr-1.5">
                  <AvatarImage src={providerInfo.profileImage || undefined} alt={providerInfo.name} />
                  <AvatarFallback>{providerInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[140px]">
                  {providerInfo.businessName || providerInfo.name}
                </span>
              </>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-base line-clamp-1">{pkg.name}</h3>
              <Badge variant="outline" className="ml-2 px-1.5 py-0 h-5 text-xs">
                {pkg.eventTypes?.[0] || "Any Event"}
              </Badge>
            </div>

            {isCombined ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1 text-blue-700">Bundle Package - Save {formatCurrency((pkg.packages || []).reduce((acc, p) => acc + p.price, 0) - pkg.price)}</p>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {pkg.packages?.map((subPackage, index) => (
                    <li key={index} className="line-clamp-1 flex justify-between">
                      <span>{subPackage.name}</span>
                      <span className="text-gray-500">{formatCurrency(subPackage.price)}</span>
                    </li>
                  ))}
                  <li className="font-medium border-t pt-1 mt-1 list-none pl-0 flex justify-between">
                    <span>Total Price:</span>
                    <span>{formatCurrency(pkg.price)}</span>
                  </li>
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-600 line-clamp-2 h-10">
                {shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1 text-gray-400" />
                <span className="text-xs">{capacityText}</span>
              </div>
              {pkg.eventTypes?.length > 0 && (
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  <span className="text-xs">{pkg.eventTypes.join(", ")}</span>
                </div>
              )}
              {/* Display services for combined packages */}
              {isCombined && pkg.serviceTypes && (
                <div className="flex items-center">
                  <Layers className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  <span className="text-xs">{pkg.serviceTypes.join(" + ")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="font-semibold text-blue-700">
            {formatCurrency(pkg.price)} <span className="text-xs font-normal text-gray-500">{pkg.currency}</span>
          </div>
          <Button size="sm" onClick={() => isCombined ? setShowBundleDialog(true) : null} asChild={!isCombined}>
            {isCombined ? (
              <span>View Bundle</span>
            ) : (
              <Link to={`/service-providers/${providerInfo.id}?tab=packages&packageId=${pkg.id}`}>View Details</Link>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Bundle Details Dialog */}
      {isCombined && (
        <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-800">{pkg.name}</DialogTitle>
              <DialogDescription className="text-base text-gray-700 mt-1">
                {pkg.description}
              </DialogDescription>
            </DialogHeader>
            
            {/* Bundle Content */}
            <div className="mt-4 space-y-6">
              {/* Image gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.images && pkg.images.length > 0 ? (
                  pkg.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${pkg.name} image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => { e.currentTarget.src = placeholderImage }}
                    />
                  ))
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-100 rounded-md">
                    <ImageOff className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Package details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bundle Details</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.serviceTypes?.map((service, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-700">{pkg.description}</p>
                  </div>
                  
                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-2">What's Included</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="text-gray-700">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Included Packages */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Included Packages</h4>
                    <div className="space-y-4">
                      {pkg.packages && pkg.packages.map((subPkg, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold">{subPkg.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{subPkg.description?.substring(0, 120)}...</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {subPkg.providerInfo?.serviceType || 'Service'}
                            </Badge>
                          </div>
                          <div className="mt-3 text-sm">
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="text-gray-700">
                                Provided by: {subPkg.providerInfo?.businessName || subPkg.providerInfo?.name || 'Service Provider'}
                              </span>
                              <span className="font-semibold text-blue-700">{formatCurrency(subPkg.price)} {subPkg.currency}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Price breakdown */}
                <div className="bg-gray-50 p-4 rounded-md h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                  
                  <div className="space-y-2">
                    {pkg.packages?.map((subPkg, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{subPkg.name}</span>
                        <span>{formatCurrency(subPkg.price)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-dashed my-2"></div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Combined Total</span>
                      <span>{formatCurrency((pkg.packages || []).reduce((acc, p) => acc + p.price, 0))}</span>
                    </div>
                    
                    <div className="flex justify-between text-green-600">
                      <span>Bundle Discount</span>
                      <span>-{formatCurrency((pkg.packages || []).reduce((acc, p) => acc + p.price, 0) - pkg.price)}</span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Price</span>
                        <span className="text-blue-700">{formatCurrency(pkg.price)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">All prices include applicable taxes</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Book This Bundle</Button>
                    
                    <p className="text-xs text-center text-gray-500 mt-3">
                      You will save {formatCurrency((pkg.packages || []).reduce((acc, p) => acc + p.price, 0) - pkg.price)} 
                      with this bundle (
                      {Math.round(((pkg.packages || []).reduce((acc, p) => acc + p.price, 0) - pkg.price) / 
                      (pkg.packages || []).reduce((acc, p) => acc + p.price, 0) * 100)}% off)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};