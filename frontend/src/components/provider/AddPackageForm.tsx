import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServiceProviderPackage, ALL_EVENT_TYPES } from "@/types";
import { AlertCircle, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface AddPackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPackage: (packageData: ServiceProviderPackage) => void;
  initialData?: Partial<ServiceProviderPackage>;
  isEditing?: boolean;
}

const formSchema = z.object({
  name: z.string().min(3, "Package name must be at least 3 characters"),
  price: z.coerce.number().min(1000, "Price must be at least 1000 LKR"),
  description: z.string().min(20, "Please provide a more detailed description (min 20 characters)"),
  crowdSizeMin: z.coerce.number().min(1, "Minimum crowd size must be at least 1"),
  crowdSizeMax: z.coerce.number().min(1, "Maximum crowd size must be at least 1"),
  eventTypes: z.array(z.string()).min(1, "Select at least one event type"),
  features: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Maximum number of images allowed per package
const MAX_IMAGES = 4;

export const AddPackageForm = ({
  isOpen,
  onClose,
  onAddPackage,
  initialData = {},
  isEditing = false,
}: AddPackageFormProps) => {
  const [images, setImages] = useState<string[]>(initialData.images || []);
  const [imageUploading, setImageUploading] = useState(false);
  const [features, setFeatures] = useState<string[]>(initialData.features || []);
  const [newFeature, setNewFeature] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      price: initialData.price || 0,
      description: initialData.description || "",
      crowdSizeMin: initialData.crowdSizeMin || 10,
      crowdSizeMax: initialData.crowdSizeMax || 100,
      eventTypes: initialData.eventTypes || [],
      features: initialData.features || [],
    },
  });

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  }
  
  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setImageUploading(true);
    const fileArray = Array.from(event.target.files);
    const newImages: string[] = [];
    
    // Check if adding these images would exceed the limit
    if (images.length + fileArray.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images per package.`);
      setImageUploading(false);
      event.target.value = "";
      return;
    }
    
    // In a real app, you would upload these files to a server
    // For now, we'll just create object URLs for the images
    fileArray.forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      newImages.push(imageUrl);
    });
    
    setImages([...images, ...newImages]);
    setImageUploading(false);
    
    // Reset the input
    event.target.value = "";
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const onSubmit = (data: FormValues) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image for your package");
      return;
    }

    const packageData: ServiceProviderPackage = {
      id: initialData.id || uuidv4(),
      name: data.name,
      description: data.description,
      price: data.price,
      currency: "LKR",
      crowdSizeMin: data.crowdSizeMin,
      crowdSizeMax: data.crowdSizeMax,
      eventTypes: data.eventTypes,
      images: images,
      features: features,
      status: "active", // Default status is always active
      bookings: initialData.bookings || 0
    };

    onAddPackage(packageData);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Package" : "Add New Package"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your existing service package with the details below."
              : "Create a new service package to offer to your customers."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Package Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Wedding Deluxe, Corporate Basic" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Package Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Price (LKR)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 25000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter price in Sri Lankan Rupees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Crowd Size Min */}
              <FormField
                control={form.control}
                name="crowdSizeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Crowd Size*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Crowd Size Max */}
              <FormField
                control={form.control}
                name="crowdSizeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Crowd Size*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what's included in this package..."
                      className="h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Types */}
            <FormField
              control={form.control}
              name="eventTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Suitable Event Types*</FormLabel>
                    <FormDescription>
                      Select all event types that this package is suitable for
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {ALL_EVENT_TYPES.map((type) => (
                      <FormField
                        key={String(type)}
                        control={form.control}
                        name="eventTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={String(type)}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(String(type))}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== String(type)
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {String(type)}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Package Features */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="features">Package Features</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="features"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Free setup, Premium decoration"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddFeature}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              {features.length > 0 && (
                <div className="rounded-md border p-4">
                  <p className="mb-2 text-sm font-medium">Added Features:</p>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span>{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(feature)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Package Images */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="images">Package Images*</Label>
                <div className="flex items-center gap-2">
                  <FormDescription className="mt-0">
                    Upload 1-4 images for your package
                  </FormDescription>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {images.length}/{MAX_IMAGES}
                  </Badge>
                </div>
                
                {images.length >= MAX_IMAGES ? (
                  <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Maximum of {MAX_IMAGES} images reached. Remove an image to add another.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50">
                    <Input
                      id="images"
                      type="file"
                      multiple={images.length < MAX_IMAGES - 1}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={images.length >= MAX_IMAGES}
                    />
                    <label htmlFor="images" className={`cursor-pointer ${images.length >= MAX_IMAGES ? 'opacity-50' : ''}`}>
                      <div className="flex flex-col items-center">
                        <Upload className="mb-2 h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Click to upload your package images
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          PNG, JPG up to 5MB each
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Preview Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-video overflow-hidden rounded-md border group"
                    >
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveImage(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-sm">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                  
                  {images.length < MAX_IMAGES && (
                    <div 
                      className="flex aspect-video items-center justify-center rounded-md border-2 border-dashed border-gray-200"
                    >
                      <label htmlFor="add-more" className="cursor-pointer w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <ImagePlus className="h-6 w-6 text-gray-400" />
                          <span className="mt-1 text-xs text-gray-500">Add more</span>
                        </div>
                        <Input
                          id="add-more"
                          type="file"
                          multiple={images.length < MAX_IMAGES - 1}
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={imageUploading}>
                {isEditing ? "Update Package" : "Add Package"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPackageForm;