import { Badge } from "@/components/ui/badge";
import { ServiceProvider } from "@/types";
import { MapPin, Mail, Phone, Globe, CalendarRange, ListChecks, Info, Quote } from "lucide-react";

interface AboutTabProps {
  provider: ServiceProvider;
}

export const AboutTab = ({ provider }: AboutTabProps) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-black">About {provider.name}</h2>
      
      {/* Slogan Section - only show if the provider has a slogan */}
      {provider.slogan && (
        <div className="mb-6">
          <div className="p-4 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <span className="p-1 rounded-full">
                <Quote className="h-5 w-5 text-blue-600" />
              </span>
            </div>
            <p className="text-blue-700 text-xl font-medium italic">{provider.slogan}</p>
          </div>
        </div>
      )}
      
      {/* Description Section */}
      <div className="mb-6">
        <h3 className="mb-3 font-semibold flex items-center text-black">
          <span className="mr-2 p-1 rounded-full">
            <Info className="h-4 w-4 text-blue-600" />
          </span>
          Description
        </h3>
        <div className="p-4 rounded-lg">
          <p className="text-black">{provider.description}</p>
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="mb-2 font-semibold text-black">Contact Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-black text-sm">{provider.location.address}, {provider.location.city}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-black text-sm">{provider.contact.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-black text-sm">{provider.contact.phone}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold flex items-center text-black">
            <span className="mr-2 p-1 rounded-full border border-blue-200">
              <ListChecks className="h-4 w-4 text-blue-600" />
            </span>
            Service Offered
          </h3>
          <div className="flex flex-wrap gap-2">
            {provider.services.length > 0 ? (
              <Badge variant="outline" className="text-black border-blue-200">
                {provider.services[0]}
              </Badge>
            ) : (
              <span className="text-sm text-black">No service specified</span>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="mb-3 font-semibold flex items-center text-black">
            <span className="mr-2 p-1 rounded-full border border-blue-200">
              <CalendarRange className="h-4 w-4 text-blue-600" />
            </span>
            Covered Event Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {provider.eventTypes.map((eventType, index) => (
              <Badge key={index} variant="outline" className="text-black border-blue-200">
                {eventType}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Service Locations Section */}
      {provider.serviceLocations && provider.serviceLocations.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold flex items-center text-black">
            <span className="mr-2 p-1 rounded-full">
              <Globe className="h-4 w-4 text-blue-600" />
            </span>
            Service Locations
          </h3>
          <div className="p-4 rounded-lg">
            <p className="text-sm text-black mb-3">
              We provide services in the following locations:
            </p>
            <div className="flex flex-wrap gap-2">
              {provider.serviceLocations.map((location, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-black border-blue-200"
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
