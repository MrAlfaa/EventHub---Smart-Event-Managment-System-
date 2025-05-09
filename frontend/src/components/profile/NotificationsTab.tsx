import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, Settings, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: "Booking Confirmed",
    message: "Your booking with Event Planner Pro has been confirmed for May 15, 2025.",
    time: "2 hours ago",
    isRead: false,
    type: "booking"
  },
  {
    id: 2,
    title: "New Message",
    message: "You've received a new message from DJ Services Ltd regarding your upcoming event.",
    time: "Yesterday",
    isRead: true,
    type: "message"
  },
  {
    id: 3,
    title: "Payment Received",
    message: "Payment of $350 for Photography Services has been processed successfully.",
    time: "2 days ago",
    isRead: false,
    type: "payment"
  },
  {
    id: 4,
    title: "Booking Reminder",
    message: "Reminder: Your booking with Catering Delights is scheduled for tomorrow at 10:00 AM.",
    time: "3 days ago",
    isRead: true,
    type: "booking"
  },
  {
    id: 5,
    title: "Special Offer",
    message: "Limited time offer: 20% off on all event decoration services this weekend!",
    time: "5 days ago",
    isRead: true,
    type: "promotion"
  }
];

export const NotificationsTab = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationFilter, setNotificationFilter] = useState("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === "all") return true;
    if (notificationFilter === "unread") return !notification.isRead;
    return notification.type === notificationFilter;
  });

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking": return "bg-blue-500";
      case "message": return "bg-green-500";
      case "payment": return "bg-purple-500";
      case "promotion": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications 
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500" variant="secondary">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs sm:text-sm"
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="text-xs sm:text-sm"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear all
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="all" onValueChange={setNotificationFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="booking">Bookings</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="promotion">Promotions</TabsTrigger>
            </TabsList>

            <TabsContent value={notificationFilter}>
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg transition-colors ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`${getNotificationTypeColor(notification.type)} h-3 w-3 rounded-full mr-3`} />
                          <h4 className="font-semibold">{notification.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    You don't have any {notificationFilter !== "all" ? notificationFilter : ""} notifications at this time.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive push notifications on your device</p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-500">Receive important updates via SMS</p>
              </div>
              <Switch id="sms-notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Marketing Communications</h4>
                <p className="text-sm text-gray-500">Receive offers and promotions</p>
              </div>
              <Switch id="marketing-notifications" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};