import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, Send, Phone, Video, MoreVertical, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import chatService, { ChatMessage, ChatConversation } from "@/services/chatService";
import { toast } from "sonner";

export const ChatTab = () => {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<ChatConversation[]>([]);
  const [search, setSearch] = useState("");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const conversations = await chatService.getConversations();
        setContacts(conversations);
        
        // Set active contact to first conversation if available
        if (conversations.length > 0 && !activeContactId) {
          setActiveContactId(conversations[0].contact_id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    // Set up polling for new messages every 10 seconds
    const intervalId = setInterval(fetchConversations, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch messages when active contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContactId) return;
      
      try {
        const messageData = await chatService.getMessages(activeContactId);
        setMessages(messageData);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [activeContactId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter contacts based on search input
  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    (contact.contact_business_name && 
     contact.contact_business_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Get the active contact
  const activeContact = contacts.find(contact => contact.contact_id === activeContactId);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContactId || !user) return;
    
    try {
      const sentMessage = await chatService.sendMessage(activeContactId, newMessage);
      
      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // Update the conversation in the contacts list
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.contact_id === activeContactId 
            ? {
                ...contact,
                last_message: newMessage,
                last_message_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } 
            : contact
        )
      );
      
      // Clear the input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Mark messages as read when changing contacts
  const handleContactChange = (contactId: string) => {
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
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading conversations...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeContactId === contact.contact_id ? 'bg-secondary' : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => handleContactChange(contact.contact_id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.contact_profile_image} alt={contact.contact_name} />
                        <AvatarFallback>{contact.contact_name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className={`font-medium truncate ${contact.unread_count > 0 ? 'text-black' : 'text-gray-700'}`}>
                          {contact.contact_business_name || contact.contact_name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatConversationTime(contact.last_message_time)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate w-40 ${contact.unread_count > 0 ? 'font-medium text-black' : 'text-muted-foreground'}`}>
                          {contact.last_message}
                        </p>
                        {contact.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat area */}
      <Card className="w-full lg:w-2/3 flex flex-col h-full">
        {activeContact ? (
          <>
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={activeContact.contact_profile_image} alt={activeContact.contact_name} />
                    <AvatarFallback>{activeContact.contact_name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {activeContact.contact_business_name || activeContact.contact_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activeContact.contact_role === 'service_provider' ? 'Service Provider' : 'Customer'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender_id !== user?.id && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={activeContact.contact_profile_image} alt={activeContact.contact_name} />
                          <AvatarFallback>{activeContact.contact_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id 
                            ? "bg-blue-500 text-white"
                            : "bg-secondary text-primary"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 flex justify-end ${
                            message.sender_id === user?.id ? "text-blue-100" : "text-muted-foreground"
                          }`}
                        >
                          {formatMessageTime(message.sent_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t p-4">
              <div className="flex items-center w-full space-x-2">
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
                <Button className="shrink-0" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No conversation selected</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
