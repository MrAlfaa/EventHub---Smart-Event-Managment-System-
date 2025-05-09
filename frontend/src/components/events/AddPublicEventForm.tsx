import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PublicEvent } from "@/types";

interface AddPublicEventFormProps {
  onSubmit: (event: Omit<PublicEvent, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function AddPublicEventForm({ onSubmit, onCancel }: AddPublicEventFormProps) {
  const [date, setDate] = useState<Date>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerImage: "",
    location: {
      address: "",
      googleMapLink: ""
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          bannerImage: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      ...formData,
      eventDate: date.toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input 
          id="title" 
          placeholder="Enter event title" 
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Enter event description" 
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner">Banner Image</Label>
        <Input 
          id="banner" 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          required 
        />
        {imagePreview && (
          <div className="relative aspect-video mt-2">
            <img
              src={imagePreview}
              alt="Banner preview"
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          placeholder="Event location address" 
          value={formData.location.address}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            location: { ...prev.location, address: e.target.value }
          }))}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="googleMapLink">Google Maps Link</Label>
        <Input 
          id="googleMapLink" 
          placeholder="https://maps.google.com/?q=..." 
          type="url"
          value={formData.location.googleMapLink}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            location: { ...prev.location, googleMapLink: e.target.value }
          }))}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Event Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Event</Button>
      </div>
    </form>
  );
}