import React from "react";
import { useApp } from "@/providers/AppProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  User, 
  LayoutDashboard, 
  Package, 
  CalendarCheck, 
  ImageIcon, 
  Settings, 
  LogOut,
  CreditCard,
  Star,
  MessageSquare,
  Cloud,
  Home
} from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, setUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const visitHomePage = () => {
    navigate("/home");
  };

  const isActive = (path: string) => {
    return location.pathname === `/provider${path}`;
  };

  const menuItems = [
    { title: "Dashboard", path: "", icon: LayoutDashboard },
    { title: "Packages", path: "/packages", icon: Package },
    { title: "Bookings", path: "/bookings", icon: CalendarCheck },
    { title: "Profile", path: "/profile", icon: User },
    { title: "Gallery", path: "/gallery", icon: ImageIcon },
    { title: "Payment & Billing", path: "/payment", icon: CreditCard },
    { title: "Reviews", path: "/reviews", icon: Star },
    { title: "Notifications & Chat", path: "/notifications", icon: MessageSquare },
    { title: "Cloud Storage", path: "/cloud", icon: Cloud },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                SP
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-lg font-semibold">{user?.name || "Provider"}</h3>
                <p className="truncate text-xs text-gray-500">{user?.email || "provider@example.com"}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={`/provider${item.path}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <Button 
              variant="outline" 
              className="flex w-full items-center justify-start gap-2 mb-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" 
              onClick={visitHomePage}
            >
              <Home size={16} />
              <span>Visit Website Home</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex w-full items-center justify-start gap-2" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <header className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Provider Dashboard</h1>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
