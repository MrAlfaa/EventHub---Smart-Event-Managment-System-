import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp } from "@/providers/AppProvider";
import { serviceTypes, districts, popularAreas } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Search, Calendar as CalendarIcon, Filter as FilterIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Conference",
  "Festival",
  "Anniversary",
  "Graduation",
  "Engagement",
  "Exhibition",
  "Concert",
  "Religious",
  "Other"
] as const;

export function SearchSection() {
  const { updateFilter } = useApp();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [eventType, setEventType] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);
  const [crowdRange, setCrowdRange] = useState([0, 2000]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [packageFilter, setPackageFilter] = useState<string | null>(null);
  
  // For the location selection
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Update available areas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const areas = popularAreas[selectedDistrict] || [];
      setAvailableAreas(areas);
      setSelectedArea("");
    } else {
      setAvailableAreas([]);
      setSelectedArea("");
    }
  }, [selectedDistrict]);

  // Toggle service selection
  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) => 
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Handle search button click
  const handleSearch = () => {
    // Combine district and area for the location
    const locationString = selectedArea 
      ? `${selectedArea}, ${selectedDistrict}` 
      : selectedDistrict || undefined;

    updateFilter({
      eventType: eventType || undefined,
      services: selectedServices,
      date: date,
      location: locationString,
      budgetRange: { min: budgetRange[0], max: budgetRange[1] },
      crowdRange: { min: crowdRange[0], max: crowdRange[1] },
      packageFilter: packageFilter as any
    });

    navigate("/service-providers");
  };

  return (
    <section id="search-section" className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl md:text-4xl font-bold text-blue-900 animate-fade-in">Find Your Perfect Match</h2>
          <p className="text-gray-600 text-lg">
            Search for service providers that match your event needs
          </p>
        </div>

        <Card className="mx-auto max-w-4xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-blue-100">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-6">
              {/* Basic Filters */}
              <div className="space-y-6">
                {/* Event Type and Services Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-type" className="text-sm font-medium text-gray-700">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger id="event-type" className="h-12 bg-white shadow-sm hover:border-blue-400 transition-colors">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="cursor-pointer hover:bg-blue-50">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Services Required</Label>
                    <Select 
                      value={selectedServices[0] || ""}
                      onValueChange={handleServiceToggle}
                    >
                      <SelectTrigger className="h-12 bg-white shadow-sm hover:border-blue-400 transition-colors">
                        <SelectValue placeholder="Select services" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.id} value={service.name} className="cursor-pointer hover:bg-blue-50">
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedServices.map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
                            onClick={() => handleServiceToggle(service)}
                          >
                            {service}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <div className="flex gap-2">
                      <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger className="flex-1 h-12 bg-white shadow-sm hover:border-blue-400 transition-colors">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district} className="cursor-pointer hover:bg-blue-50">
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedDistrict && (
                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                          <SelectTrigger className="flex-1 h-12 bg-white shadow-sm hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAreas.map((area) => (
                              <SelectItem key={area} value={area} className="cursor-pointer hover:bg-blue-50">
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal bg-white shadow-sm hover:border-blue-400 transition-colors",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle and Search Button */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="link"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FilterIcon size={16} className="mr-2" />
                  {showAdvanced ? "Hide" : "Show"} Advanced Filters
                </Button>
                <Button 
                  onClick={handleSearch} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 transition-colors shadow-md hover:shadow-lg"
                >
                  <Search size={18} className="mr-2" />
                  Search
                </Button>
              </div>

              {/* Advanced Filters Section */}
              {showAdvanced && (
                <Accordion type="single" collapsible className="w-full border-t pt-4">
                  <AccordionItem value="budget">
                    <AccordionTrigger>Budget Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum (LKR)</Label>
                          <Select 
                            value={budgetRange[0].toString()} 
                            onValueChange={value => setBudgetRange([parseInt(value), budgetRange[1]])}
                          >
                            <SelectTrigger>
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
                          <Label>Maximum (LKR)</Label>
                          <Select 
                            value={budgetRange[1].toString()} 
                            onValueChange={value => setBudgetRange([budgetRange[0], parseInt(value)])}
                          >
                            <SelectTrigger>
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
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crowd">
                    <AccordionTrigger>Crowd Size</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum People</Label>
                          <Select 
                            value={crowdRange[0].toString()} 
                            onValueChange={value => setCrowdRange([parseInt(value), crowdRange[1]])}
                          >
                            <SelectTrigger>
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
                          <Label>Maximum People</Label>
                          <Select 
                            value={crowdRange[1].toString()} 
                            onValueChange={value => setCrowdRange([crowdRange[0], parseInt(value)])}
                          >
                            <SelectTrigger>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Only show Package Options when multiple services are selected */}
                  {selectedServices.length > 1 && (
                    <AccordionItem value="package">
                      <AccordionTrigger>Package Options</AccordionTrigger>
                      <AccordionContent>
                        <RadioGroup 
                          value={packageFilter || "non-package"} 
                          onValueChange={(val) => setPackageFilter(val)}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="package" id="package" />
                            <Label htmlFor="package">Show as packages</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-package" id="non-package" />
                            <Label htmlFor="non-package">Show individual services</Label>
                          </div>
                        </RadioGroup>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
