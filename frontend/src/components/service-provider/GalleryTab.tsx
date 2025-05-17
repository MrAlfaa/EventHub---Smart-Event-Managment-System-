import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryTabProps {
  images: string[];
}

export const GalleryTab = ({ images }: GalleryTabProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setSelectedImage(images[currentIndex === 0 ? images.length - 1 : currentIndex - 1])
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setSelectedImage(images[currentIndex === images.length - 1 ? 0 : currentIndex + 1])
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 sm:h-60 border border-dashed border-gray-200 rounded-md bg-gray-50">
            <p className="text-gray-500 text-center">No gallery images available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div 
                    className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(image, index)}
                  >
                    <img 
                      src={image} 
                      alt={`Gallery image ${index + 1}`} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 bg-transparent border-none">
                  <div className="relative flex items-center justify-center">
                    <button 
                      onClick={goToPrevious} 
                      className="absolute left-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      aria-label="Previous image"
                      title="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <img 
                      src={images[currentIndex]} 
                      alt={`Gallery image ${currentIndex + 1}`} 
                      className="max-h-[80vh] max-w-full rounded-lg"
                    />
                    <button 
                      onClick={goToNext} 
                      className="absolute right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      aria-label="Next image"
                      title="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={closeLightbox} 
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      aria-label="Close lightbox"
                      title="Close lightbox"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )};
