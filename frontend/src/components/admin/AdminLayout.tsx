import React, { useState } from "react";
import { useAuthStore } from "@/store";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  Package, 
  LogOut,
  CheckCircle,
  Video,
  Bell,
  Settings,
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
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/providers/AppProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout: zustandLogout } = useAuthStore();
  const { logout: appLogout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications] = useState(3); // This would come from a real notification system

  const handleLogout = () => {
    zustandLogout(); // Logout from Zustand store
    appLogout(); // Logout from AppProvider context
    toast.success("Logged out successfully");
    navigate("/");
  };

  const visitHomePage = () => {
    navigate("/home");
  };

  const isActive = (path: string) => {
    return location.pathname === `/admin/dashboard${path}`;
  };

  const menuItems = [
    { title: "Overview", path: "", icon: LayoutDashboard },
    { title: "Users", path: "/users", icon: Users, viewOnly: true },
    { title: "Service Providers", path: "/service-providers", icon: Briefcase, viewOnly: true },
    { title: "Provider Approvals", path: "/approvals", icon: CheckCircle },
    { title: "Payment Details", path: "/payment-details", icon: Package },
    { title: "Promotions & Advertisement", path: "/promotions", icon: Video },
    { title: "Service Types", path: "/service-types", icon: Settings },
    { 
      title: "Notifications", 
      path: "/notifications", 
      icon: Bell, 
      badge: unreadNotifications > 0 ? unreadNotifications : undefined 
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-600 text-white">
                AD
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-lg font-semibold">{user?.name || "Admin"}</h3>
                <p className="truncate text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
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
                    tooltip={`${item.title}${item.viewOnly ? ' (View Only)' : ''}`}
                  >
                    <Link to={`/admin/dashboard${item.path}`}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-blue-500" variant="secondary">
                          {item.badge}
                        </Badge>
                      )}
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
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
