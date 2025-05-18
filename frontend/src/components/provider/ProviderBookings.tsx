import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { BookingDetailsView } from "@/components/service-provider/BookingDetailsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsDetailsTab, ManageAvailabilityTab } from "@/components/service-provider/booking-tabs";
import AddBookingForm from "@/components/service-provider/AddBookingForm";
import { BookingData } from "@/components/service-provider/booking-tabs/BookingsDetailsTab";

// Import other necessary components and modules

const ProviderBookings = () => {
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' or 'availability'
  const [showAddBookingDialog, setShowAddBookingDialog] = useState(false);
  const [showBookingDetailsDialog, setShowBookingDetailsDialog] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const { user } = useApp();
  
  // Create a ref for the BookingsDetailsTab component's state updater function
  const bookingsTabRef = useRef<{ handleBookingAdded: (booking: BookingData) => void }>({
    handleBookingAdded: () => {} // Default no-op function
  });

  const viewBookingDetails = (bookingId: number) => {
    setCurrentBookingId(bookingId);
    setShowBookingDetailsDialog(true);
  };

  // Function to handle new bookings
  const handleBookingAdded = (newBooking: BookingData) => {
    // Call the BookingsDetailsTab's handleBookingAdded function
    bookingsTabRef.current.handleBookingAdded(newBooking);
    // Close the add booking dialog
    setShowAddBookingDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setShowAddBookingDialog(true)}
            className="flex items-center"
            variant="default"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="bookings" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <div className="border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="bookings" className="text-base py-3">Booking Details</TabsTrigger>
            <TabsTrigger value="availability" className="text-base py-3">Manage Availability</TabsTrigger>
          </TabsList>
        </div>

        {/* Booking Details Tab Content */}
        <TabsContent value="bookings" className="mt-6">
          <div className="flex gap-2 pb-4">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              className={filter === "all" ? "bg-blue-50" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"}
              className={filter === "pending" ? "bg-yellow-50" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={filter === "confirmed" ? "default" : "outline"}
              className={filter === "confirmed" ? "bg-blue-50" : ""}
              onClick={() => setFilter("confirmed")}
            >
              Confirmed
            </Button>
            <Button 
              variant={filter === "completed" ? "default" : "outline"}
              className={filter === "completed" ? "bg-green-50" : ""}
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
            <Button 
              variant={filter === "cancelled" ? "default" : "outline"}
              className={filter === "cancelled" ? "bg-red-50" : ""}
              onClick={() => setFilter("cancelled")}
            >
              Cancelled
            </Button>
          </div>
          
          <BookingsDetailsTab 
            filter={filter} 
            ref={(ref: any) => {
              if (ref) {
                bookingsTabRef.current = ref;
              }
            }} 
          />
        </TabsContent>

        {/* Availability Management Tab Content */}
        <TabsContent value="availability" className="mt-6">
          <ManageAvailabilityTab />
        </TabsContent>
      </Tabs>
      
      {/* We'll use the details view component later when implementing the add booking functionality */}
      <BookingDetailsView 
        open={showBookingDetailsDialog} 
        onOpenChange={setShowBookingDetailsDialog} 
        bookingId={currentBookingId} 
      />
      
      {/* This will be implemented later */}
      {showAddBookingDialog && (
        <AddBookingForm
          open={showAddBookingDialog}
          onOpenChange={setShowAddBookingDialog}
          onBookingAdded={handleBookingAdded}
        />
      )}
    </div>
  );
};



export default ProviderBookings;
