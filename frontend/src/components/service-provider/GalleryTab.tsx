import { ServiceProvider } from "@/types";
import { ImageIcon, Video, Expand, X } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GalleryTabProps {
  provider: ServiceProvider;
}

export const GalleryTab = ({ provider }: GalleryTabProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(provider.gallery.images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openImageViewer = (image: string) => {
    setSelectedImage(image);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };
  
  // Function to handle the upload button click
  const handleUploadClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each selected file
    Array.from(files).forEach(file => {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return;
      }
      
      // Create a URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Add new image to gallery
          setGalleryImages(prev => [...prev, e.target!.result as string]);
          toast.success(`${file.name} uploaded successfully`);
        }
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input to allow selecting the same files again
    if (event.target) {
      event.target.value = '';
    }
  };
  
  // Function to remove an image from gallery
  const handleRemoveImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Image removed from gallery");
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gallery</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <ImageIcon className="mr-1 h-4 w-4 text-gray-500" />
            <span className="text-sm">{galleryImages.length} Photos</span>
          </div>
          {provider.gallery.videos && (
            <div className="flex items-center">
              <Video className="mr-1 h-4 w-4 text-gray-500" />
              <span className="text-sm">{provider.gallery.videos.length} Videos</span>
            </div>
          )}
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image, index) => (
          <div 
            key={index} 
            className="group aspect-square overflow-hidden rounded-lg relative cursor-pointer"
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => openImageViewer(image)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-30">
              <Expand className="text-white opacity-0 transform scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
            </div>
            
            {/* Remove image button */}
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(index);
              }}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {provider.gallery.videos?.map((video, index) => (
          <div key={`video-${index}`} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <div className="flex h-full items-center justify-center">
              <Video className="h-10 w-10 text-blue-500" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => closeImageViewer()}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery image"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
