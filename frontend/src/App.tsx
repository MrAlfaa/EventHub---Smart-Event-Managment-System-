import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider";
import { ZustandProvider } from "./providers/ZustandProvider";

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

export default App;
