import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'user' | 'service_provider' | 'admin' | 'any';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated: appIsAuthenticated, user: appUser } = useApp();
  const { isAuthenticated: storeIsAuthenticated, isAdmin: storeIsAdmin, user: storeUser } = useAuthStore();
  
  // Check auth status from both systems
  const isAuthenticated = appIsAuthenticated || storeIsAuthenticated;
  
  // Merge user information, prioritizing store user
  const user = storeUser || appUser;
  
  // Special check for admin role
  const isAdmin = storeIsAdmin || (user?.role === 'admin');
  
  // If not authenticated in either system
  if (!isAuthenticated) {
    toast.error("Please log in to continue");
    return <Navigate to="/login" replace />;
  }
  
  // Allow any authenticated user if requiredRole is 'any'
  if (requiredRole === 'any') {
    return <>{children}</>;
  }
  
  // Special handling for admin routes
  if (requiredRole === 'admin') {
    if (!isAdmin) {
      toast.error("You don't have permission to access the admin area");
      
      // Redirect to the appropriate dashboard based on user role
      if (user?.role === 'service_provider') {
        return <Navigate to="/provider/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  } 
  // For service provider routes
  else if (requiredRole === 'service_provider') {
    if (user?.role !== 'service_provider' && !isAdmin) {
      toast.error("You need a service provider account to access this area");
      return <Navigate to="/home" replace />;
    }
  }
  // For user-specific routes
  else if (requiredRole === 'user') {
    if (user?.role !== 'user' && !isAdmin) {
      // Admins and service providers can still access user routes
      if (user?.role === 'service_provider') {
        return <Navigate to="/provider/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
