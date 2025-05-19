import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceProvider, Review, CartItem } from "@/types/index"; 
import { useApp } from "@/providers/AppProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import providerService from "@/services/providerService";
import reviewService from "@/services/reviewService"; 
import chatService from "@/services/chatService";

// Import all the components we created
import { 
  AboutTab, 
  AvailabilityTab, 
  ContactInfo, 
  GalleryTab, 
  PackagesTab, 
  ProfileHeader, 
  ReviewsTab 
} from "@/components/service-provider";

const ServiceProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, user } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [highlightedPackageId, setHighlightedPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("about");
  const tabsRef = useRef<any>(null);

  // Get tab and packageId from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const packageId = searchParams.get('packageId');
    
    if (tab && ['about', 'packages', 'availability', 'gallery', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
    
    if (packageId) {
      setHighlightedPackageId(packageId);
      // If packageId is present but tab is not 'packages', set tab to 'packages'
      if (tab !== 'packages') {
        setActiveTab('packages');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch provider details
        const providerData = await providerService.getProviderById(id);
        setProvider(providerData);
        
        // Check if this is the service provider viewing their own profile
        if (user?.role === 'service_provider' && user?.id === id) {
          setIsOwnProfile(true);
        }
        
        // Fetch provider gallery
        try {
          const galleryData = await providerService.getProviderGallery(id);
          setGalleryImages(galleryData);
        } catch (galleryError) {
          console.error("Error fetching gallery:", galleryError);
          // Don't set main error - just log gallery error
        }

        // Fetch provider reviews
        try {
          const reviewsData = await reviewService.getProviderReviews(id);
          setReviews(reviewsData);
        } catch (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
          // Don't set main error - just log reviews error
        }
        
      } catch (err) {
        console.error("Error fetching provider details:", err);
        setError("Failed to load service provider details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderData();
  }, [id, user]);

  // Add this new function to handle when a new review is added
  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
  };
  
  const handleAddToCart = () => {
    if (provider) {
      // Create a CartItem with the correct structure
      const cartItem = {
        id: provider.id, // Use provider.id as the cart item ID
        providerId: provider.id,
        packageId: "", // Empty string as it's not a package
        name: provider.name || "Service Provider",
        packageName: "Custom Service", // Default name for non-package service
        price: provider.pricing?.minPrice || 0, // Use the pricing property from ServiceProvider
        currency: provider.pricing?.currency || "LKR",
        description: provider.description || "",
        profileImage: provider.profileImage,
        eventType: provider.eventTypes?.[0] || "Service",
        quantity: 1
      };
      
      addToCart(cartItem);
      toast.success(`${provider.name} added to cart`);
    }
  };

  // Function to switch tabs programmatically
  const switchToTab = (tabValue: string) => {
    setActiveTab(tabValue);
    // Update URL to reflect tab change without full page reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabValue);
    navigate(`/service-providers/${id}?${newSearchParams.toString()}`, { replace: true });
    
    // If using a ref to access the Tabs component
    if (tabsRef.current) {
      // Some tab components have a setValue method
      if (tabsRef.current.setValue) {
        tabsRef.current.setValue(tabValue);
      }
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  // Updated to switch to packages tab instead of going to checkout
  const handleBookNow = () => {
    if (selectedDate) {
      // Store the selected date and switch to packages tab
      toast.success("Date selected! Choose a package below.");
      switchToTab("packages");
    } else {
      toast.error("Please select a date first");
    }
  };

  const handleChat = async () => {
    if (!user) {
      toast.error("Please login to chat with this service provider");
      return;
    }
    
    if (provider) {
      try {
        // Send an initial message to create the conversation if one doesn't exist
        await chatService.sendMessage(
          provider.id, 
          `Hello, I'm interested in your services.`
        );
        
        // Navigate to the chat tab in profile page
        navigate("/profile?tab=messages");
        toast.success(`Started chat with ${provider.businessName || provider.name}`);
      } catch (error) {
        console.error("Error starting chat:", error);
        toast.error("Failed to start chat. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4">Loading service provider...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Error loading service provider</h2>
          <p className="mt-2 text-gray-500">{error}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  if (!provider) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-700">Service provider not found</h2>
          <p className="mt-2 text-gray-500">The service provider you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProfileHeader 
        provider={provider} 
        addToCart={handleAddToCart}
        handleChat={handleChat}
      />

      <div className="container mx-auto px-4 sm:px-6">        
        <div className="my-4 sm:my-8 grid gap-4 sm:gap-8 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs 
              defaultValue="about" 
              className="w-full" 
              value={activeTab} 
              onValueChange={setActiveTab}
              ref={tabsRef}
            >
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start min-w-max">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="packages">Packages</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="about" className="mt-4 sm:mt-6">
                <AboutTab provider={provider} />
              </TabsContent>
              
              <TabsContent value="gallery" className="mt-4 sm:mt-6">
                <GalleryTab images={galleryImages} />
              </TabsContent>
              
              <TabsContent value="packages" className="mt-4 sm:mt-6">
                <PackagesTab 
                  provider={provider} 
                  selectedDate={selectedDate}
                  highlightedPackageId={highlightedPackageId}
                />
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <ReviewsTab 
                  provider={provider} 
                  reviews={reviews} 
                  onReviewAdded={handleReviewAdded}
                />
              </TabsContent>
              
              <TabsContent value="availability" className="mt-6">
                <AvailabilityTab 
                  provider={provider}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onBookNow={handleBookNow}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <ContactInfo provider={provider} onChat={handleChat} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceProviderProfile;
export default ServiceProviderProfile;