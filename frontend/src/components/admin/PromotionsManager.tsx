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
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Eye, 
  Edit, 
  Trash, 
  Calendar, 
  MapPin, 
  Bell,
  Image
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Define interfaces for both promotions and public events
interface Promotion {
  id: string;
  type: "promotion";
  title: string;
  description: string;
  bannerImage: string;
  validUntil: string;
  publishedDate: string;
  status: string;
  promoCode?: string;
  terms?: string[];
}

interface PublicEvent {
  id: string;
  type: "event";
  title: string;
  description: string;
  bannerImage: string;
  location: string;
  eventDate: string;
  publishedDate: string;
  status: string;
}

type ContentItem = Promotion | PublicEvent;

// Mock data for promotions and events
const mockItems: ContentItem[] = [
  {
    id: "promo-1",
    type: "promotion",
    title: "Summer Wedding Special",
    description: "Exclusive packages for summer weddings with 20% discount",
    bannerImage: "https://placehold.co/600x400/orange/white?text=Summer+Wedding",
    validUntil: "2025-07-15",
    publishedDate: "2025-03-15",
    status: "active",
  },
  {
    id: "promo-2",
    type: "promotion",
    title: "Corporate Event Solutions",
    description: "Complete solutions for corporate events and conferences",
    bannerImage: "https://placehold.co/600x400/blue/white?text=Corporate+Events",
    validUntil: "2025-06-10",
    publishedDate: "2025-03-10",
    status: "active",
  },
  {
    id: "event-1",
    type: "event",
    title: "Wedding Fair 2025",
    description: "The biggest wedding fair of the year with top vendors and service providers",
    bannerImage: "https://placehold.co/600x400/purple/white?text=Wedding+Fair",
    location: "Colombo City Center, Grand Ballroom",
    eventDate: "2025-05-25",
    publishedDate: "2025-02-25",
    status: "active",
  },
  {
    id: "event-2",
    type: "event",
    title: "Event Planners Conference",
    description: "Annual conference for event planners and service providers",
    bannerImage: "https://placehold.co/600x400/pink/white?text=Planners+Conference",
    location: "Shangri-La Hotel, Colombo",
    eventDate: "2025-06-20",
    publishedDate: "2025-02-20",
    status: "draft",
  },
];

const PromotionsManager = () => {
  const [items, setItems] = useState<ContentItem[]>(mockItems);
  const [contentType, setContentType] = useState<string>("promotion");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [createType, setCreateType] = useState<"promotion" | "event">("promotion");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  
  // Create new promotion state
  const [newPromotion, setNewPromotion] = useState<Promotion>({
    id: `promo-${Date.now()}`,
    type: "promotion",
    title: "",
    description: "",
    bannerImage: "",
    validUntil: "",
    publishedDate: new Date().toISOString().split('T')[0],
    status: "draft",
    promoCode: "",
    terms: [],
  });

  // Create new event state
  const [newEvent, setNewEvent] = useState<PublicEvent>({
    id: `event-${Date.now()}`,
    type: "event",
    title: "",
    description: "",
    bannerImage: "",
    location: "",
    eventDate: "",
    publishedDate: new Date().toISOString().split('T')[0],
    status: "draft",
  });

  // For editing existing items
  const [editingPromotion, setEditingPromotion] = useState<Promotion>({
    id: '',
    type: "promotion",
    title: "",
    description: "",
    bannerImage: "",
    validUntil: "",
    publishedDate: "",
    status: "draft",
  });
  
  const [editingEvent, setEditingEvent] = useState<PublicEvent>({
    id: '',
    type: "event",
    title: "",
    description: "",
    bannerImage: "",
    location: "",
    eventDate: "",
    publishedDate: "",
    status: "draft",
  });

  const filteredItems = items.filter((item) => {
    // Filter by status tab
    if (activeTab !== "all" && item.status !== activeTab) {
      return false;
    }

    // Filter by content type
    if (contentType !== "all" && item.type !== contentType) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleAddItem = () => {
    if (createType === "promotion") {
      // Validate promotion fields
      if (!newPromotion.title || !newPromotion.description || !newPromotion.validUntil) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setItems([...items, newPromotion]);
      
      setNewPromotion({
        id: `promo-${Date.now()}`,
        type: "promotion",
        title: "",
        description: "",
        bannerImage: "",
        validUntil: "",
        publishedDate: new Date().toISOString().split('T')[0],
        status: "draft",
        promoCode: "",
        terms: [],
      });
      
      toast.success("Promotion created successfully");
    } else {
      // Validate event fields
      if (!newEvent.title || !newEvent.description || !newEvent.location || !newEvent.eventDate) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setItems([...items, newEvent]);
      
      setNewEvent({
        id: `event-${Date.now()}`,
        type: "event",
        title: "",
        description: "",
        bannerImage: "",
        location: "",
        eventDate: "",
        publishedDate: new Date().toISOString().split('T')[0],
        status: "draft",
      });
      
      toast.success("Public Event created successfully");
    }
    
    setIsCreateDialogOpen(false);
  };

  const handlePublish = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: "active" } : item
      )
    );
    setIsViewDialogOpen(false);
    toast.success("Item published successfully");
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false);
    toast.success("Item deleted successfully");
  };

  const handleViewItem = (item: ContentItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditItem = (item: ContentItem) => {
    // Close any open dialogs
    setIsViewDialogOpen(false);
    
    // Setup edit form based on item type
    if (item.type === "promotion") {
      setEditingPromotion(item as Promotion);
      setCreateType("promotion");
    } else {
      setEditingEvent(item as PublicEvent);
      setCreateType("event");
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (createType === "promotion") {
      // Validate promotion fields
      if (!editingPromotion.title || !editingPromotion.description || !editingPromotion.validUntil) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setItems(
        items.map((item) =>
          item.id === editingPromotion.id ? editingPromotion : item
        )
      );
      
      toast.success("Promotion updated successfully");
    } else {
      // Validate event fields
      if (!editingEvent.title || !editingEvent.description || !editingEvent.location || !editingEvent.eventDate) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setItems(
        items.map((item) =>
          item.id === editingEvent.id ? editingEvent : item
        )
      );
      
      toast.success("Public Event updated successfully");
    }
    
    setIsEditDialogOpen(false);
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "promotion" ? "Promotion" : "Public Event";
  };

  const getTypeBadgeStyles = (type: string) => {
    return type === "promotion" 
      ? "bg-purple-100 text-purple-800 border-purple-200" 
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const renderItemDetails = () => {
    if (!selectedItem) return null;
    
    if (selectedItem.type === "promotion") {
      return (
        <>
          <div className="flex items-center justify-between">
            <Badge className={getTypeBadgeStyles(selectedItem.type)}>
              {getTypeLabel(selectedItem.type)}
            </Badge>
            <Badge className={getStatusBadgeStyles(selectedItem.status)}>
              {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
            <p className="text-gray-500">
              Published: {new Date(selectedItem.publishedDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-orange-600">
            <Calendar className="h-4 w-4" />
            <span>Valid until: {new Date(selectedItem.validUntil).toLocaleDateString()}</span>
          </div>

          {selectedItem.promoCode && (
            <div className="mt-2 bg-purple-50 p-3 rounded-md">
              <p className="text-sm font-medium text-purple-800">Promo Code: {selectedItem.promoCode}</p>
            </div>
          )}
          
          <p className="text-gray-600">{selectedItem.description}</p>

          {selectedItem.terms && selectedItem.terms.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Terms & Conditions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedItem.terms.map((term, index) => (
                  <li key={index} className="text-sm text-gray-600">{term}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <div className="flex items-center justify-between">
            <Badge className={getTypeBadgeStyles(selectedItem.type)}>
              {getTypeLabel(selectedItem.type)}
            </Badge>
            <Badge className={getStatusBadgeStyles(selectedItem.status)}>
              {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
            <p className="text-gray-500">
              Published: {new Date(selectedItem.publishedDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-blue-600">
            <Calendar className="h-4 w-4" />
            <span>Event date: {new Date(selectedItem.eventDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-emerald-600">
            <MapPin className="h-4 w-4" />
            <span>Location: {selectedItem.location}</span>
          </div>
          
          <p className="text-gray-600">{selectedItem.description}</p>
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions Manager</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setCreateType("promotion");
              setIsCreateDialogOpen(true);
            }}
            variant="outline"
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900 border-purple-200"
          >
            <Plus size={16} className="mr-2" />
            Promotion Publish
          </Button>
          <Button 
            onClick={() => {
              setCreateType("event");
              setIsCreateDialogOpen(true);
            }}
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 border-blue-200"
          >
            <Plus size={16} className="mr-2" />
            Public Event Publish
          </Button>
        </div>
      </div>

      {/* Main Content Type Tabs */}
      <Tabs defaultValue="promotions" onValueChange={(value) => setContentType(value === "promotions" ? "promotion" : value === "events" ? "event" : "all")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="promotions" className="text-base">Promotions</TabsTrigger>
          <TabsTrigger value="events" className="text-base">Public Events</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <TabsContent value="promotions" className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>
                    {activeTab === "all" && "All Promotions"}
                    {activeTab === "active" && "Active Promotions"}
                    {activeTab === "draft" && "Draft Promotions"}
                    {activeTab === "archived" && "Archived Promotions"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {filteredItems.filter(item => item.type === "promotion").length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <p className="text-gray-500">No promotions found</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setCreateType("promotion");
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus size={16} className="mr-2" />
                          Create Promotion
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                      {filteredItems
                        .filter(item => item.type === "promotion")
                        .map((item) => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
                          >
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              {item.bannerImage ? (
                                <img 
                                  src={item.bannerImage} 
                                  alt={item.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-gray-200">
                                  <Image className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <Badge className={getStatusBadgeStyles(item.status)}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                {item.description}
                              </p>
                              
                              <div className="mb-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1 text-orange-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>Valid until: {new Date((item as Promotion).validUntil).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => handleViewItem(item)}
                                >
                                  <Eye size={16} className="mr-1" /> View
                                </Button>

                                {item.status !== "active" && (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => handlePublish(item.id)}
                                  >
                                    <Bell size={16} className="mr-1" /> Publish
                                  </Button>
                                )}
                                
                                {item.status === "active" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash size={16} className="mr-1" /> Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>
                    {activeTab === "all" && "All Public Events"}
                    {activeTab === "active" && "Active Public Events"}
                    {activeTab === "draft" && "Draft Public Events"}
                    {activeTab === "archived" && "Archived Public Events"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {filteredItems.filter(item => item.type === "event").length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <p className="text-gray-500">No public events found</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setCreateType("event");
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus size={16} className="mr-2" />
                          Create Public Event
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                      {filteredItems
                        .filter(item => item.type === "event")
                        .map((item) => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
                          >
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              {item.bannerImage ? (
                                <img 
                                  src={item.bannerImage} 
                                  alt={item.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-gray-200">
                                  <Image className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <Badge className={getStatusBadgeStyles(item.status)}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                {item.description}
                              </p>
                              
                              <div className="mb-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>Event date: {new Date((item as PublicEvent).eventDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{(item as PublicEvent).location}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => handleViewItem(item)}
                                >
                                  <Eye size={16} className="mr-1" /> View
                                </Button>

                                {item.status !== "active" && (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => handlePublish(item.id)}
                                  >
                                    <Bell size={16} className="mr-1" /> Publish
                                  </Button>
                                )}
                                
                                {item.status === "active" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash size={16} className="mr-1" /> Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Create Dialog (with tabs for Promotion and Event) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>
              {createType === "promotion" ? "Create New Promotion" : "Create New Public Event"}
            </DialogTitle>
            <DialogDescription>
              {createType === "promotion" 
                ? "Create a promotional campaign to showcase on the platform" 
                : "Create a public event to showcase on the platform"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            <Tabs 
              defaultValue={createType} 
              value={createType} 
              onValueChange={(value) => setCreateType(value as "promotion" | "event")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="promotion">Promotion</TabsTrigger>
                <TabsTrigger value="event">Public Event</TabsTrigger>
              </TabsList>

              <TabsContent value="promotion" className="mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="promo-title" className="text-sm font-medium">
                      Title*
                    </label>
                    <Input
                      id="promo-title"
                      placeholder="Enter promotion title"
                      value={newPromotion.title}
                      onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="promo-description" className="text-sm font-medium">
                      Description*
                    </label>
                    <Textarea
                      id="promo-description"
                      placeholder="Enter promotion description"
                      value={newPromotion.description}
                      onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="promo-valid-until" className="text-sm font-medium">
                      Valid Until*
                    </label>
                    <Input
                      id="promo-valid-until"
                      type="date"
                      value={newPromotion.validUntil}
                      onChange={(e) => setNewPromotion({ ...newPromotion, validUntil: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="promo-code" className="text-sm font-medium">
                      Promo Code (Optional)
                    </label>
                    <Input
                      id="promo-code"
                      placeholder="Enter promo code (e.g., SUMMER25)"
                      value={newPromotion.promoCode}
                      onChange={(e) => setNewPromotion({ ...newPromotion, promoCode: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Leave empty if no promo code is needed
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="promo-terms" className="text-sm font-medium">
                      Terms & Conditions (Optional)
                    </label>
                    <Textarea
                      id="promo-terms"
                      placeholder="Enter terms & conditions (one per line)"
                      value={newPromotion.terms?.join('\n') || ''}
                      onChange={(e) => setNewPromotion({ 
                        ...newPromotion, 
                        terms: e.target.value.split('\n').filter(term => term.trim() !== '') 
                      })}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Enter each term on a new line. Leave empty if not applicable.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Upload Banner Image*</label>
                    <div 
                      className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50"
                      onClick={() => document.getElementById("promotion-banner-upload")?.click()}
                    >
                      <Input
                        id="promotion-banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const imageUrl = URL.createObjectURL(file);
                            setNewPromotion({
                              ...newPromotion,
                              bannerImage: imageUrl,
                            });
                            toast.success("Banner image uploaded successfully");
                          }
                        }}
                      />
                      <div className="flex flex-col items-center">
                        {newPromotion.bannerImage ? (
                          <div className="relative w-full h-24 mb-2">
                            <img 
                              src={newPromotion.bannerImage} 
                              alt="Promotion Banner Preview" 
                              className="h-full mx-auto object-contain" 
                            />
                          </div>
                        ) : (
                          <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {newPromotion.bannerImage ? "Change image" : "Click to upload banner image"}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WebP (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="event" className="mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="event-title" className="text-sm font-medium">
                      Title*
                    </label>
                    <Input
                      id="event-title"
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="event-description" className="text-sm font-medium">
                      Description*
                    </label>
                    <Textarea
                      id="event-description"
                      placeholder="Enter event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="event-location" className="text-sm font-medium">
                      Location*
                    </label>
                    <Input
                      id="event-location"
                      placeholder="Enter event location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="event-date" className="text-sm font-medium">
                      Event Date*
                    </label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.eventDate}
                      onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Upload Banner Image*</label>
                    <div 
                      className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50"
                      onClick={() => document.getElementById("event-banner-upload")?.click()}
                    >
                      <Input
                        id="event-banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const imageUrl = URL.createObjectURL(file);
                            setNewEvent({
                              ...newEvent,
                              bannerImage: imageUrl,
                            });
                            toast.success("Banner image uploaded successfully");
                          }
                        }}
                      />
                      <div className="flex flex-col items-center">
                        {newEvent.bannerImage ? (
                          <div className="relative w-full h-24 mb-2">
                            <img 
                              src={newEvent.bannerImage} 
                              alt="Event Banner Preview" 
                              className="h-full mx-auto object-contain" 
                            />
                          </div>
                        ) : (
                          <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {newEvent.bannerImage ? "Change image" : "Click to upload banner image"}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WebP (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-none mt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              {createType === "promotion" ? "Create Promotion" : "Create Public Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      {selectedItem && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-none">
              <DialogTitle>
                {selectedItem.type === "promotion" ? "Promotion Details" : "Public Event Details"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 py-4">
                <div className="aspect-video overflow-hidden rounded-md bg-gray-100">
                  {selectedItem.bannerImage ? (
                    <img
                      src={selectedItem.bannerImage}
                      alt={selectedItem.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <Image className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {renderItemDetails()}
              </div>
            </div>

            <DialogFooter className="flex-none mt-4">
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Trash size={16} /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleEditItem(selectedItem)}
                  >
                    <Edit size={16} /> Edit
                  </Button>
                  {selectedItem.status !== "active" && (
                    <Button
                      onClick={() => handlePublish(selectedItem.id)}
                      className="gap-2"
                    >
                      <Bell size={16} className="mr-1" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedItem?.type === "promotion" ? "Promotion" : "Public Event"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {selectedItem?.type === "promotion" ? "promotion" : "public event"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleDelete(selectedItem.id)}
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Promotions and Events */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>
              {createType === "promotion" ? "Edit Promotion" : "Edit Public Event"}
            </DialogTitle>
            <DialogDescription>
              {createType === "promotion" 
                ? "Update this promotional campaign" 
                : "Update this public event"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            <Tabs 
              defaultValue={createType} 
              value={createType} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="promotion" disabled={createType !== "promotion"}>Promotion</TabsTrigger>
                <TabsTrigger value="event" disabled={createType !== "event"}>Public Event</TabsTrigger>
              </TabsList>

              <TabsContent value="promotion" className="mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-title" className="text-sm font-medium">
                      Title*
                    </label>
                    <Input
                      id="edit-promo-title"
                      placeholder="Enter promotion title"
                      value={editingPromotion.title}
                      onChange={(e) => setEditingPromotion({ ...editingPromotion, title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-description" className="text-sm font-medium">
                      Description*
                    </label>
                    <Textarea
                      id="edit-promo-description"
                      placeholder="Enter promotion description"
                      value={editingPromotion.description}
                      onChange={(e) => setEditingPromotion({ ...editingPromotion, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-valid-until" className="text-sm font-medium">
                      Valid Until*
                    </label>
                    <Input
                      id="edit-promo-valid-until"
                      type="date"
                      value={editingPromotion.validUntil}
                      onChange={(e) => setEditingPromotion({ ...editingPromotion, validUntil: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-code" className="text-sm font-medium">
                      Promo Code (Optional)
                    </label>
                    <Input
                      id="edit-promo-code"
                      placeholder="Enter promo code (e.g., SUMMER25)"
                      value={editingPromotion.promoCode}
                      onChange={(e) => setEditingPromotion({ ...editingPromotion, promoCode: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Leave empty if no promo code is needed
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-terms" className="text-sm font-medium">
                      Terms & Conditions (Optional)
                    </label>
                    <Textarea
                      id="edit-promo-terms"
                      placeholder="Enter terms & conditions (one per line)"
                      value={editingPromotion.terms?.join('\n') || ''}
                      onChange={(e) => setEditingPromotion({ 
                        ...editingPromotion, 
                        terms: e.target.value.split('\n').filter(term => term.trim() !== '') 
                      })}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      Enter each term on a new line. Leave empty if not applicable.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Upload Banner Image</label>
                    <div 
                      className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50"
                      onClick={() => document.getElementById("edit-promotion-banner-upload")?.click()}
                    >
                      <Input
                        id="edit-promotion-banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const imageUrl = URL.createObjectURL(file);
                            setEditingPromotion({
                              ...editingPromotion,
                              bannerImage: imageUrl,
                            });
                            toast.success("Banner image uploaded successfully");
                          }
                        }}
                      />
                      <div className="flex flex-col items-center">
                        {editingPromotion.bannerImage ? (
                          <div className="relative w-full h-24 mb-2">
                            <img 
                              src={editingPromotion.bannerImage} 
                              alt="Promotion Banner Preview" 
                              className="h-full mx-auto object-contain" 
                            />
                          </div>
                        ) : (
                          <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {editingPromotion.bannerImage ? "Change image" : "Click to upload banner image"}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WebP (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-promo-status" className="text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={editingPromotion.status}
                      onValueChange={(value) => setEditingPromotion({ ...editingPromotion, status: value })}
                    >
                      <SelectTrigger id="edit-promo-status">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="event" className="mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-event-title" className="text-sm font-medium">
                      Title*
                    </label>
                    <Input
                      id="edit-event-title"
                      placeholder="Enter event title"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-event-description" className="text-sm font-medium">
                      Description*
                    </label>
                    <Textarea
                      id="edit-event-description"
                      placeholder="Enter event description"
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-event-location" className="text-sm font-medium">
                      Location*
                    </label>
                    <Input
                      id="edit-event-location"
                      placeholder="Enter event location"
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-event-date" className="text-sm font-medium">
                      Event Date*
                    </label>
                    <Input
                      id="edit-event-date"
                      type="date"
                      value={editingEvent.eventDate}
                      onChange={(e) => setEditingEvent({ ...editingEvent, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Upload Banner Image</label>
                    <div 
                      className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:bg-gray-50"
                      onClick={() => document.getElementById("edit-event-banner-upload")?.click()}
                    >
                      <Input
                        id="edit-event-banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const imageUrl = URL.createObjectURL(file);
                            setEditingEvent({
                              ...editingEvent,
                              bannerImage: imageUrl,
                            });
                            toast.success("Banner image uploaded successfully");
                          }
                        }}
                      />
                      <div className="flex flex-col items-center">
                        {editingEvent.bannerImage ? (
                          <div className="relative w-full h-24 mb-2">
                            <img 
                              src={editingEvent.bannerImage} 
                              alt="Event Banner Preview" 
                              className="h-full mx-auto object-contain" 
                            />
                          </div>
                        ) : (
                          <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {editingEvent.bannerImage ? "Change image" : "Click to upload banner image"}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WebP (max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="edit-event-status" className="text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={editingEvent.status}
                      onValueChange={(value) => setEditingEvent({ ...editingEvent, status: value })}
                    >
                      <SelectTrigger id="edit-event-status">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-none mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>
              Update {createType === "promotion" ? "Promotion" : "Public Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsManager;
