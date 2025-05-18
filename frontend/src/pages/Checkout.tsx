import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Trash, CreditCard, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BookingForm from "@/components/booking/bookingForm";
import PaymentDetailsForm from "@/components/booking/PaymentDetailsForm";
import DigitalBill from "@/components/booking/DigitalBill";
import bookingService from "@/services/bookingService";
import { useAuthStore } from "@/store/useAuthStore";

const Checkout = () => {
  const { cart, removeFromCart, getCartTotal } = useApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuthStore();
  
  // New state for forms
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [digitalBillOpen, setDigitalBillOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handleRemoveFromCart = (packageId: string) => {
    removeFromCart(packageId);
    toast.success("Item removed from cart");
  };

  const handleViewDetails = (provider: any) => {
    // Navigate to service provider profile with the package selected
    navigate(`/service-providers/${provider.providerId}?tab=packages&package=${provider.packageId}`);
  };

  // Handle booking flow
  const handleBookNow = (provider: any) => {
    setSelectedProvider(provider);
    setBookingFormOpen(true);
  };

  const handleBookingComplete = async (details: any) => {
    setBookingDetails(details);
    setBookingFormOpen(false);
    // Immediately open payment form after booking completion
    setPaymentFormOpen(true);
  };

  const handlePaymentComplete = async (details: any) => {
    setIsSubmitting(true);
    
    try {
      const paymentInfo = {
        ...details,
        paymentDate: new Date()
      };
      
      setPaymentDetails(paymentInfo);

      // Create a booking record
      const bookingData = {
        providerId: selectedProvider.providerId,
        packageId: selectedProvider.packageId,
        fullName: bookingDetails.fullName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        eventLocation: bookingDetails.eventLocation,
        eventCoordinatorName: bookingDetails.coordinatorName || null,
        eventCoordinatorContact: bookingDetails.coordinatorContact || null,
        eventDate: bookingDetails.eventDate,
        crowdSize: bookingDetails.crowdSize,
        eventType: selectedProvider.eventType,
        paymentMethod: "credit_card",
        paymentAmount: bookingDetails.advancedAmount,
        totalAmount: selectedProvider.price,
        status: "pending"
      };

      // Call API to create booking
      await bookingService.createBooking(bookingData);
      
      setPaymentFormOpen(false);
      setDigitalBillOpen(true);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBillConfirm = () => {
    setDigitalBillOpen(false);
    removeFromCart(selectedProvider.packageId);
    navigate("/profile?tab=bookings");
    toast.success("Booking completed successfully!");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">{cart.length} items in your cart</p>
            </div>
            <Button
              onClick={() => navigate("/service-providers")}
              variant="outline"
              className="mt-4 md:mt-0"
            >
              <ShoppingCart size={18} className="mr-2" />
              Continue Shopping
            </Button>
          </div>

          {cart.length === 0 ? (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
              <div className="rounded-full bg-blue-50 p-4 mb-4">
                <ShoppingCart size={32} className="text-blue-600" />
              </div>
              <p className="mb-2 text-xl font-semibold text-gray-800">Your cart is empty</p>
              <p className="mb-6 text-gray-500 max-w-md">
                Looks like you haven't added any service providers to your cart yet.
              </p>
              <Button 
                onClick={() => navigate("/service-providers")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Service Providers
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((provider) => (
                <div
                  key={provider.packageId}
                  className="group relative rounded-2xl border bg-white p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Section */}
                    <div className="relative mx-auto md:mx-0">
                      <div className="relative h-40 w-40 md:h-32 md:w-32 rounded-xl overflow-hidden ring-2 ring-blue-100">
                        <img
                          src={provider.profileImage}
                          alt={provider.name}
                          className="h-full w-full object-cover transform transition-transform group-hover:scale-105"
                        />
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
                      <div>
                        <h3 className="font-bold text-xl md:text-2xl text-gray-800 truncate">
                          {provider.name}
                        </h3>
                        <p className="text-blue-600 font-semibold mt-1 text-lg">
                          {provider.packageName}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3 inline-block">
                        <p className="text-sm text-blue-600 font-medium">Package Price</p>
                        <p className="font-bold text-xl md:text-2xl text-gray-900">
                          {provider.price.toLocaleString()} {provider.currency}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleViewDetails(provider)}
                          className="flex-1 bg-white hover:bg-gray-50 border-2 hover:border-blue-600"
                        >
                          <Eye size={18} className="mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => handleBookNow(provider)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard size={18} className="mr-2" />
                          Book Now
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleRemoveFromCart(provider.packageId)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cart Summary */}
              <div className="mt-6 bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Cart Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{getCartTotal().toLocaleString()} LKR</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  * You can book each package individually by clicking "Book Now" button
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add forms */}
      {selectedProvider && (
        <>
          <BookingForm
            isOpen={bookingFormOpen}
            onClose={() => setBookingFormOpen(false)}
            selectedPackage={{
              id: selectedProvider.packageId,
              name: selectedProvider.packageName,
              price: selectedProvider.price,
              currency: selectedProvider.currency || "LKR",
              eventType: selectedProvider.eventType || "Event",
              capacity: selectedProvider.capacity || { min: 10, max: 1000 },
              description: selectedProvider.description || "",
              services: selectedProvider.services || [] // Add the missing services property
            }}
            onComplete={handleBookingComplete}
          />

          <PaymentDetailsForm
            isOpen={paymentFormOpen}
            onClose={() => setPaymentFormOpen(false)}
            onComplete={handlePaymentComplete}
            amount={bookingDetails?.advancedAmount || 0}
            currency={selectedProvider.currency || "LKR"}
          />

          <DigitalBill
            isOpen={digitalBillOpen}
            onClose={() => setDigitalBillOpen(false)}
            onConfirm={handleBillConfirm}
            bookingDetails={{
              ...bookingDetails,
              packageName: selectedProvider.packageName,
              currency: selectedProvider.currency || "LKR"
            }}
            paymentDetails={paymentDetails}
          />
        </>
      )}
    </Layout>
  );
};

export default Checkout;
