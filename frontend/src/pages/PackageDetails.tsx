
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useApp } from "@/providers/AppProvider";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { serviceProviders } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);

  // Find a package for the demo (in real app, you'd fetch this from API)
  const provider = serviceProviders.find(provider => provider.id === id);
  const package1 = provider?.packages?.[0];
  
  if (!package1) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-full hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
          <Card className="p-8 text-center">
            <h1 className="text-xl font-semibold">Package not found</h1>
            <p className="mt-2 text-muted-foreground">The requested package could not be found.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (provider) {
      addToCart(provider);
      toast.success("Added to cart successfully");
    }
  };

  // Use provider gallery images instead of mock images
  const images = provider?.gallery?.images || [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
  ];

  // Mock location data for this package (would come from the API in a real app)
  const mockLocationData = provider?.location?.city || "Colombo, Sri Lanka";

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">Package Details</h1>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Images */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={images[selectedImage]} 
                alt={`${package1.name} - Image ${selectedImage + 1}`}
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`cursor-pointer rounded-md overflow-hidden ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${package1.name} - Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column - Package Info */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-blue-900">{package1.name}</h2>
                <div className="mt-2">
                  <Badge>Premium Package</Badge>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Recommended for: {package1.eventType}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>Location: {mockLocationData}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Capacity: {package1.capacity.min} - {package1.capacity.max} people</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span className="font-semibold text-xl">
                      LKR {package1.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold mb-2">Included Services:</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {package1.services.map((service, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                        {service.serviceType}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Package Description</h2>
          <div className="prose max-w-none">
            <p>{package1.description}</p>
            <p className="mt-4">
              This comprehensive package is perfect for those looking to create a memorable {package1.eventType} experience.
              Our experienced team will take care of all the details, allowing you to enjoy your special day to the fullest.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Terms and Conditions</h3>
            <ul className="list-disc pl-5">
              <li>Booking requires a 25% advance payment</li>
              <li>Cancellation policy: Full refund if canceled 30 days before the event</li>
              <li>50% refund if canceled between 15-30 days before the event</li>
              <li>No refund for cancellations made less than 15 days before the event</li>
              <li>Additional services can be added at an extra cost</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PackageDetails;
