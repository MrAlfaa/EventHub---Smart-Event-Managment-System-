import React from 'react';
import { Package } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, X, Users, CheckCircle, DollarSign } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PackageQuickViewProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (pkg: Package) => void;
  onBookNow: (pkg: Package) => void;
}

export const PackageQuickView: React.FC<PackageQuickViewProps> = (props) => {
  const navigate = useNavigate();
  const pkg = props.package;
  
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };
  
  const handleAddToCart = () => {
    props.onAddToCart(pkg);
    // Keep the modal open
  };
  
  const handleBookNow = () => {
    props.onBookNow(pkg);
    props.onClose();
  };
  
  const handleViewCart = () => {
    props.onClose();
    navigate('/checkout');
  };
  
  if (!pkg) return null;
  
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{pkg.name}</DialogTitle>
          <Button 
            onClick={props.onClose} 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left column - images */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              {pkg.images && pkg.images.length > 0 ? (
                <img 
                  src={pkg.images[0]} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {pkg.images && pkg.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {pkg.images.slice(0, 4).map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${pkg.name} - ${idx + 1}`} 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right column - details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                {pkg.eventType}
              </Badge>
              
              <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
              
              <div className="flex items-center mb-4">
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatPrice(pkg.price, pkg.currency || 'LKR')}
                </div>
              </div>
              
              <p className="text-gray-600">{pkg.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-md flex items-center">
                <Users className="text-blue-500 h-5 w-5 mr-3" />
                <div>
                  <div className="text-xs text-gray-500">Capacity</div>
                  <div className="font-medium">{pkg.capacity.min} - {pkg.capacity.max}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md flex items-center">
                <Calendar className="text-purple-500 h-5 w-5 mr-3" />
                <div>
                  <div className="text-xs text-gray-500">Event Type</div>
                  <div className="font-medium">{pkg.eventType}</div>
                </div>
              </div>
            </div>
            
            {pkg.features && pkg.features.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Package Features</h3>
                <ul className="space-y-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-4 space-y-3">
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleBookNow}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-blue-600"
                onClick={handleViewCart}
              >
                View Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PackageQuickView;
