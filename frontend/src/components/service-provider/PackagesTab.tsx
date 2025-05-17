import { useState, useEffect } from "react";
import { ServiceProvider, Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart, Calendar, ArrowUpDown, Users, DollarSign } from "lucide-react";
import providerService from "@/services/providerService";
import { PackageQuickView } from "./PackageQuickView";
import { toast } from "sonner";
import { useApp } from "@/providers/AppProvider";

interface PackagesTabProps {
  provider: ServiceProvider;
}

export const PackagesTab = ({ provider }: PackagesTabProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useApp();
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchPackages = async () => {
      if (!provider.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const packagesData = await providerService.getProviderPackages(provider.id);
        setPackages(packagesData);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, [provider.id]);

  const handleAddToCart = (pkg: Package) => {
    // Add implementation later
    toast.success(`${pkg.name} added to cart`);
  };

  const handleBookNow = (pkg: Package) => {
    // Add implementation later
    toast.success(`Proceeding to book ${pkg.name}`);
  };

  const openQuickView = (pkg: Package) => {
    setSelectedPackage(pkg);
    setQuickViewOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Sort packages based on current sort settings
  const sortedPackages = [...packages].sort((a, b) => {
    if (!sortBy) return 0;
    
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'eventType':
        comparison = a.eventType.localeCompare(b.eventType);
        break;
      case 'capacity':
        comparison = a.capacity.max - b.capacity.max;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Service Packages</h3>
          <div className="py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading packages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Service Packages</h3>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Service Packages</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Sort by:</div>
              <div className="flex space-x-2">
                <Button 
                  variant={sortBy === 'name' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => handleSort('name')}
                  className="h-8"
                >
                  Name
                  {sortBy === 'name' && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
                <Button 
                  variant={sortBy === 'price' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => handleSort('price')}
                  className="h-8"
                >
                  Price
                  {sortBy === 'price' && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {packages && packages.length > 0 ? (
            <div className="space-y-6">
              {sortedPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  {/* Package content */}
                  <div className="grid md:grid-cols-3 gap-4 p-4">
                    {/* Package image and name */}
                    <div className="flex items-center space-x-4 col-span-1">
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                        <img 
                          src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : provider.profileImage || '/placeholder-package.jpg'} 
                          alt={pkg.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{pkg.name}</h4>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {pkg.eventType}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Package details */}
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                      {/* Description */}
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-gray-600 text-sm line-clamp-3">{pkg.description}</p>
                      </div>
                      
                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 col-span-2 md:col-span-1">
                        <div className="bg-gray-50 p-3 rounded-md flex items-center">
                          <Users className="text-blue-500 h-5 w-5 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Capacity</div>
                            <div className="font-medium">{pkg.capacity.min} - {pkg.capacity.max}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md flex items-center">
                          <DollarSign className="text-green-500 h-5 w-5 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Price</div>
                            <div className="font-medium text-green-600">
                              {formatPrice(pkg.price, pkg.currency)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - positioned at bottom */}
                  <div className="bg-gray-50 p-3 border-t flex justify-between items-center">
                    <div>
                      <Button variant="outline" size="sm" onClick={() => openQuickView(pkg)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="secondary" size="sm" onClick={() => handleAddToCart(pkg)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button size="sm" onClick={() => handleBookNow(pkg)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No packages available from this service provider</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPackage && (
        <PackageQuickView
          package={selectedPackage}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          onAddToCart={handleAddToCart}
          onBookNow={handleBookNow}
        />
      )}
    </>
  );
};