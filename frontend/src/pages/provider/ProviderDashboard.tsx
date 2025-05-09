import { useEffect } from "react";
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

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to access the provider dashboard");
      navigate("/login");
      return;
    }
    
    if (user?.role !== "service_provider" && user?.role !== "admin" && user?.role !== "super_admin") {
      toast.error("You need a service provider account to access this dashboard");
      navigate("/");
    }
  }, [isAuthenticated, user?.role, navigate]);

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
