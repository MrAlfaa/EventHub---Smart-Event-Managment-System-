import { Package } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Info, ShoppingCart, Users } from "lucide-react";

interface PackageQuickViewProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (pkg: Package) => void;
  onBookNow: (pkg: Package) => void;
  selectedDate?: string | null;
}

export const PackageQuickView = ({
  package: pkg,
  isOpen,
  onClose,
  onAddToCart,
  onBookNow,
  selectedDate
}: PackageQuickViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{pkg.name}</DialogTitle>
          <DialogDescription>
            Package details and features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Package image */}
          <div className="md:col-span-1">
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
              <img
                src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : '/placeholder-package.jpg'}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {pkg.images && pkg.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={image}
                    alt={`${pkg.name} - image ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Package details */}
          <div className="md:col-span-2 space-y-6">
            {/* Event type and capacity */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                {pkg.eventType}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
                <Users className="h-3 w-3" />
                {pkg.capacity.min} - {pkg.capacity.max} people
              </Badge>
            </div>

            {/* Selected date indicator */}
            {selectedDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 font-medium">
                    Selected date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-blue-600">This package will be booked for this date</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-600">{pkg.description}</p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Package Price</div>
                  <div className="text-xl font-semibold text-green-700">
                    {pkg.price.toLocaleString()} {pkg.currency || 'LKR'}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center mt-6">
          <div className="order-2 sm:order-1">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button variant="outline" className="flex-1" onClick={() => onAddToCart(pkg)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button 
              className="flex-1"
              onClick={() => onBookNow(pkg)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {selectedDate ? "Book for Selected Date" : "Book Now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default PackageQuickView;
