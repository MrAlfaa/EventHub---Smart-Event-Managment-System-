import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceProvider } from "@/types";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const navigate = useNavigate();
  
  const handleViewProvider = () => {
    navigate(`/service-providers/${provider.id}`);
  };
  
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Cover and Profile Image Section */}
      <div className="relative h-40">
        {/* Cover Image */}
        <div className="absolute inset-0">
          <img
            src={provider.profileImage || "/placeholder-cover.jpg"}
            alt={`${provider.name} cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        {/* Profile Image */}
        <div className="absolute -bottom-6 left-4">
          <div className="h-16 w-16 rounded-full ring-4 ring-white overflow-hidden">
            <img
              src={provider.profileImage || "/placeholder-profile.jpg"}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        {/* New Badge */}
        {provider.isNewcomer && (
          <Badge className="absolute right-2 top-2 bg-blue-600 text-white">New</Badge>
        )}
      </div>

      <CardContent className="pt-8 px-4 pb-4">
        {/* Business Name and Rating */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{provider.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-medium">{provider.rating || "New"}</span>
            </div>
            <span className="text-sm text-gray-500">({provider.reviewCount || 0} reviews)</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="truncate">{provider.location || "Location not specified"}</span>
        </div>

        {/* Event Types */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {provider.eventTypes && provider.eventTypes.length > 0 ? (
            <>
              {provider.eventTypes.slice(0, 3).map((type, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50/50 text-xs">
                  {type}
                </Badge>
              ))}
              {provider.eventTypes.length > 3 && (
                <Badge variant="outline" className="bg-gray-50 text-xs">
                  +{provider.eventTypes.length - 3}
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-xs">
              All Events
            </Badge>
          )}
        </div>

        {/* View More Button */}
        <Button 
          className="w-full" 
          variant="outline" 
          onClick={handleViewProvider}
        >
          View More
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );}
