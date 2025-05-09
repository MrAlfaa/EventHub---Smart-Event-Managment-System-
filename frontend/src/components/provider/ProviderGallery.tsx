import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProviderGallery = () => {
  // State to store uploaded images
  const [gallery, setGallery] = useState<string[]>(Array.from({ length: 12 }).map(() => ""));
  const [uploading, setUploading] = useState<boolean>(false);

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click on upload button
  const handleUploadClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Array to hold uploaded images
    const uploadedImages: string[] = [];
    let processedFiles = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        processedFiles++;
        checkUploadComplete();
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB size limit`);
        processedFiles++;
        checkUploadComplete();
        return;
      }

      // Create a URL for the file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          uploadedImages.push(e.target.result as string);
        }
        processedFiles++;
        checkUploadComplete();
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${file.name}`);
        processedFiles++;
        checkUploadComplete();
      };
      reader.readAsDataURL(file);
    });

    function checkUploadComplete() {
      if (processedFiles === totalFiles) {
        if (uploadedImages.length > 0) {
          // Update gallery with new images
          setGallery(prev => {
            // Find first empty slots or add to the end
            const newGallery = [...prev];
            let emptySlotCount = 0;
            
            for (let i = 0; i < newGallery.length; i++) {
              if (!newGallery[i] && emptySlotCount < uploadedImages.length) {
                newGallery[i] = uploadedImages[emptySlotCount];
                emptySlotCount++;
              }
            }
            
            // If we didn't find enough empty slots, add remaining images to the end
            if (emptySlotCount < uploadedImages.length) {
              newGallery.push(...uploadedImages.slice(emptySlotCount));
            }
            
            return newGallery;
          });
          
          toast.success(`Successfully uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}`);
        }
        setUploading(false);
        
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      }
    }
  };

  // Handle image deletion
  const handleDeleteImage = (index: number) => {
    setGallery(prev => {
      const newGallery = [...prev];
      newGallery[index] = "";
      return newGallery;
    });
    toast.success("Image removed from gallery");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <Button 
          className="flex items-center gap-2" 
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload Images
            </>
          )}
        </Button>
        
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

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                {img ? (
                  <img 
                    src={img} 
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Empty Slot
                  </div>
                )}
                {img && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(i)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderGallery;
