import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import AddPackageForm from "./AddPackageForm";
import { ServiceProviderPackage } from "@/types";
import { Badge } from "@/components/ui/badge";

// Updated Package interface
interface Package extends ServiceProviderPackage {
  duration?: string; // Optional for backward compatibility
}

// Sample package data
const samplePackages: Package[] = [
  {
    id: "1",
    name: "Wedding Package 1",
    description: "This comprehensive wedding package includes everything needed for your special day.",
    price: 150000,
    currency: "LKR",
    features: ["Photography", "Catering", "Venue Decoration", "Music"],
    duration: "8 hours", // Note: This is not in the ServiceProviderPackage interface, but included for backward compatibility
    crowdSizeMax: 100,
    crowdSizeMin: 50,
    eventTypes: ["Wedding", "Engagement"],
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
    ],
    status: "active",
    bookings: 5
  },
  {
    id: "2",
    name: "Wedding Package 2",
    description: "Premium wedding package with exclusive features and services for a memorable experience.",
    price: 300000,
    currency: "LKR",
    features: ["Photography & Videography", "Premium Catering", "Luxury Venue Setup", "Live Band", "Transportation"],
    duration: "12 hours",
    crowdSizeMax: 200,
    crowdSizeMin: 100,
    eventTypes: ["Wedding", "Anniversary"],
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b3ce551?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
    ],
    status: "active",
    bookings: 3
  },
  {
    id: "3",
    name: "Wedding Package 3",
    description: "Deluxe package for the most extravagant wedding celebration with all premium features included.",
    price: 450000,
    currency: "LKR",
    features: ["Full Photography & Videography Team", "Gourmet Catering", "Custom Venue Design", "Live Orchestra", "Transportation", "Accommodation"],
    duration: "Full Day",
    crowdSizeMax: 300,
    crowdSizeMin: 150,
    eventTypes: ["Wedding", "Engagement", "Anniversary"],
    images: [
      "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1498&q=80",
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
    ],
    status: "active",
    bookings: 1
  }
];

// Image Carousel Component
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) {
    return (
      <div className="relative flex h-40 items-center justify-center bg-gray-100 rounded-t-md">
        <ImageIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative h-48 rounded-t-md overflow-hidden">
      <img 
        src={images[currentImage]} 
        alt="Package" 
        className="h-full w-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <Button 
            size="icon"
            variant="ghost" 
            className="absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-sm"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon"
            variant="ghost" 
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/80 text-gray-800 hover:bg-white shadow-sm"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <span
                key={index}
                className={`block h-1.5 w-1.5 rounded-full ${
                  currentImage === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Large Image Gallery Component for the popup
const ImageGallery = ({ images }: { images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images.length) {
    return (
      <div className="relative flex h-60 items-center justify-center bg-gray-100 rounded-md">
        <ImageIcon className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-60 rounded-md overflow-hidden bg-gray-100">
        <img 
          src={images[selectedImage]} 
          alt="Package" 
          className="h-full w-full object-contain"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                selectedImage === index ? "border-blue-600" : "border-transparent"
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProviderPackages = () => {
  const [packages, setPackages] = useState<Package[]>(samplePackages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Handle view package details
  const handleViewPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowViewDialog(true);
  };

  // Handle edit package
  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEditDialog(true);
  };

  // Handle delete package
  const handleDeletePackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteDialog(true);
  };
  
  // Add new package
  const handleAddPackage = (packageData: ServiceProviderPackage) => {    
    setPackages(prev => [...prev, packageData as Package]);
    setShowAddDialog(false);
  };
  
  // Update existing package
  const handleUpdatePackage = (packageData: ServiceProviderPackage) => {
    setPackages(prev => 
      prev.map(pkg => pkg.id === packageData.id ? 
        {...packageData, duration: pkg.duration} as Package : pkg)
    );
    setShowEditDialog(false);
  };

  // Confirm delete package
  const confirmDeletePackage = () => {
    if (selectedPackage) {
      setPackages(prev => prev.filter(pkg => pkg.id !== selectedPackage.id));
    }
    setShowDeleteDialog(false);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Packages</h1>
        <Button className="flex items-center gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus size={16} />
          Add Package
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.length > 0 ? (
          packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <ImageCarousel images={pkg.images} />
              
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold line-clamp-1">{pkg.name}</h3>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(pkg.price, pkg.currency)}
                  </span>
                </div>
                
                <p className="text-gray-600 line-clamp-2 text-sm h-10">
                  {pkg.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5">
                  {pkg.eventTypes.slice(0, 2).map((type, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50">
                      {type}
                    </Badge>
                  ))}
                  {pkg.eventTypes.length > 2 && (
                    <Badge variant="outline" className="bg-gray-50">
                      +{pkg.eventTypes.length - 2} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    {pkg.crowdSizeMin}-{pkg.crowdSizeMax} guests
                  </span>
                  <span className="text-xs text-gray-500">
                    {pkg.bookings} {pkg.bookings === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewPackage(pkg)}
                  >
                    <Eye size={16} className="mr-1" /> View
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleEditPackage(pkg)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePackage(pkg)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center h-[300px] md:h-[400px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center space-y-4 px-4 w-full max-w-sm mx-auto">
              <h3 className="text-lg font-medium text-gray-700">No packages available</h3>
              <p className="text-gray-500">Add your first package to showcase your services to customers</p>
              <div className="flex justify-center mt-6">
                <Button 
                  size="lg"
                  className="flex items-center gap-2 px-4 py-6 text-base w-full max-w-[220px] mx-auto"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus size={18} />
                  Add Your First Package
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Package Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 rounded-xl">
          <div className="sticky top-0 z-10 bg-white p-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Package Details</DialogTitle>
            </DialogHeader>
          </div>

          {selectedPackage && (
            <div className="space-y-6 p-6 pt-3">
              <ImageGallery images={selectedPackage.images} />
              
              <div className="space-y-6">
                <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">{selectedPackage.name}</h2>
                    <div className="text-xl font-semibold px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">
                      {formatCurrency(selectedPackage.price, selectedPackage.currency)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.eventTypes.map((type, i) => (
                      <Badge key={i} className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-800">{selectedPackage.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-700 mb-1">Crowd Size</h4>
                      <p className="text-gray-800 font-medium">{selectedPackage.crowdSizeMin} - {selectedPackage.crowdSizeMax} guests</p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-700 mb-1">Bookings</h4>
                      <p className="text-gray-800 font-medium">{selectedPackage.bookings} total bookings</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Features</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm border border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        <span className="text-gray-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="sticky bottom-0 border-t bg-white p-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowViewDialog(false)}
              className="px-6 font-medium hover:bg-blue-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Package Form component */}
      <AddPackageForm
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAddPackage={handleAddPackage}
      />
      
      {/* Edit Package Form component */}
      {selectedPackage && (
        <AddPackageForm
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onAddPackage={handleUpdatePackage}
          initialData={selectedPackage}
          isEditing={true}
        />
      )}

      {/* Delete Package Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="py-3">
              <h3 className="font-semibold">{selectedPackage.name}</h3>
              <p className="text-gray-600 mt-1">{formatCurrency(selectedPackage.price, selectedPackage.currency)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePackage}
            >
              Delete Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderPackages;
