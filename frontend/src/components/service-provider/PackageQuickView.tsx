import React, { useRef, useEffect, useState } from 'react';
import { Package } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Tag, Check, Users, Calendar, ShoppingCart } from "lucide-react";
import SystemBookingForm from '@/components/booking/SystemBookingForm';

interface PackageQuickViewProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (pkg: Package) => void;
  onBookNow: (pkg: Package) => void;
}

export const PackageQuickView: React.FC<PackageQuickViewProps> = ({
  package: pkg,
  isOpen,
  onClose,
  onAddToCart,
  onBookNow
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  
  useEffect(() => {
    // Close popup when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Close popup when pressing escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when popup is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset image index when opening a new package
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, pkg.id]);

  if (!isOpen) return null;
  
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const nextImage = () => {
    if (pkg.images && pkg.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % pkg.images.length);
    }
  };

  const prevImage = () => {
    if (pkg.images && pkg.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + pkg.images.length) % pkg.images.length);
    }
  };

  const hasImages = pkg.images && pkg.images.length > 0;

  const handleBookNow = () => {
    // Open booking form instead of calling the passed onBookNow function
    setBookingFormOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
        <div 
          ref={popupRef}
          className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Image Carousel */}
          <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
            {hasImages ? (
              <img 
                src={pkg.images[currentImageIndex]} 
                alt={`${pkg.name} - image ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover"
              />
            ) : pkg.thumbnailImage ? (
              <img 
                src={pkg.thumbnailImage} 
                alt={pkg.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{pkg.name}</span>
              </div>
            )}
            
            {/* Carousel Navigation */}
            {hasImages && pkg.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {pkg.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Package Header - Name and Price */}
          <div className="px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
                <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                  Suitable for: {pkg.eventType}
                </Badge>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-sm text-gray-500">Package Price</p>
                <p className="text-2xl font-bold text-blue-700">{formatPrice(pkg.price, pkg.currency)}</p>
              </div>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-5">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{pkg.description}</p>
            </div>
            
            {/* Crowd Size and Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-md mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Crowd Size</p>
                    <p className="font-medium">{pkg.capacity.min} - {pkg.capacity.max} People</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-md mr-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Suitable Events</p>
                    <p className="font-medium">{pkg.eventType}</p>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with buttons */}
          <div className="border-t p-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="secondary" onClick={() => onAddToCart(pkg)}>
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Add to Cart
            </Button>
            <Button onClick={handleBookNow}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* Booking Form */}
      {bookingFormOpen && (
        <SystemBookingForm 
          isOpen={bookingFormOpen}
          onClose={() => {
            setBookingFormOpen(false);
            onClose();
          }}
          selectedPackage={pkg}
        />
      )}
    </>
  );
};

export default PackageQuickView;