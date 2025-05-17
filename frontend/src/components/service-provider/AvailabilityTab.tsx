import { Card, CardContent } from "@/components/ui/card";
import { ServiceProvider } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

interface AvailabilityTabProps {
  provider: ServiceProvider;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onBookNow: () => void;
}

export const AvailabilityTab = ({ 
  provider, 
  selectedDate, 
  onDateSelect, 
  onBookNow 
}: AvailabilityTabProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Check Availability</h3>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={{ before: new Date() }}
            />
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Selected Date</h4>
              {date ? (
                <p>{date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              ) : (
                <p className="text-gray-500">Please select a date</p>
              )}
            </div>
            
            <Button 
              className="w-full" 
              disabled={!date}
              onClick={onBookNow}
            >
              Check Availability
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