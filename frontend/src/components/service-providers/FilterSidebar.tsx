import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EventFilter } from "@/types";
import { 
  Search, 
  X, 
  Users,
  DollarSign,
  MapPin,
  CalendarDays,
  Tag,
  Package,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Event types for filtering
const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Festival",
  "Conference",
  "Party",
  "Other",
];

// Service types for filtering
const SERVICE_TYPES = [
  "Venue",
  "Catering",
  "Photography",
  "Decoration",
  "Entertainment",
  "Planning",
  "Transportation",
  "Accommodation",
];

interface FilterSidebarProps {
  filter: EventFilter;
  onFilterChange: (filter: Partial<EventFilter>) => void;
  onClearFilter: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  activeTab?: string;
}

export function FilterSidebar({
  filter,
  onFilterChange,
  onClearFilter,
  onClose,
  isMobile = false,
  activeTab = "providers",
}: FilterSidebarProps) {
  // Local state for slider values
  const [budgetValue, setBudgetValue] = useState<[number, number]>([
    filter.budgetRange?.min || 0,
    filter.budgetRange?.max || 1000000,
  ]);
  
  const [crowdValue, setCrowdValue] = useState<[number, number]>([
    filter.crowdRange?.min || 0,
    filter.crowdRange?.max || 2000,
  ]);
  
  const [locationSearch, setLocationSearch] = useState<string>(filter.location || "");
  
  // Update local state when filter prop changes
  useEffect(() => {
    setBudgetValue([
      filter.budgetRange?.min || 0,
      filter.budgetRange?.max || 1000000,
    ]);
    setCrowdValue([
      filter.crowdRange?.min || 0,
      filter.crowdRange?.max || 2000,
    ]);
    setLocationSearch(filter.location || "");
  }, [filter]);
  
  // Update budget range filter
  const handleBudgetChange = (value: [number, number]) => {
    setBudgetValue(value);
    onFilterChange({
      budgetRange: { min: value[0], max: value[1] },
    });
  };
  
  // Update crowd size filter
  const handleCrowdChange = (value: [number, number]) => {
    setCrowdValue(value);
    onFilterChange({
      crowdRange: { min: value[0], max: value[1] },
    });
  };
  
  // Toggle event type filter
  const handleEventTypeChange = (type: string) => {
    if (filter.eventType === type) {
      onFilterChange({ eventType: undefined });
    } else {
      onFilterChange({ eventType: type });
    }
  };
  
  // Toggle service type filter
  const handleServiceTypeChange = (type: string) => {
    const currentServices = filter.services || [];
    const serviceExists = currentServices.includes(type);
    
    if (serviceExists) {
      onFilterChange({
        services: currentServices.filter((service) => service !== type),
      });
    } else {
      onFilterChange({
        services: [...currentServices, type],
      });
    }
    
    // If in package display mode, update the serviceType parameter for API
    if (filter.packageDisplayMode === 'grouped') {
      // Pass all selected services to the packageFilter
      const updatedServices = serviceExists
        ? currentServices.filter((service) => service !== type)
        : [...currentServices, type];
      
      if (updatedServices.length > 0) {
        onFilterChange({ packageFilter: updatedServices.join(',') });
      } else {
        onFilterChange({ packageFilter: null });
      }
    }
  };
  
  // Handle location search
  const handleLocationSearch = () => {
    onFilterChange({ location: locationSearch });
  };
  
  // Handle package display mode change
  const handlePackageDisplayModeChange = (mode: 'individual' | 'grouped') => {
    console.log(`Changing display mode to: ${mode}`);
    
    // When switching to grouped mode, make sure we have a reasonable budget range
    if (mode === 'grouped') {
      // If budget range is not yet set or is at max, provide a reasonable default
      const currentMax = filter.budgetRange?.max || 1000000;
      if (currentMax >= 1000000) {
        // Set a reasonable budget range for package combinations
        onFilterChange({ 
          packageDisplayMode: mode,
          budgetRange: { 
            min: filter.budgetRange?.min || 0,
            max: 400000 // A reasonable default upper limit for packages
          } 
        });
        return;
      }
    }
    
    // Otherwise just update the display mode
    onFilterChange({ packageDisplayMode: mode });
  };

  // Inside render method, add a message for combined packages option
  {activeTab === "packages" && (
    <AccordionItem value="package-mode">
      <AccordionTrigger className="text-sm py-2">
        <span className="flex items-center">
          <Package className="h-4 w-4 mr-2" />
          Display Mode
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="mt-2">
          <RadioGroup
            value={filter.packageDisplayMode || 'individual'}
            onValueChange={handlePackageDisplayModeChange}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="text-sm cursor-pointer">
                Show Individual Packages
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="grouped" id="grouped" />
              <Label htmlFor="grouped" className="text-sm cursor-pointer">
                Show as Package Combinations
              </Label>
            </div>
          </RadioGroup>
          
          {filter.packageDisplayMode === 'grouped' && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
              <p>Packages will be combined with others to create complete event solutions that fit your budget.</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )}
  
  // Clear all filters
  const handleClearFilters = () => {
    onClearFilter();
    // Clear searchTerm as well if you're tracking that
    // setSearchTerm('');
    
    if (onClose && isMobile) {
      onClose();
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <Accordion type="multiple" defaultValue={["event-type", "service-type", "location"]}>
        {/* Event Type Filter - Show in both tabs */}
        <AccordionItem value="event-type">
          <AccordionTrigger className="text-sm py-2">
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Event Type
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {EVENT_TYPES.map((type) => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`event-${type}`}
                    checked={filter.eventType === type}
                    onCheckedChange={() => handleEventTypeChange(type)}
                  />
                  <label
                    htmlFor={`event-${type}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Service Type Filter - Show in both tabs */}
        <AccordionItem value="service-type">
          <AccordionTrigger className="text-sm py-2">
            <span className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Service Type
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {SERVICE_TYPES.map((type) => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`service-${type}`}
                    checked={filter.services?.includes(type) || false}
                    onCheckedChange={() => handleServiceTypeChange(type)}
                  />
                  <label
                    htmlFor={`service-${type}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Budget Range Filter - Only show in packages tab */}
        {activeTab !== "providers" && (
          <AccordionItem value="budget">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Budget Range
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-1 mt-4">
                <Slider
                  value={budgetValue}
                  min={0}
                  max={1000000}
                  step={5000}
                  onValueChange={handleBudgetChange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Rs. {budgetValue[0].toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Rs. {budgetValue[1].toLocaleString()}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Crowd Size Filter - Only show in packages tab */}
        {activeTab !== "providers" && (
          <AccordionItem value="crowd-size">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Crowd Size
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-1 mt-4">
                <Slider
                  value={crowdValue}
                  min={0}
                  max={2000}
                  step={10}
                  onValueChange={handleCrowdChange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {crowdValue[0]} guests
                  </span>
                  <span className="text-xs text-gray-500">
                    {crowdValue[1]} guests
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Location Filter - Show in both tabs */}
        <AccordionItem value="location">
          <AccordionTrigger className="text-sm py-2">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 space-y-2">
              <div className="relative">
                <Input
                  placeholder="City or area..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pr-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLocationSearch();
                    }
                  }}
                />
                <Search
                  className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={handleLocationSearch}
                />
              </div>
              <div className="text-xs text-gray-500">
                Enter a city, province, or area
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
          {/* Package Display Mode - Only show in packages tab */}
          {activeTab === "packages" && (
            <>
              {/* Existing package filters */}
            
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Package Display</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="display-individual"
                      name="packageDisplay"
                      checked={filter.packageDisplayMode === 'individual'}
                      onChange={() => {
                        console.log("Changing to individual display mode")
                        onFilterChange({ packageDisplayMode: 'individual' })
                      }}
                    />
                    <label htmlFor="display-individual" className="text-sm cursor-pointer">
                      Individual Packages
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="display-grouped"
                      name="packageDisplay"
                      checked={filter.packageDisplayMode === 'grouped'}
                      onChange={() => {
                        console.log("Changing to grouped display mode")
                        onFilterChange({ packageDisplayMode: 'grouped' })
                      }}
                    />
                    <label htmlFor="display-grouped" className="text-sm cursor-pointer">
                      Combined Packages
                    </label>
                  </div>
                </div>
              
                {filter.packageDisplayMode === 'grouped' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700">
                      Combined packages will show bundles of different services that fit within your budget range.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </Accordion>
      
      {/* Add Apply Filters button for both mobile and desktop */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button 
          className="w-full" 
          onClick={() => {
            // If we're on the packages tab, ensure we fetch packages with the selected display mode
            if (activeTab === "packages" && filter.packageDisplayMode === 'grouped') {
              console.log("Applying combined package filter");
            }
            if (isMobile && onClose) {
              onClose();
            }
          }}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )};