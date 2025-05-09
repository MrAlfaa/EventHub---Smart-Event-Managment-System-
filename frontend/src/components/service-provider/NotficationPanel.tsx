
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, CheckCircle2, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Notification {
  id: number;
  type: 'booking' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

export const NotificationPanel = ({ open, onOpenChange }: NotificationPanelProps) => {
  // In a real app, this would come from an API or context
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      description: 'You have a new booking request for Wedding Deluxe package.',
      time: '10 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      description: 'Customer John D. sent you a message regarding their booking.',
      time: '1 hour ago',
      isRead: false,
    },
    {
      id: 3,
      type: 'system',
      title: 'Profile Verification',
      description: 'Your profile has been verified by the admin.',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: 4,
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'A booking has been confirmed for Corporate Event package.',
      time: '2 days ago',
      isRead: true,
    },
  ]);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <User className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[320px] sm:w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all read</Button>
          </SheetTitle>
          <SheetDescription>
            Stay updated with your latest activities
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg transition-colors",
                  notification.isRead ? "bg-white" : "bg-blue-50"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className={cn(
                      "font-medium",
                      !notification.isRead && "font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-400 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {notification.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-3 text-sm font-medium">No notifications</p>
              <p className="mt-1 text-xs text-gray-500">You're all caught up!</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
