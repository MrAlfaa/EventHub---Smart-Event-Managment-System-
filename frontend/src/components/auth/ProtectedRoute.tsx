import { ReactNode,useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import userService from "@/services/userService";
import {  useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'user' | 'service_provider' | 'admin' | 'super_admin' | 'any';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated: appIsAuthenticated, user: appUser } = useApp();
  const { isAuthenticated: storeIsAuthenticated, isAdmin: storeIsAdmin, user: storeUser } = useAuthStore();
  const navigate = useNavigate();
  
  // Add debugging logs
  console.log("ProtectedRoute: Required role:", requiredRole);
  console.log("ProtectedRoute: Store user:", storeUser);
  console.log("ProtectedRoute: App user:", appUser);
  
  // Check auth status from both systems and localStorage
  const storedToken = localStorage.getItem('eventHub_token');
  const isAuthenticated = appIsAuthenticated || storeIsAuthenticated || !!storedToken;
  
  // Merge user information, prioritizing store user
  const storedUserStr = localStorage.getItem('eventHub_user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const user = storeUser || appUser || storedUser;
  
  console.log("ProtectedRoute: Combined user:", user);
  
  // Special check for admin role - FIX HERE
  const isAdmin = storeIsAdmin || (user?.role === 'admin' || user?.role === 'super_admin');
  const isServiceProvider = user?.role === 'service_provider';
  
  console.log("ProtectedRoute: isAdmin:", isAdmin);
  console.log("ProtectedRoute: isServiceProvider:", isServiceProvider);
  
  // useEffect to validate token on component mount
  useEffect(() => {
    if (storedToken && !user) {
      // If we have a token but no user, fetch user data
      userService.getCurrentUser()
        .then(userData => {
          console.log("ProtectedRoute: Fetched user data:", userData);
          useAuthStore.getState().setUser(userData);
        })
        .catch((error) => {
          console.error("ProtectedRoute: Error fetching user data:", error);
          // Token might be invalid, clear localStorage and redirect to login
          localStorage.removeItem('eventHub_token');
          localStorage.removeItem('eventHub_user');
          navigate('/login');
        });
    }
  }, [navigate, user, storedToken]);
  
  // If not authenticated in either system
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    toast.error("Please log in to continue");
    return <Navigate to="/login" replace />;
  }
  
  // Allow any authenticated user if requiredRole is 'any'
  if (requiredRole === 'any') {
    console.log("ProtectedRoute: Role 'any' requested, allowing access");
    return <>{children}</>;
  }
  
  // Special handling for admin routes
  if (requiredRole === 'admin') {
    if (!isAdmin) {
      console.log("ProtectedRoute: Admin access denied");
      toast.error("You don't have permission to access the admin area");
      
      // Redirect based on actual role
      if (isServiceProvider) {
        console.log("ProtectedRoute: Redirecting admin request to provider dashboard");
        return <Navigate to="/provider/dashboard" replace />;
      } else if (user?.role === 'user') {
        console.log("ProtectedRoute: Redirecting admin request to user home");
        return <Navigate to="/home" replace />;
      } else {
        // If not authenticated or role not recognized
        return <Navigate to="/login" replace />;
      }
    }
    console.log("ProtectedRoute: Admin access granted");
  } 
  // Special handling for super_admin routes
  else if (requiredRole === 'super_admin') {
    if (user?.role !== 'super_admin') {
      console.log("ProtectedRoute: Super admin access denied");
      toast.error("You need super admin permissions to access this area");
      
      if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (isServiceProvider) {
        return <Navigate to="/provider/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
    console.log("ProtectedRoute: Super admin access granted");
  }
  // For service provider routes
  else if (requiredRole === 'service_provider') {
    if (!isServiceProvider && !isAdmin) {
      console.log("ProtectedRoute: Service provider access denied");
      toast.error("You need a service provider account to access this area");
      return <Navigate to="/home" replace />;
    }
    console.log("ProtectedRoute: Service provider access granted");
  }
  // For user-specific routes
  else if (requiredRole === 'user') {
    if (user?.role !== 'user' && !isAdmin) {
      console.log("ProtectedRoute: User access handling");
      // Admins and service providers can still access user routes
      if (isServiceProvider) {
        return <Navigate to="/provider/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
