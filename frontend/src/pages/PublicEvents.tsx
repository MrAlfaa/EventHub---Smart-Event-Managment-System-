import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { PublicEvent } from "@/types";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, MapPin, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Extend PublicEvent type to include eventType
interface ExtendedPublicEvent extends PublicEvent {
  eventType: string;
}

export default function PublicEvents() {
  const [events, setEvents] = useState<ExtendedPublicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ExtendedPublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Lists for filter options
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // In a real application, you would fetch this data from your backend
  useEffect(() => {
    // Simulating API call with mock data (extended with eventType)
    const mockEvents: ExtendedPublicEvent[] = [
      {
        id: "1",
        title: "Summer Music Festival 2025",
        description: "A day filled with live music performances, food stalls, and entertainment.",
        bannerImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
        location: {
          address: "Viharamahadevi Park, Colombo",
          googleMapLink: "https://maps.google.com/?q=Viharamahadevi+Park"
        },
        eventDate: "2025-06-15",
        createdAt: new Date().toISOString(),
        eventType: "Music"
      },
      {
        id: "2",
        title: "Food & Culture Festival",
        description: "Explore Sri Lankan cuisine and cultural performances.",
        bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        location: {
          address: "BMICH, Colombo",
          googleMapLink: "https://maps.google.com/?q=BMICH"
        },
        eventDate: "2025-07-01",
        createdAt: new Date().toISOString(),
        eventType: "Food"
      },
      {
        id: "3",
        title: "Tech Conference 2025",
        description: "Join industry leaders to discuss the latest technology trends and innovations.",
        bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        location: {
          address: "Cinnamon Grand, Colombo",
          googleMapLink: "https://maps.google.com/?q=Cinnamon+Grand+Colombo"
        },
        eventDate: "2025-05-20",
        createdAt: new Date().toISOString(),
        eventType: "Technology"
      },
      {
        id: "4",
        title: "Kandy Perahera Festival",
        description: "Experience the traditional procession with elephants, dancers, and musicians.",
        bannerImage: "https://images.unsplash.com/photo-1534335675817-11b9c8a47fab",
        location: {
          address: "Temple of the Tooth, Kandy",
          googleMapLink: "https://maps.google.com/?q=Temple+of+the+Tooth+Kandy"
        },
        eventDate: "2025-08-10",
        createdAt: new Date().toISOString(),
        eventType: "Cultural"
      }
    ];

    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
    
    // Extract unique event types and locations for filter options
    const types = Array.from(new Set(mockEvents.map(event => event.eventType)));
    const locs = Array.from(new Set(mockEvents.map(event => {
      const parts = event.location.address.split(', ');
      return parts[parts.length - 1]; // Get the city name
    })));
    
    setEventTypes(types);
    setLocations(locs);
    setLoading(false);
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    let result = [...events];
    
    // Apply event type filter
    if (eventTypeFilter !== "all") {
      result = result.filter(event => event.eventType === eventTypeFilter);
    }
    
    // Apply location filter
    if (locationFilter !== "all") {
      result = result.filter(event => event.location.address.includes(locationFilter));
    }
    
    // Apply date filter
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      // Set time to midnight for date comparison
      selectedDate.setHours(0, 0, 0, 0);
      
      result = result.filter(event => {
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === selectedDate.getTime();
      });
    }
    
    setFilteredEvents(result);
  }, [eventTypeFilter, locationFilter, dateFilter, events]);

  // Reset all filters
  const resetFilters = () => {
    setEventTypeFilter("all");
    setLocationFilter("all");
    setDateFilter(undefined);
  };

  // Check if any filters are active
  const hasActiveFilters = eventTypeFilter !== "all" || locationFilter !== "all" || dateFilter !== undefined;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Public Events</h1>
          
          <div className="flex flex-wrap gap-2 items-center">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </Button>
            )}
            
            {/* Show active filter badges */}
            {eventTypeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Type: {eventTypeFilter}
                <X 
                  size={14} 
                  className="cursor-pointer" 
                  onClick={() => setEventTypeFilter("all")}
                />
              </Badge>
            )}
            
            {locationFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Location: {locationFilter}
                <X 
                  size={14} 
                  className="cursor-pointer" 
                  onClick={() => setLocationFilter("all")}
                />
              </Badge>
            )}
            
            {dateFilter && (
              <Badge variant="secondary" className="gap-1">
                Date: {format(dateFilter, "PPP")}
                <X 
                  size={14} 
                  className="cursor-pointer" 
                  onClick={() => setDateFilter(undefined)}
                />
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filters section - always visible now */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="event-type-filter" className="text-sm font-medium mb-1 block">
              Event Type
            </Label>
            <Select 
              value={eventTypeFilter} 
              onValueChange={setEventTypeFilter}
            >
              <SelectTrigger id="event-type-filter" className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location-filter" className="text-sm font-medium mb-1 block">
              Location
            </Label>
            <Select 
              value={locationFilter} 
              onValueChange={setLocationFilter}
            >
              <SelectTrigger id="location-filter" className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date-filter" className="text-sm font-medium mb-1 block">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events match your current filters.</p>
            {hasActiveFilters && (
              <Button 
                variant="link" 
                onClick={resetFilters}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge>{event.eventType}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{event.location.address}</span>
                    </div>
                    <a
                      href={event.location.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}