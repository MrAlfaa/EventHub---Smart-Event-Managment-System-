import { Button } from "@/components/ui/button";
import { ServiceProvider } from "@/types";
import { Calendar as CalendarIcon, Check, Info } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format, isValid, parse } from "date-fns";

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
  // Convert string dates to Date objects for the calendar
  const availableDatesAsObjects = provider.availableDates.map(date => 
    new Date(date)
  );
  
  const bookedDatesAsObjects = provider.bookedDates?.map(date => 
    new Date(date)
  ) || [];
  
  // Parse the selected date string to a Date object if it exists
  const selectedDateObject = selectedDate ? new Date(selectedDate) : null;
  
  // Function to determine if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDatesAsObjects.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };
  
  // Function to determine if a date is booked
  const isDateBooked = (date: Date) => {
    return bookedDatesAsObjects.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  // Function to determine if a date is available and not booked
  const isDateBookable = (date: Date) => {
    return isDateAvailable(date) && !isDateBooked(date);
  };
  
  // Custom day rendering to show available/booked status
  const renderDay = (day: Date) => {
    const isAvailable = isDateAvailable(day);
    const isBooked = isDateBooked(day);
    const isSelected = selectedDateObject && day.toDateString() === selectedDateObject.toDateString();
    
    return (
      <div className={`relative p-1 ${isDateBookable(day) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isDateBookable(day)
                ? 'hover:bg-blue-100' 
                : isBooked 
                  ? 'bg-red-50 text-red-400 line-through' 
                  : 'text-gray-400'
          }`}
        >
          {day.getDate()}
        </div>
        {isDateBookable(day) && !isSelected && (
          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500"></div>
        )}
      </div>
    );
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date && isDateBookable(date)) {
      // Convert the date object back to a string in the expected format
      onDateSelect(date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Available Dates</h2>
      
      <p className="mb-4 text-gray-600">
        Select a date to book this service provider:
      </p>
      
      <div className="mb-6">
        <Calendar
          mode="single"
          selected={selectedDateObject || undefined}
          onSelect={handleDateSelect}
          disabled={(date) => !isDateBookable(date)}
          modifiers={{
            available: (date) => isDateBookable(date),
            booked: (date) => isDateBooked(date),
          }}
          modifiersClassNames={{
            available: "text-green-600",
            booked: "text-red-400 line-through",
          }}
          components={{
            Day: ({ date, ...props }) => renderDay(date),
          }}
          className="border rounded-md p-3"
        />
      </div>
      
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-400 mr-2"></div>
          <span className="text-sm text-gray-600">Booked</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
      </div>
      
      <div className="rounded-md bg-blue-50 p-4 text-blue-800">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Note:</strong> Only dates shown in green are available for booking. Dates in red are already booked.
          </p>
        </div>
      </div>
    </div>
  );
};
