import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash, 
  MapPin,
  CalendarRange,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Types for different categories
interface ServiceType {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

interface Location {
  id: string;
  name: string;
  status: "active" | "inactive";
}

interface EventType {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

// Mock data for service types
const mockServiceTypes: ServiceType[] = [
  {
    id: "st-001",
    name: "Photography",
    description: "Professional photography services for all types of events",
    status: "active",
  },
  {
    id: "st-002",
    name: "Catering",
    description: "Food and beverage services for events",
    status: "active",
  },
  {
    id: "st-003",
    name: "Decoration",
    description: "Event decoration and venue setup services",
    status: "active",
  },
  {
    id: "st-004",
    name: "Music & Entertainment",
    description: "DJs, live bands, and other entertainment options",
    status: "inactive",
  },
];

// Mock data for locations
const mockLocations: Location[] = [
  {
    id: "loc-001",
    name: "Colombo",
    status: "active",
  },
  {
    id: "loc-002",
    name: "Kandy",
    status: "active",
  },
  {
    id: "loc-003",
    name: "Galle",
    status: "active",
  },
  {
    id: "loc-004",
    name: "Jaffna",
    status: "inactive",
  },
];

// Mock data for event types
const mockEventTypes: EventType[] = [
  {
    id: "ev-001",
    name: "Wedding",
    description: "Traditional and modern wedding celebrations",
    status: "active",
  },
  {
    id: "ev-002",
    name: "Corporate Event",
    description: "Business meetings, conferences, and corporate gatherings",
    status: "active",
  },
  {
    id: "ev-003",
    name: "Birthday Party",
    description: "Birthday celebrations for all ages",
    status: "active",
  },
  {
    id: "ev-004",
    name: "Anniversary",
    description: "Wedding anniversary and milestone celebrations",
    status: "inactive",
  },
];

const ServiceTypesManager = () => {
  // State for active tab
  const [categoryType, setCategoryType] = useState<string>("serviceTypes");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5; // Changed from state to constant

  // State for service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(mockServiceTypes);
  const [newServiceType, setNewServiceType] = useState<Omit<ServiceType, "id">>({
    name: "",
    description: "",
    status: "active",
  });
  
  // State for locations
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [newLocation, setNewLocation] = useState<Omit<Location, "id">>({
    name: "",
    status: "active",
  });
  
  // State for event types
  const [eventTypes, setEventTypes] = useState<EventType[]>(mockEventTypes);
  const [newEventType, setNewEventType] = useState<Omit<EventType, "id">>({
    name: "",
    description: "",
    status: "active",
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  
  // Selected item for editing/deleting
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);

  // Filtering functions
  const filteredServiceTypes = serviceTypes.filter((item) => {
    if (activeTab !== "all" && item.status !== activeTab) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Pagination calculations for service types
  const totalServiceTypePages = Math.ceil(filteredServiceTypes.length / itemsPerPage);
  const indexOfLastServiceType = currentPage * itemsPerPage;
  const indexOfFirstServiceType = indexOfLastServiceType - itemsPerPage;
  const currentServiceTypes = filteredServiceTypes.slice(indexOfFirstServiceType, indexOfLastServiceType);

  const filteredLocations = locations.filter((item) => {
    if (activeTab !== "all" && item.status !== activeTab) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query);
    }
    
    return true;
  });

  const filteredEventTypes = eventTypes.filter((item) => {
    if (activeTab !== "all" && item.status !== activeTab) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Pagination control functions
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalServiceTypePages));
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const firstPage = () => {
    setCurrentPage(1);
  };
  
  const lastPage = () => {
    setCurrentPage(totalServiceTypePages);
  };

  // Reset pagination when changing tabs or applying filters
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Handler for adding new items
  const handleAddItem = () => {
    if (categoryType === "serviceTypes") {
      if (!newServiceType.name || !newServiceType.description) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const newItem: ServiceType = {
        id: `st-${Date.now()}`,
        ...newServiceType,
      };
      
      setServiceTypes([...serviceTypes, newItem]);
      setNewServiceType({
        name: "",
        description: "",
        status: "active",
      });
      
      toast.success("Service type added successfully");
    } 
    else if (categoryType === "locations") {
      if (!newLocation.name) {
        toast.error("Please enter the location name");
        return;
      }
      
      const newItem: Location = {
        id: `loc-${Date.now()}`,
        ...newLocation,
      };
      
      setLocations([...locations, newItem]);
      setNewLocation({
        name: "",
        status: "active",
      });
      
      toast.success("Location added successfully");
    }
    else if (categoryType === "eventTypes") {
      if (!newEventType.name || !newEventType.description) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const newItem: EventType = {
        id: `ev-${Date.now()}`,
        ...newEventType,
      };
      
      setEventTypes([...eventTypes, newItem]);
      setNewEventType({
        name: "",
        description: "",
        status: "active",
      });
      
      toast.success("Event type added successfully");
    }
    
    setIsCreateDialogOpen(false);
  };

  // Handler for editing items
  const handleEditItem = () => {
    if (categoryType === "serviceTypes" && selectedServiceType) {
      setServiceTypes(
        serviceTypes.map((item) =>
          item.id === selectedServiceType.id ? selectedServiceType : item
        )
      );
      toast.success("Service type updated successfully");
    } 
    else if (categoryType === "locations" && selectedLocation) {
      setLocations(
        locations.map((item) =>
          item.id === selectedLocation.id ? selectedLocation : item
        )
      );
      toast.success("Location updated successfully");
    }
    else if (categoryType === "eventTypes" && selectedEventType) {
      setEventTypes(
        eventTypes.map((item) =>
          item.id === selectedEventType.id ? selectedEventType : item
        )
      );
      toast.success("Event type updated successfully");
    }
    
    setIsEditDialogOpen(false);
  };

  // Handler for deleting items
  const handleDeleteItem = () => {
    if (categoryType === "serviceTypes" && selectedServiceType) {
      setServiceTypes(
        serviceTypes.filter((item) => item.id !== selectedServiceType.id)
      );
      toast.success("Service type deleted successfully");
    } 
    else if (categoryType === "locations" && selectedLocation) {
      setLocations(
        locations.filter((item) => item.id !== selectedLocation.id)
      );
      toast.success("Location deleted successfully");
    }
    else if (categoryType === "eventTypes" && selectedEventType) {
      setEventTypes(
        eventTypes.filter((item) => item.id !== selectedEventType.id)
      );
      toast.success("Event type deleted successfully");
    }
    
    setIsDeleteDialogOpen(false);
  };

  // Opens the edit dialog and sets the selected item
  const openEditDialog = (type: string, id: string) => {
    if (type === "serviceTypes") {
      const item = serviceTypes.find((item) => item.id === id);
      if (item) {
        setSelectedServiceType(item);
        setCategoryType("serviceTypes");
        setIsEditDialogOpen(true);
      }
    } 
    else if (type === "locations") {
      const item = locations.find((item) => item.id === id);
      if (item) {
        setSelectedLocation(item);
        setCategoryType("locations");
        setIsEditDialogOpen(true);
      }
    }
    else if (type === "eventTypes") {
      const item = eventTypes.find((item) => item.id === id);
      if (item) {
        setSelectedEventType(item);
        setCategoryType("eventTypes");
        setIsEditDialogOpen(true);
      }
    }
  };

  // Opens the delete confirmation dialog
  const openDeleteDialog = (type: string, id: string) => {
    if (type === "serviceTypes") {
      const item = serviceTypes.find((item) => item.id === id);
      if (item) {
        setSelectedServiceType(item);
        setCategoryType("serviceTypes");
        setIsDeleteDialogOpen(true);
      }
    } 
    else if (type === "locations") {
      const item = locations.find((item) => item.id === id);
      if (item) {
        setSelectedLocation(item);
        setCategoryType("locations");
        setIsDeleteDialogOpen(true);
      }
    }
    else if (type === "eventTypes") {
      const item = eventTypes.find((item) => item.id === id);
      if (item) {
        setSelectedEventType(item);
        setCategoryType("eventTypes");
        setIsDeleteDialogOpen(true);
      }
    }
  };

  // Toggles the status of an item
  const toggleStatus = (type: string, id: string) => {
    if (type === "serviceTypes") {
      setServiceTypes(
        serviceTypes.map((item) =>
          item.id === id ? { ...item, status: item.status === "active" ? "inactive" : "active" } : item
        )
      );
      toast.success("Service type status updated");
    } 
    else if (type === "locations") {
      setLocations(
        locations.map((item) =>
          item.id === id ? { ...item, status: item.status === "active" ? "inactive" : "active" } : item
        )
      );
      toast.success("Location status updated");
    }
    else if (type === "eventTypes") {
      setEventTypes(
        eventTypes.map((item) =>
          item.id === id ? { ...item, status: item.status === "active" ? "inactive" : "active" } : item
        )
      );
      toast.success("Event type status updated");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
      </div>

      {/* Main Category Type Tabs */}
      <Tabs 
        defaultValue="serviceTypes" 
        value={categoryType} 
        onValueChange={(value) => {
          setCategoryType(value);
          setActiveTab("all");
          setSearchQuery("");
          resetPagination();
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="serviceTypes" className="text-base flex items-center gap-2">
            <Tag size={16} />
            Service Types
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-base flex items-center gap-2">
            <MapPin size={16} />
            Locations
          </TabsTrigger>
          <TabsTrigger value="eventTypes" className="text-base flex items-center gap-2">
            <CalendarRange size={16} />
            Event Types
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPagination();
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  setIsCreateDialogOpen(true);
                }}
                variant="default"
                className="gap-2"
              >
                <Plus size={16} />
                {categoryType === "serviceTypes" && "Add Service Type"}
                {categoryType === "locations" && "Add Location"}
                {categoryType === "eventTypes" && "Add Event Type"}
              </Button>
            </div>
          </div>
        </div>

        {/* Service Types Tab Content */}
        <TabsContent value="serviceTypes" className="mt-4">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            resetPagination();
          }}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Description</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Status</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentServiceTypes.length > 0 ? (
                        currentServiceTypes.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-medium">{item.name}</td>
                            <td className="p-4">{item.description}</td>
                            <td className="p-4 text-center">
                              <Badge 
                                className={item.status === "active" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                }
                                onClick={() => toggleStatus("serviceTypes", item.id)}
                              >
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog("serviceTypes", item.id)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog("serviceTypes", item.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No service types found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls for Service Types */}
                  {filteredServiceTypes.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstServiceType + 1}-
                        {Math.min(indexOfLastServiceType, filteredServiceTypes.length)} of{" "}
                        {filteredServiceTypes.length} items
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={firstPage}
                            disabled={currentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <span className="text-sm">
                          Page {currentPage} of {totalServiceTypePages || 1}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={nextPage}
                            disabled={currentPage >= totalServiceTypePages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={lastPage}
                            disabled={currentPage >= totalServiceTypePages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </TabsContent>

        {/* Locations Tab Content */}
        <TabsContent value="locations" className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Status</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-medium">{item.name}</td>
                            <td className="p-4 text-center">
                              <Badge 
                                className={item.status === "active" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                }
                                onClick={() => toggleStatus("locations", item.id)}
                              >
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog("locations", item.id)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog("locations", item.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-muted-foreground">
                            No locations found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </TabsContent>

        {/* Event Types Tab Content */}
        <TabsContent value="eventTypes" className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Description</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Status</th>
                        <th className="h-10 px-4 text-center align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventTypes.length > 0 ? (
                        filteredEventTypes.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-medium">{item.name}</td>
                            <td className="p-4">{item.description}</td>
                            <td className="p-4 text-center">
                              <Badge 
                                className={item.status === "active" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                }
                                onClick={() => toggleStatus("eventTypes", item.id)}
                              >
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog("eventTypes", item.id)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog("eventTypes", item.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No event types found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryType === "serviceTypes" && "Add Service Type"}
              {categoryType === "locations" && "Add Location"}
              {categoryType === "eventTypes" && "Add Event Type"}
            </DialogTitle>
            <DialogDescription>
              {categoryType === "serviceTypes" && "Add a new service type to the system."}
              {categoryType === "locations" && "Add a new location to the system."}
              {categoryType === "eventTypes" && "Add a new event type to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {categoryType === "serviceTypes" && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={newServiceType.name}
                    onChange={(e) => setNewServiceType({ ...newServiceType, name: e.target.value })}
                    placeholder="Enter service type name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description *</label>
                  <Input
                    id="description"
                    value={newServiceType.description}
                    onChange={(e) => setNewServiceType({ ...newServiceType, description: e.target.value })}
                    placeholder="Enter a brief description"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={newServiceType.status}
                    onValueChange={(value: "active" | "inactive") => setNewServiceType({ ...newServiceType, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {categoryType === "locations" && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="Enter location name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={newLocation.status}
                    onValueChange={(value: "active" | "inactive") => setNewLocation({ ...newLocation, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {categoryType === "eventTypes" && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={newEventType.name}
                    onChange={(e) => setNewEventType({ ...newEventType, name: e.target.value })}
                    placeholder="Enter event type name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description *</label>
                  <Input
                    id="description"
                    value={newEventType.description}
                    onChange={(e) => setNewEventType({ ...newEventType, description: e.target.value })}
                    placeholder="Enter a brief description"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={newEventType.status}
                    onValueChange={(value: "active" | "inactive") => setNewEventType({ ...newEventType, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryType === "serviceTypes" && "Edit Service Type"}
              {categoryType === "locations" && "Edit Location"}
              {categoryType === "eventTypes" && "Edit Event Type"}
            </DialogTitle>
            <DialogDescription>
              {categoryType === "serviceTypes" && "Edit the selected service type."}
              {categoryType === "locations" && "Edit the selected location."}
              {categoryType === "eventTypes" && "Edit the selected event type."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {categoryType === "serviceTypes" && selectedServiceType && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={selectedServiceType.name}
                    onChange={(e) => setSelectedServiceType({ ...selectedServiceType, name: e.target.value })}
                    placeholder="Enter service type name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description *</label>
                  <Input
                    id="description"
                    value={selectedServiceType.description}
                    onChange={(e) => setSelectedServiceType({ ...selectedServiceType, description: e.target.value })}
                    placeholder="Enter a brief description"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedServiceType.status}
                    onValueChange={(value: "active" | "inactive") => setSelectedServiceType({ ...selectedServiceType, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {categoryType === "locations" && selectedLocation && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={selectedLocation.name}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation, name: e.target.value })}
                    placeholder="Enter location name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedLocation.status}
                    onValueChange={(value: "active" | "inactive") => setSelectedLocation({ ...selectedLocation, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {categoryType === "eventTypes" && selectedEventType && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={selectedEventType.name}
                    onChange={(e) => setSelectedEventType({ ...selectedEventType, name: e.target.value })}
                    placeholder="Enter event type name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description *</label>
                  <Input
                    id="description"
                    value={selectedEventType.description}
                    onChange={(e) => setSelectedEventType({ ...selectedEventType, description: e.target.value })}
                    placeholder="Enter a brief description"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedEventType.status}
                    onValueChange={(value: "active" | "inactive") => setSelectedEventType({ ...selectedEventType, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditItem}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash size={18} />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {categoryType === "serviceTypes" && selectedServiceType && (
              <div className="border rounded-md p-4 bg-muted/50">
                <p><strong>Name:</strong> {selectedServiceType.name}</p>
                <p><strong>Description:</strong> {selectedServiceType.description}</p>
              </div>
            )}

            {categoryType === "locations" && selectedLocation && (
              <div className="border rounded-md p-4 bg-muted/50">
                <p><strong>Name:</strong> {selectedLocation.name}</p>
              </div>
            )}

            {categoryType === "eventTypes" && selectedEventType && (
              <div className="border rounded-md p-4 bg-muted/50">
                <p><strong>Name:</strong> {selectedEventType.name}</p>
                <p><strong>Description:</strong> {selectedEventType.description}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTypesManager;
