import React from "react";
import ServiceProviderDetailsDialog from "./ServiceProviderDetailsDialog";
import { ServiceProvider } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface AdminServiceProviderViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider | null;
}

/**
 * This component wraps the ServiceProviderDetailsDialog for the admin view
 * Passes through all the data to show the complete service provider details without approval buttons
 */
const AdminServiceProviderView: React.FC<AdminServiceProviderViewProps> = ({
  isOpen,
  onOpenChange,
  provider
}) => {
  if (!provider) return null;

  // Create empty functions for onApprove and onReject since we're not using them
  const handleApprove = () => {};
  const handleReject = () => {};

  // Format the provider data to match what ServiceProviderDetailsDialog expects
  const formattedProvider = {
    id: provider.id,
    businessName: provider.businessName,
    providerName: provider.name,
    email: provider.email,
    phone: provider.contactNumber,
    serviceType: Array.isArray(provider.serviceType) && provider.serviceType.length > 0 
      ? provider.serviceType[0] 
      : "General",
    location: provider.location,
    registrationDate: provider.registrationDate || new Date().toISOString(),
    // Ensure status is passed through as-is since we're expecting 'approved'
    status: provider.status,
    nicNumber: provider.nicNumber,
    nicFrontImage: provider.nicFrontImage || "",
    nicBackImage: provider.nicBackImage || "",
    businessRegistrationNumber: provider.businessRegNumber,
    businessDescription: provider.business_description,
    profilePicture: provider.profileImage,
    coverPhoto: provider.coverPhoto,
    userId: provider.id,
    // Pass the financial information
    bankName: provider.bankName || "",
    branchName: provider.branchName || "",
    accountNumber: provider.accountNumber || "",
    accountOwnerName: provider.accountOwnerName || ""
  };

  return (
    <ServiceProviderDetailsDialog
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      provider={formattedProvider}
      onApprove={handleApprove}
      onReject={handleReject}
      showActions={false} // Set this to false to hide approve/reject buttons
    />
  );
};

export default AdminServiceProviderView;