import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Trash, CreditCard, Check, Package, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BookingForm from "@/components/booking/bookingForm";
import PaymentDetailsForm from "@/components/booking/PaymentDetailsForm";
import DigitalBill from "@/components/booking/DigitalBill";

const Checkout = () => {
  const { cart, removeFromCart } = useApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const totalAmount = cart.reduce(
    (sum, provider) => {
      // Check if provider.pricing exists and has required properties
      if (provider.pricing && typeof provider.pricing.minPrice === 'number' && typeof provider.pricing.maxPrice === 'number') {
        return sum + (provider.pricing.minPrice + provider.pricing.maxPrice) / 2;
      }
      // If there's a package price, use that instead
      else if (provider.price || provider.packagePrice) {
        return sum + (provider.price || provider.packagePrice || 0);
      }
      // Return the current sum unchanged if pricing data is missing
      return sum;
    },
    0
  );

  const handlePackageClick = (providerId: string, packageId?: string) => {
    if (!providerId) return;
    // Fix the URL path to match your routing structure
    navigate(`/service-provider/${providerId}?tab=packages${packageId ? `&package=${packageId}` : ''}`);
  };

  const handleRemoveFromCart = (e: React.MouseEvent, providerId: string) => {
    e.stopPropagation();
    removeFromCart(providerId);
    toast.success("Item removed from cart");
  };
  
  const handleCheckout = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Your booking was successful!", {
        description: "You will receive a confirmation email shortly.",
      });
      navigate("/");
    }, 1500);
  };

  // New state for forms
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [digitalBillOpen, setDigitalBillOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Handle booking flow
  const handleBookNow = (provider: any) => {
    console.log("Starting booking flow for provider:", provider);
    setSelectedProvider(provider);
    setBookingFormOpen(true);
  };

  const handleBookingComplete = (details: any) => {
    console.log("Booking details received:", details);
    setBookingDetails(details);
    setBookingFormOpen(false);
    // Immediately open payment form after booking completion
    setPaymentFormOpen(true);
  };

  const handlePaymentComplete = (details: any) => {
    console.log("Payment details received:", details);
    setPaymentDetails({
      ...details,
      paymentDate: new Date()
    });
    setPaymentFormOpen(false);
    setDigitalBillOpen(true);
  };

  const handleBillConfirm = () => {
    setDigitalBillOpen(false);
    removeFromCart(selectedProvider.id);
    navigate("/");
    toast.success("Booking completed successfully!");
  };

  const handleViewDetails = (provider: any) => {
    // Make sure we have a valid ID, checking different possible properties
    const providerId = provider.serviceProviderId || provider.providerId || provider.id;
    if (!providerId) {
      toast.error("Service provider details not available");
      return;
    }
    
    // Navigate to service provider profile with the package selected
    navigate(`/service-providers/${providerId}?tab=packages${provider.packageId ? `&package=${provider.packageId}` : ''}`);
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
            // Remove the grid and use full width
            <div className="space-y-4">
              {cart.map((provider) => (
                <div
                  key={provider.id}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                        <Package size={18} />
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
                          {(() => {
                            if (provider.pricing && typeof provider.pricing.minPrice === 'number') {
                              return `${Math.floor((provider.pricing.minPrice + provider.pricing.maxPrice) / 2).toLocaleString()} ${provider.pricing.currency || "LKR"}`;
                            } else if (provider.price || provider.packagePrice) {
                              return `${(provider.price || provider.packagePrice || 0).toLocaleString()} ${provider.currency || "LKR"}`;
                            } else {
                              return "Price unavailable";
                            }
                          })()}
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
                        onClick={(e) => handleRemoveFromCart(e, provider.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              id: selectedProvider.id,
              name: selectedProvider.packageName,
              price: selectedProvider.price || selectedProvider.packagePrice,
              currency: selectedProvider.currency || "LKR",
              eventType: selectedProvider.eventType || "Event",
              capacity: selectedProvider.capacity || { min: 10, max: 1000 },
              description: selectedProvider.description || ""
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
