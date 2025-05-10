import { ReactNode,useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import userService from "@/services/userService";
import {  useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'user' | 'service_provider' | 'admin' | 'any';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated: appIsAuthenticated, user: appUser } = useApp();
  const { isAuthenticated: storeIsAuthenticated, isAdmin: storeIsAdmin, user: storeUser } = useAuthStore();
  const navigate = useNavigate(); // Add this line to use navigate
  
  // Check auth status from both systems and localStorage
  const storedToken = localStorage.getItem('eventHub_token');
  const isAuthenticated = appIsAuthenticated || storeIsAuthenticated || !!storedToken;
  
  // Merge user information, prioritizing store user
  const storedUserStr = localStorage.getItem('eventHub_user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const user = storeUser || appUser || storedUser;
  
  // Special check for admin role
  const isAdmin = storeIsAdmin || (user?.role === 'admin');
  
  // useEffect to validate token on component mount
  useEffect(() => {
    if (storedToken && !user) {
      // If we have a token but no user, fetch user data
      userService.getCurrentUser()
        .then(userData => {
          useAuthStore.getState().setUser(userData);
        })
        .catch(() => {
          // Token might be invalid, clear localStorage and redirect to login
          localStorage.removeItem('eventHub_token');
          localStorage.removeItem('eventHub_user');
          navigate('/login');
        });
    }
  }, [navigate, user, storedToken]);
  
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
