import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider";
import { ZustandProvider } from "./providers/ZustandProvider";
import { useEffect,useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import userService from "./services/userService";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ServiceProviders from "./pages/ServiceProviders";
import ServiceProviderProfile from "./pages/ServiceProviderProfile";
import PackageDetails from "./pages/PackageDetails";
import Checkout from "./pages/Checkout";
import UserProfile from "./pages/UserProfile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProfileSetup from "./pages/provider/ProfileSetup";
import CloudSpace from "./pages/CloudSpace";
import ResetPassword from "./components/auth/ResetPassword";
import PublicEvents from "./pages/PublicEvents";
import Promotions from "./pages/Promotions";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Auth
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <ZustandProvider>
      <BrowserRouter>
        <AppProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            <AuthInitializer />
            <Routes>
              {/* Auth Routes - These are the only routes accessible without login */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/provider-approval-setup" element={<ProfileSetup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Root path redirects to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Protected Public Routes - require any authenticated user */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service-providers" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <ServiceProviders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service-providers/:id" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <ServiceProviderProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/packages/:id" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <PackageDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <About />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <Contact />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/public-events" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <PublicEvents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/promotions" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <Promotions />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected User Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cloud-space" 
                element={
                  <ProtectedRoute requiredRole="any">
                    <CloudSpace />
                  </ProtectedRoute>
                } 
              />
              
              {/* Service Provider Routes */}
              <Route
                path="/provider/*" 
                element={
                  <ProtectedRoute requiredRole="service_provider">
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/provider/profile-setup" 
                element={
                  <ProtectedRoute requiredRole="service_provider">
                    <ProfileSetup />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route 
                path="/admin/dashboard/*" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all unknown routes and redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TooltipProvider>
        </AppProvider>
      </BrowserRouter>
    </ZustandProvider>
  );
}

// New component to handle auth initialization
function AuthInitializer() {
  const { setUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('eventHub_token');
    
    // If token exists, try to fetch current user
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token might be invalid or expired
          localStorage.removeItem('eventHub_token');
          localStorage.removeItem('eventHub_user');
        } finally {
          setIsInitialized(true);
        }
      };
      
      fetchCurrentUser();
    } else {
      setIsInitialized(true);
    }
  }, [setUser]);
  
  // Add token refresh mechanism
  useEffect(() => {
    // Set up a periodic token refresh (every 30 minutes)
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem('eventHub_token');
      if (token) {
        // Implement a token refresh endpoint in your backend
        // and call it here to extend the session
        userService.refreshToken()
          .catch(() => {
            // If refresh fails, don't immediately log out
            // This prevents disrupting the user experience
            console.error("Token refresh failed");
          });
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return isInitialized ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default App;
