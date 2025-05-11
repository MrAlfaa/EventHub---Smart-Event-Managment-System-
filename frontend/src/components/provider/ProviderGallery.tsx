import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import providerService from "@/services/providerService";

const ProviderGallery = () => {
  // State to store uploaded images
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch gallery images on component mount
  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const images = await providerService.getGalleryImages();
      setGallery(images);
    } catch (error) {
      console.error("Failed to fetch gallery images:", error);
      setError("Failed to load gallery images. Please try again later.");
      toast.error("Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  // Handle click on upload button
  const handleUploadClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Filter valid files (images under 5MB)
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB size limit`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
      return;
    }
    
    try {
      // Upload files to server
      const uploadedImageUrls = await providerService.uploadGalleryImages(validFiles);
      
      // Update gallery with new images
      setGallery(prev => [...prev, ...uploadedImageUrls]);
      
      toast.success(`Successfully uploaded ${uploadedImageUrls.length} image${uploadedImageUrls.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      // Optimistic UI update
      setGallery(prev => prev.filter((_, i) => i !== index));
      
      // Actually delete on server
      await providerService.deleteGalleryImage(imageUrl);
      toast.success("Image removed from gallery");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to remove image. Please try again.");
      
      // Revert optimistic update on error
      fetchGalleryImages();
    }
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
          title="gallery"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 size={30} className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-60 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchGalleryImages}>Retry</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.length > 0 ? (
                gallery.map((img, i) => (
                  <div key={i} className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Gallery image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteImage(img, i)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center justify-center h-40">
                  <ImageIcon size={40} className="mb-2 opacity-20" />
                  <p>No images in your gallery yet</p>
                  <p className="text-sm mt-1">Upload some to showcase your work!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ProviderGallery;