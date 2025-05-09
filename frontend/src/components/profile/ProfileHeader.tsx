import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/providers/AppProvider";

interface ProfileHeaderProps {
  navigateToCloudSpace: () => void;
}

export const ProfileHeader = ({ navigateToCloudSpace }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { logout: zustandLogout } = useAuthStore();
  const { logout: appLogout } = useApp();
  
  const handleSignOut = () => {
    zustandLogout(); // Logout from Zustand store
    appLogout(); // Logout from AppProvider context
    toast.success("You have been signed out successfully");
    navigate("/");
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
          size="sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="mb-0 text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">My Profile</h1>
      </div>
      
      {/* Desktop buttons - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={navigateToCloudSpace}
          className="flex items-center gap-2"
        >
          <Cloud size={16} />
          Cloud Space
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      {/* Mobile dropdown menu - visible only on small screens */}
      <div className="sm:hidden w-full flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu size={16} />
              <span className="ml-2">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={navigateToCloudSpace}>
              <Cloud size={16} className="mr-2" />
              Cloud Space
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
