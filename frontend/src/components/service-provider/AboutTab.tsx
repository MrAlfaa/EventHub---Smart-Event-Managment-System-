import { Card, CardContent } from "@/components/ui/card";
import { ServiceProvider } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AboutTabProps {
  provider: ServiceProvider;
}

export const AboutTab = ({ provider }: AboutTabProps) => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">About {provider.name}</h3>
          <p className="text-gray-700">
            {provider.description || "No description provided."}
          </p>
        </div>
        
        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {provider.serviceType && provider.serviceType.length > 0 ? (
              provider.serviceType.map((service, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {service}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No services specified</p>
            )}
          </div>
        </div>
        
        {/* Event Types */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Event Types</h3>
          <div className="flex flex-wrap gap-2">
            {provider.eventTypes && provider.eventTypes.length > 0 ? (
              provider.eventTypes.map((type, index) => (
                <Badge key={index} variant="outline" className="bg-green-50">
                  {type}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No event types specified</p>
            )}
          </div>
        </div>
        
        {/* Service Locations */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Service Locations</h3>
          <div className="flex flex-wrap gap-2">
            {provider.serviceLocations && provider.serviceLocations.length > 0 ? (
              provider.serviceLocations.map((location, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50">
                  {location}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No specific service locations provided</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};