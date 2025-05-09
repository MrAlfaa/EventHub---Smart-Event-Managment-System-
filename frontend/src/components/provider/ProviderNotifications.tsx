import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  FileText,
  X,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

// Detailed notification content for each notification type
const notificationDetails = {
  "notif-1": {
    title: "New Booking Request",
    subtitle: "Wedding Photography Package",
    customerName: "John Smith",
    customerEmail: "johnsmith@example.com",
    customerPhone: "+1 (555) 123-4567",
    date: "August 15, 2025",
    time: "2:00 PM - 10:00 PM",
    location: "Grand Ballroom, Hilton Hotel",
    message: "Hello, we are interested in booking your Premium Wedding Package for our wedding. We're expecting around 150 guests and would need full day coverage including ceremony, reception, and family portraits.",
    packagePrice: "$2,500.00",
    status: "Pending",
    actions: ["Accept", "Decline", "Message Customer"]
  },
  "notif-2": {
    title: "Payment Received",
    subtitle: "Corporate Event Package",
    customerName: "Tech Solutions Inc.",
    customerEmail: "events@techsolutions.com",
    customerPhone: "+1 (555) 987-6543",
    date: "April 23, 2025",
    time: "9:00 AM",
    amount: "$750.00",
    paymentMethod: "Credit Card (Visa **** 5678)",
    transactionId: "TXN-78952301",
    bookingId: "BKG-12345",
    status: "Completed"
  },
  "notif-3": {
    title: "Calendar Conflict",
    subtitle: "Two events scheduled for the same time",
    date: "May 12, 2025",
    time: "3:00 PM - 6:00 PM",
    conflictingEvents: [
      {
        name: "Corporate Team Building",
        client: "Acme Corporation",
        location: "Acme Headquarters"
      },
      {
        name: "Birthday Celebration",
        client: "Emma Wilson",
        location: "Sunset Restaurant"
      }
    ],
    recommendation: "Please reschedule one of these events to avoid double booking."
  },
  "notif-4": {
    title: "Package Updated",
    subtitle: "Deluxe Wedding Package",
    updateDetails: "Your package was approved by admin on April 21, 2025",
    priceBefore: "$2,000.00",
    priceAfter: "$2,200.00",
    visibility: "Public",
    packageID: "PKG-5678"
  },
  "notif-5": {
    title: "New Review",
    subtitle: "Birthday Celebration Package",
    customerName: "Sarah Williams",
    reviewDate: "April 20, 2025",
    rating: 5,
    reviewText: "EventHub provided an amazing service for my daughter's 16th birthday! The decorations were stunning, the food was excellent, and the staff was incredibly professional. They took care of everything, allowing me to enjoy the event without any stress. I highly recommend their Birthday Celebration Package to anyone planning a special event.",
    eventDate: "April 15, 2025",
    packageDetails: "Birthday Celebration Package (Basic)",
    packageID: "PKG-1234"
  },
  "notif-6": {
    title: "Terms Update",
    subtitle: "EventHub Platform Terms of Service",
    updateDate: "April 16, 2025",
    effectiveDate: "May 1, 2025",
    majorChanges: [
      "Updated payment processing terms",
      "New cancellation policy",
      "Changes to service provider requirements",
      "Updated privacy policy regarding user data"
    ],
    actionRequired: "Review and accept the new terms by April 30, 2025"
  }
};

