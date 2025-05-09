import React from 'react';
import { Package } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Tag } from "lucide-react";

interface PackageDetailsPopupProps {
  package: Package;
  isVisible: boolean;
  position?: { x: number; y: number } | null;
}

export const PackageDetailsPopup: React.FC<PackageDetailsPopupProps> = ({
  package: pkg,
  isVisible,
  position
}) => {
  if (!isVisible) return null;

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  // Calculate position styles based on provided position or default to fixed positioning
  const positionStyle = position ? {
    position: 'absolute' as const,
    top: `${position.y}px`,
    left: `${position.x}px`,
  } : {};

  return (
    <div 
      className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md z-50 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={positionStyle}
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
        <p className="text-blue-700 font-medium mt-1">{formatPrice(pkg.price, pkg.currency)}</p>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
          <span>Event Type: <span className="font-medium">{pkg.eventType}</span></span>
        </div>
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
          <span>Capacity: <span className="font-medium">{pkg.capacity.min} - {pkg.capacity.max}</span></span>
        </div>
      </div>
      
      {pkg.features && pkg.features.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Features:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {pkg.services && pkg.services.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Services Included:</h4>
          <div className="space-y-2">
            {pkg.services.map((service, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{service.serviceType}</span>
                  <span className="text-sm text-blue-700">{formatPrice(service.price, pkg.currency)}</span>
                </div>
                <p className="text-xs text-gray-600">{service.description}</p>
                <div className="text-xs text-gray-500 mt-1">by {service.serviceProviderName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetailsPopup;