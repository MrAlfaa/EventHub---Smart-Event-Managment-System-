import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { PublicEvent } from "@/types";

interface PublicEventCardProps {
  event: PublicEvent;
}

export function PublicEventCard({ event }: PublicEventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.bannerImage} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold">{event.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(event.eventDate), 'PPP')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <a 
              href={event.location.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {event.location.address}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}