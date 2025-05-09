import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceProvider } from "@/types";
import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

interface ProfileHeaderProps {
  provider: ServiceProvider;
  addToCart: (provider: ServiceProvider) => void;
  handleChat: () => void;
}

export const ProfileHeader = ({ provider, addToCart, handleChat }: ProfileHeaderProps) => {
  const handleAddToCart = () => {
    addToCart(provider);
    toast.success(`${provider.name} added to cart`);
  };

  return (
    <>
      <div className="bg-gray-50">
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 w-full overflow-hidden bg-blue-900">
          {provider.coverImage ? (
            <img
              src={provider.coverImage}
              alt={provider.name}
              className="h-full w-full object-cover opacity-70"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-900 to-blue-700"></div>
          )}
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 md:-mt-24 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:items-end">
          <div className="z-10 h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            <img
              src={provider.profileImage}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="mt-4 flex flex-1 flex-col items-center sm:items-start sm:ml-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-gray-900">{provider.name}</h1>
            <div className="mt-2 flex items-center flex-wrap justify-center sm:justify-start">
              <div className="flex items-center">
                <Star className="mr-1 h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="font-medium">{provider.rating}</span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">{provider.reviewCount} reviews</span>
              {provider.isNewcomer && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <Badge className="bg-blue-600">New Provider</Badge>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row w-full sm:w-auto justify-center sm:justify-end gap-2 sm:mt-0 sm:ml-auto">
            {/* <Button className="w-full sm:w-auto" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button> */}
            <Button className="w-full sm:w-auto" variant="outline" onClick={handleChat}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
