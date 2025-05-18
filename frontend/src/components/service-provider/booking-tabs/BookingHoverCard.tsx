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
        className="w-72 p-0 shadow-md border-0 rounded-md overflow-hidden"
      >
        {/* Colorful header based on status - more compact */}
        <div className={`
          p-3 text-white relative
          ${booking.status === 'pending' ? 'bg-amber-500' : 
            booking.status === 'completed' ? 'bg-blue-500' :
            'bg-red-500'}
        `}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-base">{booking.packageName}</h4>
              <p className="text-xs opacity-90">
                {booking.customerName}
              </p>
            </div>
            <div className="bg-white text-gray-800 font-bold rounded-md h-10 w-10 flex items-center justify-center text-sm">
              ${booking.fullAmount - booking.advanceAmount}
            </div>
          </div>
          
          {booking.status === 'pending' && (
            <div className="mt-1 flex items-center bg-white/20 rounded text-xs p-0.5 pl-1">
              <Clock className="h-3 w-3 mr-0.5" />
              <span>{diffDays} {diffDays === 1 ? 'day' : 'days'} left</span>
            </div>
          )}
        </div>
        
        {/* Event details - more compact */}
        <div className="p-3 bg-white space-y-2">
          {/* Make the info rows more compact */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-blue-100 p-1 rounded">
              <Calendar className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-green-100 p-1 rounded">
              <FileText className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-gray-500">Event:</span>
            <span className="font-medium">{booking.fullDetails.eventType}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-purple-100 p-1 rounded">
              <MapPin className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-gray-500">Location:</span>
            <span className="font-medium truncate">{booking.fullDetails.eventLocation.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-amber-100 p-1 rounded">
              <Users className="h-3 w-3 text-amber-600" />
            </div>
            <span className="text-gray-500">Crowd:</span>
            <span className="font-medium">{booking.fullDetails.crowdSize} people</span>
          </div>
          
          {booking.fullDetails.eventCoordinatorName && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="bg-red-100 p-1 rounded">
                <User className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-gray-500">Coordinator:</span>
              <span className="font-medium">{booking.fullDetails.eventCoordinatorName}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-indigo-100 p-1 rounded">
              <Phone className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium">{booking.fullDetails.phoneNumber}</span>
          </div>
          
          {booking.fullDetails.eventLocation.mapLink && (
            <a
              href={booking.fullDetails.eventLocation.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              View on Google Maps
            </a>
          )}
        </div>
        
        {/* Payment info footer - more compact */}
        <div className="border-t p-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <DollarSign className="h-3 w-3 text-gray-500 mr-1" />
              <span className="text-gray-500">Payment:</span>
            </div>
            <div className="font-medium">
              ${booking.advanceAmount} paid of ${booking.fullAmount}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}      