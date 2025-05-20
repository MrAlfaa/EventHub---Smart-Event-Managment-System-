import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminServiceProviders from "@/components/admin/AdminSeviceProviders";
import ServiceProviderApproval from "@/components/admin/ServiceProviderApproval";
import AdminPaymentDetails from "@/components/admin/AdminPaymentDetails";
import AdminBookings from "@/components/admin/AdminBookings";
import PromotionsManager from "@/components/admin/PromotionsManager";
import AdminSettings from "@/components/admin/AdminSettings";
import ServiceTypesManager from "@/components/admin/ServiceTypesManager";
import AdminNotifications from "@/components/admin/AdminNotifications";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminDashboard: Authentication check");
    console.log("AdminDashboard: isAuthenticated:", isAuthenticated);
    console.log("AdminDashboard: isAdmin:", isAdmin);
    console.log("AdminDashboard: User:", user);
    
    if (!isAuthenticated) {
      console.log("AdminDashboard: Not authenticated, redirecting to login");
      toast.error("Please login to access the admin dashboard");
      navigate("/admin/login");
    } else if (!isAdmin) {
      console.log("AdminDashboard: Not admin, redirecting");
      toast.error("You don't have permission to access the admin dashboard");
      navigate("/");
    } else {
      console.log("AdminDashboard: Access granted");
    }
  }, [isAuthenticated, isAdmin, navigate, user]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/service-providers" element={<AdminServiceProviders />} />
        <Route path="/approvals" element={<ServiceProviderApproval />} />
        <Route path="/payment-details" element={<AdminPaymentDetails />} />
        <Route path="/bookings" element={<AdminBookings />} />
        <Route path="/promotions" element={<PromotionsManager />} />
        <Route path="/service-types" element={<ServiceTypesManager />} />
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/service-providers/approval" element={<ServiceProviderApproval />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
