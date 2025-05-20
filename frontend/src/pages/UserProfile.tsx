import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/providers/AppProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Heart, Star, Clock, ShoppingCart, Settings, Bell, MessageSquare } from "lucide-react";

// Importing our refactored components
import { PersonalInfoTab } from "@/components/profile/PersonalInfoTab";
import { BookingsTab } from "@/components/profile/BookingsTab";
import { ReviewsTab } from "@/components/profile/ReviewsTab";
import { NotificationsTab } from "@/components/profile/NotificationsTab";
import { ChatTab } from "@/components/profile/ChatTab";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

// Importing mock data
import {
  mockUserData,
  mockBookings,
  mockFavorites,
  mockReviews,
  UserData
} from "@/data/profileData";

// Dashboard component for the profile page
const DashboardTab = ({ userData, bookings, favorites, reviews, setActiveTab }: { 
  userData: UserData, 
  bookings: any[], 
  favorites: any[], 
  reviews: any[],
  setActiveTab: (tab: string) => void 
}) => {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Bookings", value: bookings.length, icon: Calendar, color: "bg-blue-500" },
    { title: "Favorites", value: favorites.length, icon: Heart, color: "bg-pink-500" },
    { title: "Reviews Given", value: reviews.length, icon: Star, color: "bg-amber-500" },
    { title: "Active Bookings", value: bookings.filter(b => b.status === 'upcoming').length, icon: Clock, color: "bg-green-500" },
  ];

  const quickLinks = [
    { title: "Browse Services", icon: ShoppingCart, action: () => navigate('/service-providers') },
    { title: "View Bookings", icon: Calendar, action: () => setActiveTab("bookings") },
  ];

  const recentActivity = bookings.slice(0, 2);

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {userData.name}!</h2>
      
      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-1 sm:p-2 rounded-md`}>
                <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 sm:p-6 pt-0 sm:pt-0">
            {quickLinks.map((link, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="justify-start text-xs sm:text-sm"
                onClick={link.action}
              >
                <link.icon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {link.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="pr-2">
                      <p className="font-medium text-xs sm:text-sm">{booking.providerName}</p>
                      <div className="text-xs text-muted-foreground">{booking.date}</div>
                    </div>
                    <div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="p-0 mt-2 text-xs sm:text-sm" onClick={() => setActiveTab("bookings")}>
                  View all bookings
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs sm:text-sm">No recent bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { isAuthenticated, user } = useApp();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>(mockUserData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  useEffect(() => {
    // Check authentication and redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error("Please login to view your profile");
      navigate("/login");
      return;
    }
    
    // Load the user data
    setLoading(true);
    
    // In a real app, you would fetch user data from an API here
    // For now, we'll use the user data from the context and merge with mock data
    if (user) {
      setUserData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
      }));
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 500); // Simulate loading delay
  }, [isAuthenticated, user, navigate]);

  const navigateToCloudSpace = () => {
    navigate("/cloud-space");
    // This is a placeholder - in a real app, you'd navigate to the user's cloud storage
    toast.info("Cloud space feature coming soon");
  };

  // If loading, show a loading spinner
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated, show login prompt (keeping this for graceful UI)
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="mb-6 text-2xl sm:text-3xl font-bold">Profile</h1>
          <p className="mb-6 text-base sm:text-lg">Please login to view your profile.</p>
          <Button asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </Layout>
    );
  }

  // Render content for authenticated users
  return (
    <Layout>
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <ProfileHeader navigateToCloudSpace={navigateToCloudSpace} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 sm:mb-6 h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger value="dashboard" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <BookOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger id="personal-tab" value="personal" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <Settings className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger id="bookings-tab" value="bookings" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="reviews" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="notifications" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <Bell className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="chat" className="py-2 px-2 sm:px-4 text-xs sm:text-sm flex items-center">
                <MessageSquare className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Messages
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard">
            <DashboardTab 
              userData={userData}
              bookings={mockBookings}
              favorites={mockFavorites}
              reviews={mockReviews}
              setActiveTab={setActiveTab}
            />
          </TabsContent>
          
          <TabsContent value="personal">
            <PersonalInfoTab userData={userData} setUserData={setUserData} />
          </TabsContent>
          
          <TabsContent value="bookings">
            <BookingsTab bookings={mockBookings} />
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
