import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, Send, Phone, Video, MoreVertical, PaperclipIcon, SmileIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock chat contacts data
const mockContacts = [
  {
    id: 1,
    name: "Event Planner Pro",
    lastMessage: "Your event details have been updated.",
    time: "10:30 AM",
    unread: 2,
    avatar: "https://ui-avatars.com/api/?name=Event+Planner&background=random",
    online: true,
  },
  {
    id: 2,
    name: "DJ Services Ltd",
    lastMessage: "Looking forward to your event!",
    time: "Yesterday",
    unread: 0,
    avatar: "https://ui-avatars.com/api/?name=DJ+Services&background=random",
    online: false,
  },
  {
    id: 3,
    name: "Photography Services",
    lastMessage: "We've sent you the photo package options.",
    time: "2 days ago",
    unread: 0,
    avatar: "https://ui-avatars.com/api/?name=Photography+Services&background=random",
    online: true,
  },
  {
    id: 4,
    name: "Catering Delights",
    lastMessage: "Do you have any dietary requirements?",
    time: "3 days ago",
    unread: 1,
    avatar: "https://ui-avatars.com/api/?name=Catering+Delights&background=random",
    online: false,
  },
  {
    id: 5,
    name: "Venue Support",
    lastMessage: "The venue is confirmed for your date.",
    time: "1 week ago",
    unread: 0,
    avatar: "https://ui-avatars.com/api/?name=Venue+Support&background=random",
    online: true,
  }
];

// Mock messages data for the selected contact
const mockMessages = [
  {
    id: 1,
    senderId: 1,
    text: "Hi there! How can I help you with your upcoming event?",
    time: "10:15 AM",
    status: "read",
  },
  {
    id: 2,
    senderId: "user",
    text: "Hi! I'm just checking on the details for my event next month.",
    time: "10:18 AM",
    status: "read",
  },
  {
    id: 3,
    senderId: 1,
    text: "Of course! Your wedding reception is scheduled for May 15th at Riverside Gardens. We have everything set up according to your requirements.",
    time: "10:20 AM",
    status: "read",
  },
  {
    id: 4,
    senderId: "user",
    text: "Great! Will there be a chance to visit the venue before the event?",
    time: "10:22 AM",
    status: "read",
  },
  {
    id: 5,
    senderId: 1,
    text: "Absolutely! We can arrange a site visit anytime next week. Would Wednesday at 2 PM work for you?",
    time: "10:25 AM",
    status: "read",
  },
  {
    id: 6,
    senderId: "user",
    text: "Wednesday works perfectly. I'll make sure to be there on time.",
    time: "10:28 AM",
    status: "read",
  },
  {
    id: 7,
    senderId: 1,
    text: "Your event details have been updated. Looking forward to seeing you on Wednesday!",
    time: "10:30 AM",
    status: "delivered",
  }
];

export const ChatTab = () => {
  const [contacts, setContacts] = useState(mockContacts);
  const [search, setSearch] = useState("");
  const [activeContactId, setActiveContactId] = useState(mockContacts[0].id);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter contacts based on search input
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get the active contact
  const activeContact = contacts.find(contact => contact.id === activeContactId);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      senderId: "user",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Simulate a response after 1 second
    setTimeout(() => {
      const responseMsg = {
        id: messages.length + 2,
        senderId: activeContactId,
        text: "Thanks for your message! I'll get back to you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
      };
      setMessages(prevMessages => [...prevMessages, responseMsg]);
    }, 1000);
  };

  // Mark messages as read when changing contacts
  const handleContactChange = (contactId: number) => {
    setActiveContactId(contactId);
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId ? { ...contact, unread: 0 } : contact
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[70vh]">
      {/* Contacts sidebar */}
      <Card className="w-full lg:w-1/3 flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Messages</CardTitle>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <Tabs defaultValue="all" className="px-4 mb-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pr-4">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeContactId === contact.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleContactChange(contact.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium truncate">{contact.name}</h4>
                      <span className="text-xs text-muted-foreground">{contact.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      {contact.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat area */}
      <Card className="w-full lg:w-2/3 flex flex-col h-full">
        {activeContact && (
          <>
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                    <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeContact.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeContact.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.senderId !== "user" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                        <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-lg ${
                        message.senderId === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-secondary text-primary"
                      }`}
                    >
                      <p>{message.text}</p>
                      <div
                        className={`text-xs mt-1 flex justify-end ${
                          message.senderId === "user" ? "text-blue-100" : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="border-t p-4">
              <div className="flex items-center w-full space-x-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="shrink-0">
                  <SmileIcon className="h-5 w-5" />
                </Button>
                <Button className="shrink-0" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};