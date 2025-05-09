import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BookingData } from "./BookingsDetailsTab";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Package, 
  User,
  FileText, 
  Phone, 
  DollarSign,
  Link as LinkIcon
} from "lucide-react";

interface BookingHoverCardProps {
  booking: BookingData;
  children: React.ReactNode;
}

export const BookingHoverCard: React.FC<BookingHoverCardProps> = ({ booking, children }) => {
  // Format date for better display
  const eventDate = new Date(booking.bookingDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  // Calculate remaining days until event
  const today = new Date();
  const diffTime = Math.abs(eventDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start"
        className="w-80 p-0 shadow-lg border-0 rounded-xl overflow-hidden"
      >
        {/* Colorful header based on status */}
        <div className={`
          p-4 text-white relative
          ${booking.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
            booking.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'}
        `}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg">{booking.packageName}</h4>
              <p className="text-sm opacity-90">
                {booking.customerName}
              </p>
            </div>
            <div className="bg-white text-gray-800 font-bold rounded-full h-12 w-12 flex items-center justify-center">
              ${booking.fullAmount - booking.advanceAmount}
            </div>
          </div>
          
          {booking.status === 'pending' && (
            <div className="mt-2 flex items-center bg-white/20 rounded-md p-1 pl-2 text-sm">
              <Clock className="h-3 w-3 mr-1" />
              <span>{diffDays} {diffDays === 1 ? 'day' : 'days'} remaining</span>
            </div>
          )}
        </div>
        
        {/* Event details */}
        <div className="p-4 bg-white space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-blue-100 p-1 rounded">
              <Calendar className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-green-100 p-1 rounded">
              <FileText className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-gray-500">Event Type:</span>
            <span className="font-medium">{booking.fullDetails.eventType}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-purple-100 p-1 rounded">
              <MapPin className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-gray-500">Location:</span>
            <span className="font-medium">{booking.fullDetails.eventLocation.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-amber-100 p-1 rounded">
              <Users className="h-3 w-3 text-amber-600" />
            </div>
            <span className="text-gray-500">Crowd Size:</span>
            <span className="font-medium">{booking.fullDetails.crowdSize} people</span>
          </div>
          
          {booking.fullDetails.eventCoordinatorName && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="bg-red-100 p-1 rounded">
                <User className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-gray-500">Coordinator:</span>
              <span className="font-medium">{booking.fullDetails.eventCoordinatorName}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-indigo-100 p-1 rounded">
              <Phone className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-gray-500">Customer Phone:</span>
            <span className="font-medium">{booking.fullDetails.phoneNumber}</span>
          </div>
          
          {booking.fullDetails.eventLocation.mapLink && (
            <a
              href={booking.fullDetails.eventLocation.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              View on Google Maps
            </a>
          )}
        </div>
        
        {/* Payment info footer */}
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <DollarSign className="h-3.5 w-3.5 text-gray-500 mr-1" />
              <span className="text-gray-500">Payment Status:</span>
            </div>
            <div className="text-sm font-medium">
              ${booking.advanceAmount} paid of ${booking.fullAmount}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};