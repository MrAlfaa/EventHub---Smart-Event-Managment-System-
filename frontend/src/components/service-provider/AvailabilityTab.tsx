import { Card, CardContent } from "@/components/ui/card";
import { ServiceProvider } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader, CheckCircle } from "lucide-react";
import providerService from "@/services/providerService";

interface AvailabilityTabProps {
  provider: ServiceProvider;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onBookNow: () => void;
}

interface UnavailableDate {
  date: Date;
  type: string;
  note?: string;
}

export const AvailabilityTab = ({ 
  provider, 
  selectedDate, 
  onDateSelect, 
  onBookNow 
}: AvailabilityTabProps) => {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  
  // Fetch provider's availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      if (provider && provider.id) {
        setIsLoading(true);
        try {
          const availabilityData = await providerService.getProviderAvailability(provider.id);
          
          // Convert availability data to the format needed for calendar
          const formattedDates = availabilityData.map((item: any) => ({
            date: new Date(item.date),
            type: item.type || 'unavailable',
            note: item.note
          }));
          
          setUnavailableDates(formattedDates);
        } catch (error) {
          console.error("Failed to fetch availability:", error);
          toast.error("Couldn't load provider's availability");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAvailability();
  }, [provider]);
  
  // Check if selected date is available
  useEffect(() => {
    if (date) {
      const dateString = date.toDateString();
      const unavailable = unavailableDates.some(
        unavailableDate => unavailableDate.date.toDateString() === dateString
      );
      setIsAvailable(!unavailable);
    } else {
      setIsAvailable(null);
    }
  }, [date, unavailableDates]);
  
  // Function to get date modifiers for the calendar
  const getDateModifiers = () => {
    return {
      unavailable: unavailableDates
        .filter(d => d.type === 'unavailable' || d.type === 'booked')
        .map(d => d.date),
      selected: date ? [date] : []
    };
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      // Check if date is available before selecting
      const dateString = newDate.toDateString();
      const unavailable = unavailableDates.some(
        unavailableDate => unavailableDate.date.toDateString() === dateString
      );
      
      if (unavailable) {
        toast.error("This date is not available for booking");
        return;
      }
      
      onDateSelect(newDate.toISOString());
      toast.success("Date selected! Click 'Continue to Packages' to choose a package.");
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Check Availability</h3>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-72">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading availability...</span>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border"
                disabled={{ before: new Date() }}
                modifiers={getDateModifiers()}
                modifiersStyles={{
                  unavailable: { 
                    backgroundColor: "#fee2e2", 
                    color: "#ef4444",
                    textDecoration: "line-through" 
                  },
                  selected: {
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    fontWeight: "bold"
                  }
                }}
                footer={
                  <div className="mt-2 pt-2 border-t text-xs flex justify-start gap-4">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-white border"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-200"></div>
                      <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium mb-3">Booking Process</h4>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-medium text-blue-600 mr-2">1</span>
                  <span>Select an available date on the calendar</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-medium text-blue-600 mr-2">2</span>
                  <span>Click 'Continue to Packages' to browse packages</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-medium text-blue-600 mr-2">3</span>
                  <span>Choose a package and proceed to checkout</span>
                </li>
              </ol>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Selected Date</h4>
              {date ? (
                <>
                  <p>{date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isAvailable === null ? 'bg-gray-100 text-gray-800' :
                      isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isAvailable === null ? 'Select a date' :
                       isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Please select a date</p>
              )}
            </div>
            
            <Button 
              className="w-full mt-4" 
              disabled={!date || !isAvailable}
              onClick={onBookNow}
            >
              {!date ? 'Select a Date First' : 
               !isAvailable ? 'This Date is Not Available' : 'Continue to Packages'}
            </Button>
            
            <p className="mt-2 text-xs text-gray-500">
              Selecting a date doesn't guarantee availability. After booking, the service provider will confirm your event date.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};