import { Button } from "@/components/ui/button";
import { ServiceProvider } from "@/types";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

interface ContactInfoProps {
  provider: ServiceProvider;
  onChat: () => void;
}

export const ContactInfo = ({ provider, onChat }: ContactInfoProps) => {
  return (
    <div className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <MapPin className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium">Location</p>
            <p className="text-gray-600 text-sm sm:text-base break-words">{provider.location.address}</p>
            <p className="text-gray-600">{provider.location.city}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Phone className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-gray-600 text-sm sm:text-base">{provider.contact.phone}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Mail className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium">Email</p>
            <p className="text-gray-600 text-sm sm:text-base break-words">{provider.contact.email}</p>
          </div>
        </div>
      </div>
      
      <Button className="mt-4 sm:mt-6 w-full" onClick={onChat}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Message Provider
      </Button>
    </div>
  );
};
