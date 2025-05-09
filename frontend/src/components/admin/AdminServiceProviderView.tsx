import React from "react";
import ServiceProviderDetailsDialog, { ServiceProvider } from "./ServiceProviderDetailsDialog";

interface AdminServiceProviderViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider | null;
}

/**
 * This component wraps the ServiceProviderDetailsDialog for the admin view
 * Simply passes through all the data to show the complete service provider details
 */
const AdminServiceProviderView: React.FC<AdminServiceProviderViewProps> = ({
  isOpen,
  onOpenChange,
  provider
}) => {
  if (!provider) return null;

  return (
    <ServiceProviderDetailsDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      provider={provider}
    />
  );
};

export default AdminServiceProviderView;