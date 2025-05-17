import { ServiceProvider } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PackagesTabProps {
  provider: ServiceProvider;
}

export const PackagesTab = ({ provider }: PackagesTabProps) => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Service Packages</h3>
        
        {provider.packages && provider.packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {provider.packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={pkg.thumbnailImage || provider.profileImage || '/placeholder-package.jpg'} 
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg">{pkg.name}</h4>
                  <p className="text-green-600 font-medium mt-1">
                    {pkg.price.toLocaleString()} {pkg.currency}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
                  <Button className="mt-4 w-full">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No packages available from this service provider</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};