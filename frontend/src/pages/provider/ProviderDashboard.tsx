import { useEffect,useState} from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useApp } from "@/providers/AppProvider";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import ProviderOverview from "@/components/provider/ProviderOverview";
import ProviderPackages from "@/components/provider/ProviderPackages";
import ProviderBookings from "@/components/provider/ProviderBookings";
import ProviderProfile from "@/components/provider/ProviderProfile";
import ProviderGallery from "@/components/provider/ProviderGallery";
import ProviderPayment from "@/components/provider/ProviderPayment";
import ProviderReviews from "@/components/provider/ProviderReviews";
import ProviderNotifications from "@/components/provider/ProviderNotifications";
import ProviderCloud from "@/components/provider/ProviderCloud";
import ProviderProfileSetup from "@/pages/provider/ProviderProfileSetup";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const ProviderDashboard = () => {
  const { isAuthenticated, user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first before redirecting
    const token = localStorage.getItem('eventHub_token');
    const storedUser = localStorage.getItem('eventHub_user');
    
    if (!token) {
      toast.error("Please login to access the provider dashboard");
      navigate("/login");
      return;
    }
    
    // If we have a token but no user in context, try to load from localStorage
    if (!isAuthenticated && token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === "service_provider" || userData.role === "admin") {
          // Valid user, continue loading the dashboard
          setLoading(false);
          return;
        }
      } catch (error) {
        // Invalid stored user data
        localStorage.removeItem('eventHub_token');
        localStorage.removeItem('eventHub_user');
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
    }
    
    // Check user role from context if available
    if (user && user.role !== "service_provider" && user.role !== "admin") {
      toast.error("You need a service provider account to access this dashboard");
      navigate("/");
    }
    
    setLoading(false);
  }, [isAuthenticated, user, navigate]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <h1 className="mb-6 text-3xl font-bold">Loading Dashboard...</h1>
          {/* You can add a spinner here */}
        </div>
      </Layout>
    );
  }

  // If not authenticated, show graceful UI instead of returning null
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <h1 className="mb-6 text-3xl font-bold">Service Provider Dashboard</h1>
          <p className="mb-6 text-lg">Please login to access your provider dashboard.</p>
          <Button asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </Layout>
    );
  }

  // If wrong role, show appropriate message
  if (user?.role !== "service_provider" && user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <h1 className="mb-6 text-3xl font-bold">Service Provider Access</h1>
          <p className="mb-6 text-lg">You need a service provider account to access this dashboard.</p>
          {user?.role === "user" && (
            <div className="space-y-4">
              <p>Would you like to register as a service provider?</p>
              <Button asChild>
                <a href="/register?type=provider">Register as Service Provider</a>
              </Button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <ProviderLayout>
      <Routes>
        <Route path="/" element={<ProviderOverview />} />
        <Route path="/packages" element={<ProviderPackages />} />
        <Route path="/bookings" element={<ProviderBookings />} />
        <Route path="/profile" element={<ProviderProfile />} />
        <Route path="/gallery" element={<ProviderGallery />} />
        <Route path="/payment" element={<ProviderPayment />} />
        <Route path="/reviews" element={<ProviderReviews />} />
        <Route path="/notifications" element={<ProviderNotifications />} />
        <Route path="/cloud" element={<ProviderCloud />} />
        <Route path="/profile-setup" element={<ProviderProfileSetup />} />
        <Route path="*" element={<Navigate to="/provider" replace />} />
      </Routes>
    </ProviderLayout>
  );
};

export default ProviderDashboard;
