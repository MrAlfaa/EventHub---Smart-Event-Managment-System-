
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  Clock, 
  User, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare,
  Trash
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'user' | 'provider' | 'system' | 'message';
  title: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "message",
    title: "New Support Message",
    content: "I'm having trouble with my booking, can you help?",
    sender: "John Smith",
    timestamp: "2025-04-17T08:30:00",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "provider",
    title: "New Provider Registration",
    content: "Sunset Caterers has registered as a new service provider.",
    sender: "System",
    timestamp: "2025-04-17T07:15:00",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "user",
    title: "New User Registration",
    content: "Sarah Johnson has created a new account.",
    sender: "System",
    timestamp: "2025-04-16T16:45:00",
    isRead: true,
  },
  {
    id: "notif-4",
    type: "system",
    title: "System Update",
    content: "System maintenance scheduled for tonight at 2 AM.",
    sender: "System",
    timestamp: "2025-04-16T14:20:00",
    isRead: true,
  },
  {
    id: "notif-5",
    type: "message",
    title: "Service Provider Question",
    content: "How do I update my package pricing?",
    sender: "Golden Events",
    timestamp: "2025-04-16T11:05:00",
    isRead: true,
  }
];

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredNotifications = notifications.filter((notif) => {
    // Filter by tab/type
    if (activeTab !== "all" && notif.type !== activeTab) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(query) ||
        notif.content.toLowerCase().includes(query) ||
        notif.sender.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    toast.success("All notifications marked as read");
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
    toast.success("Notification deleted");
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'provider':
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search notifications..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-blue-500" variant="secondary">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="user">Users</TabsTrigger>
          <TabsTrigger value="provider">Providers</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>
                {activeTab === "all" && "All Notifications"}
                {activeTab === "message" && "Message Notifications"}
                {activeTab === "user" && "User Notifications"}
                {activeTab === "provider" && "Provider Notifications"}
                {activeTab === "system" && "System Notifications"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="mt-3 text-sm font-medium">No notifications</p>
                  <p className="mt-1 text-xs text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-4 rounded-lg transition-colors ${
                        notification.isRead ? "bg-white" : "bg-blue-50"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {notification.content}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <span className="font-medium mr-2">{notification.sender}</span>
                              <Clock className="h-3 w-3 mr-1 inline" />
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            {!notification.isRead && (
                              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
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
    </div>
  );
};

export default AdminNotifications;