const ProviderNotifications = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [activeChat, setActiveChat] = useState("chat-2");
  const [messageText, setMessageText] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // Sample data - would come from API in real implementation
  const initialNotifications = [
    {
      id: "notif-1",
      type: "booking",
      title: "New Booking Request",
      message: "John Smith has requested your Premium Wedding Package for August 15, 2025",
      time: "10 minutes ago",
      read: false,
      icon: Calendar
    },
    {
      id: "notif-2",
      type: "payment",
      title: "Payment Received",
      message: "You received a payment of $750.00 for Corporate Event Package",
      time: "2 hours ago",
      read: true,
      icon: CreditCard
    },
    {
      id: "notif-3",
      type: "alert",
      title: "Calendar Conflict",
      message: "You have overlapping events scheduled on May 12, 2025",
      time: "Yesterday",
      read: false,
      icon: AlertCircle
    },
    {
      id: "notif-4",
      type: "package",
      title: "Package Updated",
      message: "Your 'Deluxe Wedding Package' was approved by admin",
      time: "2 days ago",
      read: true,
      icon: PackageOpen
    },
    {
      id: "notif-5",
      type: "review",
      title: "New Review",
      message: "Sarah Williams left a 5-star review for your Birthday Celebration Package",
      time: "3 days ago",
      read: true,
      icon: Star
    },
    {
      id: "notif-6",
      type: "system",
      title: "Terms Update",
      message: "EventHub has updated its terms of service",
      time: "1 week ago",
      read: true,
      icon: FileText
    }
  ];

  // Store notifications in state so we can update them
  const [notifications, setNotifications] = useState(initialNotifications);

  const chats = [
    {
      id: "chat-1",
      name: "Emily Johnson",
      avatar: "/avatars/emily.jpg",
      lastMessage: "Can we discuss the flower arrangements for my wedding?",
      time: "10:45 AM",
      unread: 2,
      online: true
    },
    {
      id: "chat-2",
      name: "Michael Smith",
      avatar: "/avatars/michael.jpg",
      lastMessage: "Thanks for the quote! I'd like to proceed with booking.",
      time: "Yesterday",
      unread: 0,
      online: false
    },
    {
      id: "chat-3",
      name: "Sarah Williams",
      avatar: "/avatars/sarah.jpg",
      lastMessage: "The event was perfect! Thank you so much.",
      time: "Apr 15",
      unread: 0,
      online: true
    },
    {
      id: "chat-4",
      name: "David Lee",
      avatar: "/avatars/david.jpg",
      lastMessage: "Do you have availability for next month?",
      time: "Apr 12",
      unread: 1,
      online: false
    },
    {
      id: "chat-5",
      name: "EventHub Support",
      avatar: "/avatars/support.jpg",
      lastMessage: "Your account has been verified successfully.",
      time: "Apr 10",
      unread: 0,
      online: true
    }
  ];
  
  const messages = {
    "chat-1": [
      { id: 1, sender: "them", text: "Hello! I'm interested in your wedding services for August next year.", time: "10:30 AM" },
      { id: 2, sender: "me", text: "Hi Emily! Thanks for reaching out. I'd be happy to discuss our wedding packages for August 2026.", time: "10:32 AM" },
      { id: 3, sender: "them", text: "Great! We're looking for a complete package including catering, decoration, and photography.", time: "10:35 AM" },
      { id: 4, sender: "me", text: "We can definitely arrange that. Our Premium Wedding Package includes all those services. Would you like me to send you the detailed brochure?", time: "10:40 AM" },
      { id: 5, sender: "them", text: "Yes please! Also, can we discuss the flower arrangements for my wedding?", time: "10:45 AM" }
    ],
    "chat-2": [
      { id: 1, sender: "them", text: "Hi there! I'm planning a corporate event for about 100 people.", time: "Yesterday, 3:15 PM" },
      { id: 2, sender: "me", text: "Hello Michael! Thanks for considering our services. We have several corporate packages that would work well for 100 guests.", time: "Yesterday, 3:20 PM" },
      { id: 3, sender: "them", text: "Could you send me a quote for your standard package with additional AV equipment?", time: "Yesterday, 3:25 PM" },
      { id: 4, sender: "me", text: "Absolutely! I've prepared a quote based on your requirements. The total comes to $4,500 including the additional AV setup you requested.", time: "Yesterday, 4:00 PM" },
      { id: 5, sender: "them", text: "Thanks for the quote! I'd like to proceed with booking.", time: "Yesterday, 4:30 PM" }
    ],
    "chat-3": [
      { id: 1, sender: "me", text: "Hello Sarah! Looking forward to hosting your birthday celebration this weekend.", time: "Apr 14, 9:00 AM" },
      { id: 2, sender: "them", text: "Hi! I'm excited too. Just wanted to confirm that everything is set for Saturday?", time: "Apr 14, 9:15 AM" },
      { id: 3, sender: "me", text: "Yes, everything is confirmed! We'll have the venue ready by 6 PM as discussed.", time: "Apr 14, 9:20 AM" },
      { id: 4, sender: "them", text: "Perfect, thank you!", time: "Apr 14, 9:22 AM" },
      { id: 5, sender: "them", text: "The event was perfect! Thank you so much.", time: "Apr 15, 11:30 AM" }
    ],
    "chat-4": [
      { id: 1, sender: "them", text: "Hello, I'm interested in your services for a corporate event.", time: "Apr 12, 2:00 PM" },
      { id: 2, sender: "me", text: "Hi David! I'd be happy to help with your corporate event. Could you provide some details about what you're looking for?", time: "Apr 12, 2:15 PM" },
      { id: 3, sender: "them", text: "We need a venue for a team-building event, around 50 people.", time: "Apr 12, 2:20 PM" },
      { id: 4, sender: "them", text: "Do you have availability for next month?", time: "Apr 12, 2:21 PM" }
    ],
    "chat-5": [
      { id: 1, sender: "them", text: "Welcome to EventHub! We're reviewing your service provider application.", time: "Apr 9, 10:00 AM" },
      { id: 2, sender: "them", text: "Your account has been verified successfully.", time: "Apr 10, 9:00 AM" }
    ]
  };
  
  const sendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, you would send this to an API
    console.log(`Sending message to ${activeChat}: ${messageText}`);
    setMessageText("");
  };
  
  const markAllAsRead = () => {
    // Update all notifications to be marked as read
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    toast.success("All notifications marked as read");
  };

  const handleNotificationClick = (notificationId: string) => {
    // Mark this notification as read
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    
    setNotifications(updatedNotifications);
    setSelectedNotification(notificationId);
    setNotificationDialogOpen(true);
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const getUnreadMessageCount = () => {
    return chats.reduce((sum, chat) => sum + chat.unread, 0);
  };
  
  const getNotificationIcon = (IconComponent) => {
    return <IconComponent className="h-4 w-4" />;
  };

  // Function to render the detailed content based on notification type
  const renderNotificationDetail = (notificationId: string) => {
    const details = notificationDetails[notificationId as keyof typeof notificationDetails];
    const notification = notifications.find(n => n.id === notificationId);
    if (!details || !notification) return null;

    const getNotificationTypeClass = (type: string) => {
      switch (type) {
        case "booking": return "bg-blue-50 border-blue-200";
        case "payment": return "bg-green-50 border-green-200";
        case "alert": return "bg-red-50 border-red-200";
        case "package": return "bg-purple-50 border-purple-200";
        case "review": return "bg-yellow-50 border-yellow-200";
        case "system": return "bg-gray-50 border-gray-200";
        default: return "bg-gray-50 border-gray-200";
      }
    };

    return (
      <div className={`p-6 rounded-lg border ${getNotificationTypeClass(notification.type)}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-full ${
            notification.type === 'booking' ? 'bg-blue-100 text-blue-600' :
            notification.type === 'payment' ? 'bg-green-100 text-green-600' :
            notification.type === 'alert' ? 'bg-red-100 text-red-600' :
            notification.type === 'package' ? 'bg-purple-100 text-purple-600' :
            notification.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <notification.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{details.title}</h3>
            <p className="text-gray-500">{details.subtitle}</p>
          </div>
        </div>

        {notification.type === "booking" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                { 'customerName' in details && (
                  <p className="font-medium">{details.customerName}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                { 'customerEmail' in details && (
                  <p className="font-medium">{details.customerEmail}</p>
                )}
                { 'customerPhone' in details && (
                  <p className="font-medium">{details.customerPhone}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                { 'date' in details && <p className="font-medium">{details.date}</p> }
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{details.time}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{details.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Message from customer</p>
              <p className="p-3 bg-white rounded border mt-1">{details.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Package Price</p>
                <p className="font-medium">{details.packagePrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">{details.status}</Badge>
              </div>
            </div>
          </div>
        )}

        {notification.type === "payment" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{details.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{details.customerEmail}</p>
                <p className="font-medium">{details.customerPhone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="font-medium">{details.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{details.time}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-bold text-green-600 text-lg">{details.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{details.paymentMethod}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium">{details.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-medium">{details.bookingId}</p>
              </div>
            </div>
          </div>
        )}

        {notification.type === "alert" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{details.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{details.time}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Conflicting Events</p>
              <div className="mt-2 space-y-3">
                {details.conflictingEvents?.map((event, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-gray-500">Client: {event.client}</p>
                    <p className="text-sm text-gray-500">Location: {event.location}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="font-medium text-red-600">{details.recommendation}</p>
            </div>
          </div>
        )}

        {notification.type === "review" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{details.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Review Date</p>
                <p className="font-medium">{details.reviewDate}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < details.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 font-bold">{details.rating}/5</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Review</p>
              <p className="p-3 bg-white rounded border mt-1">{details.reviewText}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium">{details.eventDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-medium">{details.packageDetails}</p>
              </div>
            </div>
          </div>
        )}

        {notification.type === "package" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Update Details</p>
              <p className="font-medium">{details.updateDetails}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Price Before</p>
                <p className="font-medium">{details.priceBefore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price After</p>
                <p className="font-medium text-green-600">{details.priceAfter}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visibility</p>
                <p className="font-medium">{details.visibility}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Package ID</p>
                <p className="font-medium">{details.packageID}</p>
              </div>
            </div>
          </div>
        )}

        {notification.type === "system" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Update Date</p>
                <p className="font-medium">{details.updateDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Effective Date</p>
                <p className="font-medium">{details.effectiveDate}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Major Changes</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {details.majorChanges?.map((change, index) => (
                  <li key={index} className="text-sm">{change}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="font-medium text-yellow-700">{details.actionRequired}</p>
            </div>
          </div>
        )}
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
                <Input 
                  placeholder="Search conversations..." 
                  className="w-full"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
              <div className="overflow-y-auto h-[calc(600px-48px)]">
                {chats.map(chat => (
                  <div 
                    key={chat.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${activeChat === chat.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback>{chat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${chat.unread ? 'text-black' : 'text-gray-700'}`}>{chat.name}</p>
                          <p className={`text-xs truncate w-40 ${chat.unread ? 'font-medium text-black' : 'text-muted-foreground'}`}>
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{chat.time}</p>
                        {chat.unread > 0 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat window */}
            <div className="w-2/3 flex flex-col">
              {/* Chat header */}
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeChat && (
                    <>
                      <Avatar>
                        <AvatarImage 
                          src={chats.find(c => c.id === activeChat)?.avatar} 
                          alt={chats.find(c => c.id === activeChat)?.name} 
                        />
                        <AvatarFallback>
                          {chats.find(c => c.id === activeChat)?.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{chats.find(c => c.id === activeChat)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {chats.find(c => c.id === activeChat)?.online ? 'Online' : 'Offline'}
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
                {activeChat && messages[activeChat]?.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'me' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message input */}
              <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="px-3">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`flex items-start p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <div className={`p-2 rounded-full mr-3 ${
                    notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                    notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                    notif.type === 'package' ? 'bg-purple-100 text-purple-600' :
                    notif.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getNotificationIcon(notif.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${!notif.read ? 'text-black' : 'text-gray-800'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                    <p className={`text-sm mt-1 ${!notif.read ? 'text-black' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
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
          
          {selectedNotification && renderNotificationDetail(selectedNotification)}
          
          {/* Removed booking action buttons */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderNotifications;