import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Users, Calendar, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface PackageCardProps {
  package: Package;
}

export const PackageCard = ({ package: pkg }: PackageCardProps) => {
  const [imageError, setImageError] = useState(false);
  
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
        <div className="absolute bottom-2 left-2 flex items-center bg-white/90 px-2 py-1 rounded-full">
          <Avatar className="h-6 w-6 mr-1.5">
            <AvatarImage src={providerInfo.profileImage || undefined} alt={providerInfo.name} />
            <AvatarFallback>{providerInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate max-w-[140px]">
            {providerInfo.businessName || providerInfo.name}
          </span>
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

          <p className="text-sm text-gray-600 line-clamp-2 h-10">
            {shortDescription}
          </p>

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
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="font-semibold text-blue-700">
          {formatCurrency(pkg.price)} <span className="text-xs font-normal text-gray-500">{pkg.currency}</span>
        </div>
        <Button size="sm" asChild>
          <Link to={`/service-providers/${providerInfo.id}?tab=packages&packageId=${pkg.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};