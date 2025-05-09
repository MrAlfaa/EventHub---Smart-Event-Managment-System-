import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serviceProviders } from "@/data/mockData";
import { ServiceProvider, Review } from "@/types";
import { useApp } from "@/providers/AppProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, Settings, BarChart } from "lucide-react";

// Imported components
import { ProfileHeader } from "@/components/service-provider/ProfileHeader";
import { AboutTab } from "@/components/service-provider/AboutTab";
import { GalleryTab } from "@/components/service-provider/GalleryTab";
import { ReviewsTab } from "@/components/service-provider/ReviewsTab";
import { AvailabilityTab } from "@/components/service-provider/AvailabilityTab";
import { ContactInfo } from "@/components/service-provider/ContactInfo";
import { PackagesTab } from "@/components/service-provider/PackagesTab";

const ServiceProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, user } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Mock reviews
  const mockReviews: Review[] = [
    {
      id: "1",
      userId: "101",
      serviceProviderId: id || "",
      userName: "John Smith",
      rating: 5,
      comment: "Fantastic service! Everything was perfect and exactly as promised. Highly recommend!",
      date: "2025-03-15",
    },
    {
      id: "2",
      userId: "102",
      serviceProviderId: id || "",
      userName: "Sarah Johnson",
      rating: 4,
      comment: "Great experience overall. Very professional team and good value for money.",
      date: "2025-02-28",
    },
    {
      id: "3",
      userId: "103",
      serviceProviderId: id || "",
      userName: "Michael Brown",
      rating: 5,
      comment: "Exceeded our expectations! The team went above and beyond to make our event special.",
      date: "2025-02-10",
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    const foundProvider = serviceProviders.find(p => p.id === id);
    
    if (foundProvider) {
      setProvider(foundProvider);
      
      // Check if this is the service provider viewing their own profile
      if (user?.role === 'service_provider' && user?.id === id) {
        setIsOwnProfile(true);
      }
    }
    
    setLoading(false);
  }, [id, user]);

  const handleAddToCart = () => {
    if (provider) {
      addToCart(provider);
      toast.success(`${provider.name} added to cart`);
    }
  };

  const handleBookNow = () => {
    if (provider) {
      addToCart(provider);
      // In a real app, you'd navigate to checkout with the selected date
      toast.success(`Proceeding to booking for ${provider.name}`);
    }
  };

  const handleChat = () => {
    toast.info("Chat functionality will be available soon!");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4">Loading service provider...</p>
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
            <Tabs defaultValue="about" className="w-full">
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
                <GalleryTab provider={provider} />
              </TabsContent>
              
              <TabsContent value="packages" className="mt-4 sm:mt-6">
                <PackagesTab provider={provider} />
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <ReviewsTab provider={provider} reviews={mockReviews} />
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
