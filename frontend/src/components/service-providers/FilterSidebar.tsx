import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EventFilter, ALL_EVENT_TYPES } from "@/types";
import { serviceTypes, districts, popularAreas } from "@/data/mockData";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Filter as FilterIcon, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterSidebarProps {
  filter: EventFilter;
  onFilterChange: (filter: Partial<EventFilter>) => void;
  onClearFilter: () => void;
  className?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({
  filter,
  onFilterChange,
  onClearFilter,
  className,
  onClose,
  isMobile = false,
}: FilterSidebarProps) {
  const [budgetRange, setBudgetRange] = useState([
    filter.budgetRange.min,
    filter.budgetRange.max,
  ]);
  
  const [crowdRange, setCrowdRange] = useState([
    filter.crowdRange.min,
    filter.crowdRange.max,
  ]);
  
  const [selectedServices, setSelectedServices] = useState<string[]>(
    filter.services || []
  );
  
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>(
    filter.eventType
  );
  
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    filter.date
  );
  
  const [packageFilter, setPackageFilter] = useState<string | null>(
    filter.packageFilter
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize districts and areas from filter.location
  useEffect(() => {
    if (filter.location) {
      const [area, district] = filter.location.split(", ").reverse();
      if (district && districts.includes(district)) {
        setSelectedDistrict(district);
        if (area && popularAreas[district]?.includes(area)) {
          setSelectedArea(area);
        }
      }
    } else {
      setSelectedDistrict("");
      setSelectedArea("");
    }
  }, [filter.location]);

  // Update available areas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const areas = popularAreas[selectedDistrict] || [];
      setAvailableAreas(areas);
      if (!areas.includes(selectedArea)) {
        setSelectedArea("");
      }
    } else {
      setAvailableAreas([]);
      setSelectedArea("");
    }
  }, [selectedDistrict]);

  useEffect(() => {
    setBudgetRange([filter.budgetRange.min, filter.budgetRange.max]);
    setCrowdRange([filter.crowdRange.min, filter.crowdRange.max]);
    setSelectedServices(filter.services || []);
    setSelectedEventType(filter.eventType);
    setSelectedDate(filter.date);
    setPackageFilter(filter.packageFilter);
  }, [filter]);

  // Add logging for debugging
  useEffect(() => {
    console.log('Selected Services:', selectedServices);
    console.log('Show Advanced:', showAdvanced);
    console.log('Package Filter:', packageFilter);
  }, [selectedServices, showAdvanced, packageFilter]);

  const handleServiceSelect = (value: string) => {
    const updatedServices = selectedServices.includes(value)
      ? selectedServices.filter((s) => s !== value)
      : [...selectedServices, value];
    setSelectedServices(updatedServices);
  };

  const handleEventTypeChange = (value: string | undefined) => {
    setSelectedEventType(value);
  };
  
  const handleApplyFilters = () => {
    // Combine district and area for the location
    const locationString = selectedArea 
      ? `${selectedArea}, ${selectedDistrict}` 
      : selectedDistrict || undefined;

    onFilterChange({
      eventType: selectedEventType,
      services: selectedServices,
      date: selectedDate,
      location: locationString,
      budgetRange: {
        min: budgetRange[0],
        max: budgetRange[1],
      },
      crowdRange: {
        min: crowdRange[0],
        max: crowdRange[1],
      },
      packageFilter: packageFilter as any,
    });
    
    if (isMobile && onClose) {
      onClose();
    }
  };
  
  const handleClearFilters = () => {
    onClearFilter();
    
    if (isMobile && onClose) {
      onClose();
    }
  };

  const filterHeader = (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FilterIcon size={18} className="text-blue-600" />
        <h2 className={`${isMobile ? 'text-lg' : 'text-base sm:text-lg'} font-semibold`}>Filters</h2>
      </div>
      {isMobile && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X size={18} />
        </Button>
      )}
    </div>
  );

  const filterFooter = (
    <div className={`mt-6 flex flex-col gap-2 ${isMobile ? 'sticky bottom-0 bg-white pb-4 pt-2' : ''}`}>
      <Button 
        onClick={handleApplyFilters} 
        className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-9 text-xs sm:text-sm'}`}
      >
        Apply Filters
      </Button>
      <Button 
        variant="outline" 
        onClick={handleClearFilters} 
        className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-9 text-xs sm:text-sm'}`}
      >
        Clear All
      </Button>
    </div>
  );

  const filterContent = (
    <>
      {filterHeader}
      
      <div className={`space-y-5 ${isMobile ? 'pb-20 overflow-y-auto max-h-[calc(100vh-120px)]' : ''}`}>
        <div>
          <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Event Type</h3>
          <Select
            value={selectedEventType}
            onValueChange={handleEventTypeChange}
          >
            <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {ALL_EVENT_TYPES.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className={isMobile ? 'text-sm' : 'text-xs'}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEventType && (
            <div className="mt-2">
              <Badge
                variant="secondary"
                className="text-xs"
                onClick={() => handleEventTypeChange(undefined)}
              >
                {selectedEventType}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            </div>
          )}
        </div>
        
        <div>
          <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Services</h3>
          <Select
            value={selectedServices[0]} // Show the first selected service
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((service) => (
                <SelectItem
                  key={service.id}
                  value={service.name}
                  className={isMobile ? 'text-sm' : 'text-xs'}
                >
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedServices.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedServices.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="text-xs"
                  onClick={() => handleServiceSelect(service)}
                >
                  {service}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Location</h3>
          <div className="space-y-2">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem 
                    key={district} 
                    value={district}
                    className={isMobile ? 'text-sm' : 'text-xs'}
                  >
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDistrict && (
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem 
                      key={area} 
                      value={area}
                      className={isMobile ? 'text-sm' : 'text-xs'}
                    >
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <div>
          <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Date</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !selectedDate && "text-muted-foreground",
                  isMobile ? 'h-10 text-sm' : 'h-8 text-xs'
                )}
              >
                <CalendarIcon className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className={isMobile ? 'p-3' : 'p-2'}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-4 w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Advanced Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>

          {showAdvanced && (
            <div className="space-y-5">
              <div>
                <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Budget Range (LKR)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Select 
                      value={budgetRange[0].toString()} 
                      onValueChange={value => setBudgetRange([parseInt(value), budgetRange[1]])}
                    >
                      <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                        <SelectValue placeholder="Min Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 50000, 100000, 250000, 500000].map((value) => (
                          <SelectItem key={`min-${value}`} value={value.toString()}>
                            {value.toLocaleString()} LKR
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={budgetRange[1].toString()} 
                      onValueChange={value => setBudgetRange([budgetRange[0], parseInt(value)])}
                    >
                      <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                        <SelectValue placeholder="Max Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {[100000, 250000, 500000, 1000000, 2000000].map((value) => (
                          <SelectItem key={`max-${value}`} value={value.toString()}>
                            {value.toLocaleString()} LKR
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Crowd Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Select 
                      value={crowdRange[0].toString()} 
                      onValueChange={value => setCrowdRange([parseInt(value), crowdRange[1]])}
                    >
                      <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                        <SelectValue placeholder="Min People" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 50, 100, 200, 500].map((value) => (
                          <SelectItem key={`min-${value}`} value={value.toString()}>
                            {value} people
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={crowdRange[1].toString()} 
                      onValueChange={value => setCrowdRange([crowdRange[0], parseInt(value)])}
                    >
                      <SelectTrigger className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-8 text-xs'}`}>
                        <SelectValue placeholder="Max People" />
                      </SelectTrigger>
                      <SelectContent>
                        {[100, 250, 500, 1000, 2000].map((value) => (
                          <SelectItem key={`max-${value}`} value={value.toString()}>
                            {value} people
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Package Options Section */}
              <div className="space-y-3">
                <h3 className={`mb-2 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Package Options</h3>
                <RadioGroup 
                  value={packageFilter || "non-package"}
                  onValueChange={(value) => setPackageFilter(value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="package" id="package" />
                    <Label htmlFor="package" className={isMobile ? 'text-sm' : 'text-xs'}>
                      Show as packages
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-package" id="non-package" />
                    <Label htmlFor="non-package" className={isMobile ? 'text-sm' : 'text-xs'}>
                      Show individual services
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {filterFooter}
    </>
  );

  return (
    <div className={cn(`space-y-4 ${isMobile ? 'text-base' : 'text-sm'}`, className)}>
      {filterContent}
    </div>
  );
}
