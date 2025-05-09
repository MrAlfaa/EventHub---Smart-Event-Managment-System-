import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useApp } from "@/providers/AppProvider";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LogIn, Menu as MenuIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store"; // Import the Zustand auth store

export function Navbar() {
  const { isAuthenticated, user, logout, cart } = useApp();
  const { logout: zustandLogout } = useAuthStore(); // Get the logout function from Zustand store
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if the user is a regular user (not admin or service provider)
  const isRegularUser = isAuthenticated && user?.role !== 'admin' && user?.role !== 'service_provider';

  const handleSignOut = () => {
    logout(); // Logout from AppProvider context
    zustandLogout(); // Logout from Zustand store to ensure localStorage is cleared
    toast.success("You have been signed out successfully");
    navigate("/");
  };

  const getUserProfilePath = () => {
    if (user?.role === 'service_provider') {
      // Always redirect service providers to their dashboard
      return '/provider/dashboard';
    } else if (user?.role === 'admin') {
      // Redirect admin users to admin dashboard
      return '/admin/dashboard';
    } else {
      // Regular users go to profile
      return '/profile';
    }
  };

  const getProfileDisplay = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user?.role === 'service_provider' ? 'SP' : 'U';
  };

  const navigateToProfile = () => {
    navigate(getUserProfilePath());
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4 md:gap-8 lg:gap-10">
          <Link to="/home" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-blue-800">EventHub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/home" className={navigationMenuTriggerStyle()}>
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/service-providers" className={navigationMenuTriggerStyle()}>
                  Service Providers
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/public-events" className={navigationMenuTriggerStyle()}>
                  Public Events
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/promotions" className={navigationMenuTriggerStyle()}>
                  Promotions
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className={navigationMenuTriggerStyle()}>
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className={navigationMenuTriggerStyle()}>
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Cart and Authentication */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button - Only shown for regular users */}
          {isRegularUser && (
            <Link to="/checkout">
              <Button variant="outline" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] sm:text-xs font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Desktop Authentication */}
          {isAuthenticated ? (
            <div className="hidden sm:block">
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full overflow-hidden h-8 w-8 sm:h-10 sm:w-10">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={user?.profileImage} />
                            <AvatarFallback className={user?.role === 'service_provider' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                              {getProfileDisplay()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View your profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">{user?.name || "My Account"}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <div onClick={() => navigateToProfile()}>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4">Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile User Icon - only shown when authenticated */}
          {isAuthenticated && (
            <div className="sm:hidden">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full overflow-hidden h-8 w-8"
                onClick={navigateToProfile}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className={user?.role === 'service_provider' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {getProfileDisplay()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="py-4">
                <Link 
                  to="/home" 
                  className="flex items-center space-x-2 mb-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl font-bold text-blue-800">EventHub</span>
                </Link>
                <div className="grid gap-4 py-4">
                  <Link 
                    to="/home" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/service-providers" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Service Providers
                  </Link>
                  <Link 
                    to="/public-events" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Public Events
                  </Link>
                  <Link 
                    to="/promotions" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Promotions
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-base sm:text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  
                  <div className="h-px bg-border my-2"></div>
                  
                  {!isAuthenticated ? (
                    <div className="grid gap-4">
                      <Link 
                        to="/login" 
                        className="flex items-center gap-2 text-base sm:text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="flex items-center gap-2 text-base sm:text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Register
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <Link
                        to={getUserProfilePath()}
                        className="flex items-center gap-2 text-base sm:text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        My Profile
                      </Link>
                      <button
                        className="flex items-center gap-2 text-base sm:text-lg font-medium text-left"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
