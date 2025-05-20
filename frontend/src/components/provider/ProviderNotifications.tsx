import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  Search,
  Check,
  Calendar,
  CreditCard,
  AlertCircle,
  PackageOpen,
  Star,
  Clock,
  FileText,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import chatService, { ChatMessage, ChatConversation } from "@/services/chatService";
import notificationService from "@/services/notificationService";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const ProviderNotifications = () => {
  // Real chat state
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<ChatConversation[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Notification state
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [selectedNotificationData, setSelectedNotificationData] = useState<any>(null);

  // Fetch conversations on component mount and when active tab is messages
  useEffect(() => {
    if (activeTab === "messages") {
      const fetchConversations = async () => {
        try {
          setLoadingChats(true);
          const conversations = await chatService.getConversations();
          setContacts(conversations);
          
          // Set active contact to first conversation if available and none selected yet
          if (conversations.length > 0 && !activeContactId) {
            setActiveContactId(conversations[0].contact_id);
          }
        } catch (error) {
          console.error("Error fetching conversations:", error);
          toast.error("Failed to load conversations");
        } finally {
          setLoadingChats(false);
        }
      };

      fetchConversations();
      
      // Set up polling for new messages every 10 seconds
      const intervalId = setInterval(fetchConversations, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeTab, activeContactId]);

  // Fetch notifications when active tab is notifications
  useEffect(() => {
    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        try {
          setNotificationsLoading(true);
          const notificationData = await notificationService.getNotifications();
          setNotifications(notificationData);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          toast.error("Failed to load notifications");
        } finally {
          setNotificationsLoading(false);
        }
      };

      fetchNotifications();
      
      // Set up polling for new notifications every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  // Fetch messages when active contact changes
  useEffect(() => {
    if (!activeContactId || activeTab !== "messages") return;
    
    const fetchMessages = async () => {
      try {
        const messageData = await chatService.getMessages(activeContactId);
        setMessages(messageData);
        // Scroll to bottom of messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [activeContactId, activeTab]);

  // Format message time
  const formatMessageTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format conversation time
  const formatConversationTime = (timeStr: string) => {
    if (!timeStr) return "";
    
    const date = new Date(timeStr);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Format time ago for notifications
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeContactId || !user) return;
    
    try {
      // Send the message using the chat service
      const sentMessage = await chatService.sendMessage(activeContactId, messageText);
      
      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // Update the conversation in the contacts list
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.contact_id === activeContactId 
            ? {
                ...contact,
                last_message: messageText,
                last_message_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } 
            : contact
        )
      );
      
      // Clear the input
      setMessageText("");
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Get unread message count
  const getUnreadMessageCount = () => {
    return contacts.reduce((sum, contact) => sum + contact.unread_count, 0);
  };
  
  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setActiveContactId(contactId);
    
    // Update the unread count for this contact
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.contact_id === contactId 
          ? { ...contact, unread_count: 0 } 
          : contact
      )
    );
  };

  // Notification functions
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({
          ...notif,
          is_read: true
        }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Mark this notification as read in the API
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      // Find the notification in the array
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        setSelectedNotification(notificationId);
        setSelectedNotificationData(notification);
        setNotificationDialogOpen(true);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(notif => !notif.is_read).length;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'package':
        return <PackageOpen className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'event_reminder':
        return <Clock className="h-4 w-4" />;
      case 'system':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification type class for styling
  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case "booking": return "bg-blue-50 border-blue-200";
      case "payment": return "bg-green-50 border-green-200";
      case "alert": return "bg-red-50 border-red-200";
      case "package": return "bg-purple-50 border-purple-200";
      case "review": return "bg-yellow-50 border-yellow-200";
      case "event_reminder": return "bg-indigo-50 border-indigo-200";
      case "system": return "bg-gray-50 border-gray-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  // Render notification detail component based on the received data
  const renderNotificationDetail = () => {
    if (!selectedNotificationData) return null;

    const { type, title, message, reference_id, reference_type, created_at } = selectedNotificationData;
    
    return (
      <div className={`p-6 rounded-lg border ${getNotificationTypeClass(type)}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-full ${
            type === 'booking' ? 'bg-blue-100 text-blue-600' :
            type === 'payment' ? 'bg-green-100 text-green-600' :
            type === 'alert' ? 'bg-red-100 text-red-600' :
            type === 'package' ? 'bg-purple-100 text-purple-600' :
            type === 'review' ? 'bg-yellow-100 text-yellow-600' :
            type === 'event_reminder' ? 'bg-indigo-100 text-indigo-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getNotificationIcon(type)}
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-gray-500">{formatTimeAgo(created_at)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="p-3 bg-white rounded border mt-1">{message}</p>
          </div>
          
          {reference_id && reference_type && (
            <div>
              <p className="text-sm text-gray-500">Reference</p>
              <p className="font-medium">{reference_type}: {reference_id}</p>
            </div>
          )}
          
          {/* Actions based on notification type */}
          {type === 'booking' && (
            <div className="flex gap-2 mt-4">
              <Button variant="default">View Booking</Button>
              <Button variant="outline">Message Customer</Button>
            </div>
          )}
          
          {/* Special actions for event reminders */}
          {type === 'event_reminder' && (
            <div className="flex gap-2 mt-4">
              <Button variant="default">View Event Details</Button>
              <Button variant="outline">Add to Calendar</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications & Chat</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
            {getUnreadMessageCount() > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {getUnreadMessageCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {getUnreadNotificationCount() > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {getUnreadNotificationCount()}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="pt-4">
          <div className="flex h-[600px] border rounded-lg overflow-hidden">
            {/* Chat list */}
            <div className="w-1/3 border-r">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="w-full pl-9"
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(600px-48px)]">
                {loadingChats ? (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="text-center px-4">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No conversations yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Messages from users will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  contacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${activeContactId === contact.contact_id ? 'bg-gray-100' : ''}`}
                      onClick={() => handleContactSelect(contact.contact_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={contact.contact_profile_image} alt={contact.contact_name} />
                              <AvatarFallback>{contact.contact_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className={`font-medium ${contact.unread_count ? 'text-black' : 'text-gray-700'}`}>
                              {contact.contact_name}
                            </p>
                            <p className={`text-xs truncate w-40 ${contact.unread_count ? 'font-medium text-black' : 'text-muted-foreground'}`}>
                              {contact.last_message}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatConversationTime(contact.last_message_time)}</p>
                          {contact.unread_count > 0 && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                              {contact.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat window */}
            <div className="w-2/3 flex flex-col">
              {activeContactId && contacts.length > 0 ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {activeContactId && (
                        <>
                          <Avatar>
                            <AvatarImage 
                              src={contacts.find(c => c.contact_id === activeContactId)?.contact_profile_image} 
                              alt={contacts.find(c => c.contact_id === activeContactId)?.contact_name} 
                            />
                            <AvatarFallback>
                              {contacts.find(c => c.contact_id === activeContactId)?.contact_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contacts.find(c => c.contact_id === activeContactId)?.contact_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {contacts.find(c => c.contact_id === activeContactId)?.contact_role === 'service_provider' 
                                ? 'Service Provider' 
                                : 'Customer'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center px-6">
                          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Start the conversation with this customer!
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === user?.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatMessageTime(message.sent_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message input */}
                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} className="px-3">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex justify-center items-center">
                  <div className="text-center px-6">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">No conversation selected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>You have {getUnreadNotificationCount()} unread notifications</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={getUnreadNotificationCount() === 0}
              >
                <Check className="mr-1 h-4 w-4" />
                Mark all as read
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                      notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                      notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                      notif.type === 'package' ? 'bg-purple-100 text-purple-600' :
                      notif.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      notif.type === 'event_reminder' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notif.is_read ? 'text-black' : 'text-gray-800'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(notif.created_at)}</p>
                      </div>
                      <p className={`text-sm mt-1 ${!notif.is_read ? 'text-black' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification Detail Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notification Details</span>
              <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center">
                <X className="h-4 w-4" />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          {renderNotificationDetail()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderNotifications;
