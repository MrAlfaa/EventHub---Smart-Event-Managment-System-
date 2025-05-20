import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceProvider } from "@/types";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

interface ContactInfoProps {
  provider: ServiceProvider;
  onChat: () => void;
}

export const ContactInfo = ({ provider, onChat }: ContactInfoProps) => {
  // Helper function to safely render location
  const renderLocation = () => {
    if (!provider.location) return "Location not specified";
    
    if (typeof provider.location === 'string') {
      return provider.location;
    }
    
    // Check if location is an object with the expected structure
    if (typeof provider.location === 'object') {
      // Use optional chaining to safely access properties
      const full = (provider.location as any).full;
      const city = (provider.location as any).city;
      const province = (provider.location as any).province;
      
      if (full) return full;
      if (city && province) return `${city}, ${province}`;
      if (city) return city;
      if (province) return province;
    }
    
    return "Location not specified";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider.contact && (
          <>
            {provider.contact.email && (
              <div className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Email</h4>
                  <a 
                    href={`mailto:${provider.contact.email}`} 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {provider.contact.email}
                  </a>
                </div>
              </div>
            )}
            
            {provider.contact.phone && (
              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Phone</h4>
                  <a 
                    href={`tel:${provider.contact.phone}`} 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {provider.contact.phone}
                  </a>
                </div>
              </div>
            )}
          </>
        )}
        
        {provider.location && (
          <div className="flex items-start">
            <MapPin className="mr-3 h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-gray-700">Location</h4>
              <p className="text-sm text-gray-600">{renderLocation()}</p>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onChat}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
};