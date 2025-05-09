import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Special date interface
interface SpecialDate {
  date: Date;
  type: 'unavailable' | 'booked';
  note?: string;
}

// Schema for special date form
const specialDateFormSchema = z.object({
  type: z.enum(['unavailable', 'booked']),
  note: z.string().optional(),
});

type SpecialDateFormValues = z.infer<typeof specialDateFormSchema>;

export const ManageAvailabilityTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAddSpecialDateDialog, setShowAddSpecialDateDialog] = useState(false);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      type: 'unavailable',
      note: 'Personal leave'
    },
    {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      type: 'booked',
      note: 'Event already booked'
    }
  ]);

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const form = useForm<SpecialDateFormValues>({
    resolver: zodResolver(specialDateFormSchema),
    defaultValues: {
      type: 'booked',
      note: '',
    },
  });

  // Function to get date modifier classes for highlighting
  const getDateModifiers = () => {
    const modifiers: Record<string, Date[]> = {
      unavailable: [],
      booked: []
    };
    
    specialDates.forEach(specialDate => {
      modifiers[specialDate.type].push(specialDate.date);
    });
    
    return modifiers;
  };

  // Add a special date
  const handleAddSpecialDate = (data: SpecialDateFormValues) => {
    if (!selectedDate) return;
    
    const newSpecialDate: SpecialDate = {
      date: selectedDate,
      type: data.type,
      note: data.note || undefined
    };
    
    // Check if there's already a special date for the selected date
    const existingDateIndex = specialDates.findIndex(
      date => date.date.toDateString() === selectedDate.toDateString()
    );
    
    if (existingDateIndex !== -1) {
      // Update existing date
      const updatedDates = [...specialDates];
      updatedDates[existingDateIndex] = newSpecialDate;
      setSpecialDates(updatedDates);
      toast.success('Date status updated');
    } else {
      // Add new date
      setSpecialDates([...specialDates, newSpecialDate]);
      toast.success('Date status added');
    }
    
    setShowAddSpecialDateDialog(false);
    form.reset();
  };

  // Remove a special date
  const handleRemoveSpecialDate = (dateToRemove: Date) => {
    setSpecialDates(specialDates.filter(
      date => date.date.toDateString() !== dateToRemove.toDateString()
    ));
    toast.success('Date returned to available status');
  };

  // Initialize form when selecting a date
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Check if this date already has special settings
    const existingDate = specialDates.find(
      specialDate => specialDate.date.toDateString() === date.toDateString()
    );
    
    if (existingDate) {
      // Pre-populate form with existing data
      form.reset({
        type: existingDate.type,
        note: existingDate.note || '',
      });
    } else {
      // Reset form to defaults
      form.reset({
        type: 'booked',
        note: '',
      });
    }
    
    setShowAddSpecialDateDialog(true);
  };

  // Reset availability to defaults
  const resetAvailability = () => {
    if (window.confirm('Are you sure you want to reset all availability settings? This cannot be undone.')) {
      setSpecialDates([]);
      toast.success('All dates reset to available');
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'unavailable': return 'Unavailable';
      case 'booked': return 'Booked';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'unavailable': return 'bg-red-50 border-red-200 text-red-700';
      case 'booked': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manage Availability</CardTitle>
                  <CardDescription>Mark dates as unavailable or booked</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="p-0"
                  modifiers={getDateModifiers()}
                  modifiersStyles={{
                    unavailable: { 
                      backgroundColor: "#fee2e2", 
                      color: "#ef4444",
                      fontWeight: "bold" 
                    },
                    booked: { 
                      backgroundColor: "#dbeafe", 
                      color: "#2563eb",
                      fontWeight: "bold" 
                    }
                  }}
                  footer={
                    <div className="mt-4 pt-4 border-t flex justify-between">
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-white border"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-red-200"></div>
                          <span>Unavailable</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                          <span>Booked</span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>All dates are available by default (white background)</li>
                  <li>Click on any date to mark it as unavailable or booked</li>
                  <li>Add notes to remember why a date is marked</li>
                  <li>Dates marked as "Unavailable" will not be bookable by clients</li>
                  <li>Dates marked as "Booked" are already reserved for events</li>
                  <li>To make a date available again, remove it from the Special Dates list</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Special Dates</CardTitle>
              <CardDescription>Unavailable and booked dates</CardDescription>
            </CardHeader>
            <CardContent>
              {specialDates.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {specialDates.map((specialDate, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-md border ${getTypeColor(specialDate.type)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {specialDate.date.toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs font-medium">
                            {getTypeLabel(specialDate.type)}
                          </p>
                          {specialDate.note && (
                            <p className="text-xs mt-1 italic">{specialDate.note}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveSpecialDate(specialDate.date)}
                          title="Make date available again"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="mx-auto h-8 w-8 opacity-50" />
                  <p className="mt-2">No special dates set</p>
                  <p className="text-xs mt-1">All dates are currently available</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={resetAvailability}
                >
                  Reset All to Available
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for adding/editing special dates */}
      <Dialog open={showAddSpecialDateDialog} onOpenChange={setShowAddSpecialDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && `${selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`}
            </DialogTitle>
            <DialogDescription>
              Set status for this date
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddSpecialDate)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Personal leave, Event booked, etc."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddSpecialDateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};