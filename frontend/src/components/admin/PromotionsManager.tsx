import { useState, useEffect } from "react";
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
  Image,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import adminService, { Promotion } from "@/services/adminService";
import { formatDate } from "@/utils/dateUtils";
import { PublicEvent } from "@/types";

// Define interfaces for both promotions and public events
type ContentItem = Promotion;

const PromotionsManager = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [contentType, setContentType] = useState<string>("promotion");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [createType, setCreateType] = useState<"promotion" | "event">("promotion");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Create new promotion state
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
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
  const [newEvent, setNewEvent] = useState<Partial<Promotion>>({
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
  const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion>>({
    type: "promotion",
    title: "",
    description: "",
    bannerImage: "",
    validUntil: "",
    publishedDate: "",
    status: "draft",
  });
  
  const [editingEvent, setEditingEvent] = useState<Partial<Promotion>>({
    type: "event",
    title: "",
    description: "",
    bannerImage: "",
    location: "",
    eventDate: "",
    publishedDate: "",
    status: "draft",
  });

  // File upload states
  const [promotionBannerFile, setPromotionBannerFile] = useState<File | null>(null);
  const [eventBannerFile, setEventBannerFile] = useState<File | null>(null);

  // Fetch promotions and events on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const promotions = await adminService.getAllPromotions();
      setItems(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions and events");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddItem = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      if (createType === "promotion") {
        // Validate promotion fields
        if (!newPromotion.title || !newPromotion.description || !newPromotion.validUntil) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Add promotion fields to formData
        formData.append("type", "promotion");
        formData.append("title", newPromotion.title || "");
        formData.append("description", newPromotion.description || "");
        formData.append("status", "draft");
        formData.append("validUntil", newPromotion.validUntil || "");
        
        if (newPromotion.promoCode) {
          formData.append("promoCode", newPromotion.promoCode);
        }
        
        if (newPromotion.terms && newPromotion.terms.length > 0) {
          formData.append("terms", newPromotion.terms.join('\n'));
        }
        
        // Add banner image if selected
        if (promotionBannerFile) {
          formData.append("bannerImage", promotionBannerFile);
        }
        
        // Send request to create promotion
        const createdPromotion = await adminService.createPromotion(formData);
        
        // Update state with new promotion
        setItems([...items, createdPromotion]);
        
        // Reset form state
        setNewPromotion({
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
        setPromotionBannerFile(null);
        
        toast.success("Promotion created successfully");
      } else {
        // Validate event fields
        if (!newEvent.title || !newEvent.description || !newEvent.location || !newEvent.eventDate) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Add event fields to formData
        formData.append("type", "event");
        formData.append("title", newEvent.title || "");
        formData.append("description", newEvent.description || "");
        formData.append("status", "draft");
        formData.append("location", newEvent.location || "");
        formData.append("eventDate", newEvent.eventDate || "");
        
        // Add banner image if selected
        if (eventBannerFile) {
          formData.append("bannerImage", eventBannerFile);
        }
        
        // Send request to create event
        const createdEvent = await adminService.createPromotion(formData);
        
        // Update state with new event
        setItems([...items, createdEvent]);
        
        // Reset form state
        setNewEvent({
          type: "event",
          title: "",
          description: "",
          bannerImage: "",
          location: "",
          eventDate: "",
          publishedDate: new Date().toISOString().split('T')[0],
          status: "draft",
        });
        setEventBannerFile(null);
        
        toast.success("Public Event created successfully");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item. Please try again.");
    } finally {
      setIsLoading(false);
      setIsCreateDialogOpen(false);
    }
  };

  const handlePublish = async (id: string) => {
    setIsLoading(true);
    try {
      await adminService.publishPromotion(id);
      
      // Update local state
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, status: "active" } : item
        )
      );
      
      setIsViewDialogOpen(false);
      toast.success("Item published successfully");
    } catch (error) {
      console.error("Error publishing item:", error);
      toast.error("Failed to publish item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await adminService.deletePromotion(id);
      
      // Update local state
      setItems(items.filter((item) => item.id !== id));
      
      setIsDeleteDialogOpen(false);
      setIsViewDialogOpen(false);
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      setEditingPromotion(item);
      setCreateType("promotion");
    } else {
      setEditingEvent(item);
      setCreateType("event");
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      if (createType === "promotion") {
        // Validate promotion fields
        if (!editingPromotion.title || !editingPromotion.description || !editingPromotion.validUntil) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Add promotion fields to formData
        formData.append("type", "promotion");
        formData.append("title", editingPromotion.title || "");
        formData.append("description", editingPromotion.description || "");
        formData.append("status", editingPromotion.status || "draft");
        formData.append("validUntil", editingPromotion.validUntil || "");
        
        if (editingPromotion.promoCode) {
          formData.append("promoCode", editingPromotion.promoCode);
        }
        
        if (editingPromotion.terms && editingPromotion.terms.length > 0) {
          formData.append("terms", editingPromotion.terms.join('\n'));
        }
        
        // Add banner image if selected
        if (promotionBannerFile) {
          formData.append("bannerImage", promotionBannerFile);
        }
        
        // Send request to update promotion
        const updatedPromotion = await adminService.updatePromotion(editingPromotion.id as string, formData);
        
        // Update state with updated promotion
        setItems(
          items.map((item) =>
            item.id === editingPromotion.id ? updatedPromotion : item
          )
        );
        
        setPromotionBannerFile(null);
        toast.success("Promotion updated successfully");
      } else {
        // Validate event fields
        if (!editingEvent.title || !editingEvent.description || !editingEvent.location || !editingEvent.eventDate) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Add event fields to formData
        formData.append("type", "event");
        formData.append("title", editingEvent.title || "");
        formData.append("description", editingEvent.description || "");
        formData.append("status", editingEvent.status || "draft");
        formData.append("location", editingEvent.location || "");
        formData.append("eventDate", editingEvent.eventDate || "");
        
        // Add banner image if selected
        if (eventBannerFile) {
          formData.append("bannerImage", eventBannerFile);
        }
        
        // Send request to update event
        const updatedEvent = await adminService.updatePromotion(editingEvent.id as string, formData);
        
        // Update state with updated event
        setItems(
          items.map((item) =>
            item.id === editingEvent.id ? updatedEvent : item
          )
        );
        
        setEventBannerFile(null);
        toast.success("Public Event updated successfully");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item. Please try again.");
    } finally {
      setIsLoading(false);
      setIsEditDialogOpen(false);
    }
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
              Published: {formatDate(selectedItem.publishedDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-orange-600">
            <Calendar className="h-4 w-4" />
            <span>Valid until: {selectedItem.validUntil ? formatDate(selectedItem.validUntil) : 'Not specified'}</span>
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
              Published: {formatDate(selectedItem.publishedDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-blue-600">
            <Calendar className="h-4 w-4" />
            <span>Event date: {selectedItem.eventDate ? formatDate(selectedItem.eventDate) : 'Not specified'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-emerald-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {typeof selectedItem.location === 'string' ? selectedItem.location : 
               (typeof selectedItem.location === 'object' && selectedItem.location ? 
                (selectedItem.location as any).address : 'Location not specified')}
            </span>
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
                  {isLoading ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <Loader className="h-8 w-8 animate-spin text-gray-400" />
                      <p className="mt-2 text-gray-500">Loading promotions...</p>
                    </div>
                  ) : filteredItems.filter(item => item.type === "promotion").length === 0 ? (
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
                                  <span>Valid until: {item.validUntil ? formatDate(item.validUntil) : 'Not specified'}</span>
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
                  {isLoading ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <Loader className="h-8 w-8 animate-spin text-gray-400" />
                      <p className="mt-2 text-gray-500">Loading public events...</p>
                    </div>
                  ) : filteredItems.filter(item => item.type === "event").length === 0 ? (
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
                                  <span>Event date: {item.eventDate ? formatDate(item.eventDate) : 'Not specified'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{item.location}</span>
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
                            setPromotionBannerFile(file);
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
                            setEventBannerFile(file);
                            const imageUrl = URL.createObjectURL(file);
                            setNewEvent({
                              ...newEvent,
                              bannerImage: imageUrl,
                            });
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
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {createType === "promotion" ? "Create Promotion" : "Create Public Event"}
                </>
              )}
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
                  disabled={isLoading}
                >
                  <Trash size={16} /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleEditItem(selectedItem)}
                    disabled={isLoading}
                  >
                    <Edit size={16} /> Edit
                  </Button>
                  {selectedItem.status !== "active" && (
                    <Button
                      onClick={() => handlePublish(selectedItem.id)}
                      className="gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Bell size={16} className="mr-1" />
                          Publish
                        </>
                      )}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleDelete(selectedItem.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash size={16} className="mr-2" />
                  Delete
                </>
              )}
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
                            setPromotionBannerFile(file);
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
                            setEventBannerFile(file);
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update {createType === "promotion" ? "Promotion" : "Public Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsManager;
