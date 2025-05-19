import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Package } from '@/types';
import { useFilterStore } from '@/store/useFilterStore';
import packageService from '@/services/packageService';
import { PackageCard } from '@/components/service-providers/PackageCard';
import { FilterSidebar } from '@/components/service-providers/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

const PackagesPage = () => {
  const { filter, updateFilter, clearFilter } = useFilterStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);
  
  // Fetch packages when filters change
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter for API
        const apiFilter: {
          eventType?: string;
          minPrice?: number;
          maxPrice?: number;
          crowdSize?: number;
          serviceType?: string;
          location?: string;
          displayMode?: 'individual' | 'grouped';
        } = {};
        
        if (filter.eventType) {
          apiFilter.eventType = filter.eventType;
        }
        
        if (filter.budgetRange) {
          apiFilter.minPrice = filter.budgetRange.min;
          apiFilter.maxPrice = filter.budgetRange.max;
        }
        
        if (filter.crowdRange) {
          // Use the max value for API filter
          apiFilter.crowdSize = filter.crowdRange.max;
        }
        
        // If services are selected, use them as serviceType filter
        if (filter.services && filter.services.length > 0) {
          apiFilter.serviceType = filter.services.join(',');
        }
        
        // Use the packageDisplayMode
        apiFilter.displayMode = filter.packageDisplayMode || 'individual';
        
        if (filter.location) {
          apiFilter.location = filter.location;
        }
        
        console.log('Fetching packages with filter:', apiFilter);
        
        const result = await packageService.getAllPackages(apiFilter);
        console.log('Received packages:', result);
        setPackages(result);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, [filter]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Event Packages</h1>
        
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Found <span className="font-semibold">{packages.length}</span> packages
          </p>
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={toggleFilters}
          >
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          {filtersVisible && (
            <div className="w-full md:w-64 shrink-0">
              <FilterSidebar
                filter={filter}
                onFilterChange={updateFilter}
                onClearFilter={clearFilter}
                activeTab="packages"
              />
            </div>
          )}
          
          {/* Package list */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex h-40 flex-col items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-4 text-sm text-gray-600">Loading packages...</p>
              </div>
            ) : error ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 p-4 text-center">
                <p className="text-base font-medium text-red-600">{error}</p>
                <Button
                  onClick={() => {
                    // Re-fetch packages
                    const fetchPackages = async () => {
                      try {
                        setLoading(true);
                        setError(null);
                        const result = await packageService.getAllPackages({
                          displayMode: filter.packageDisplayMode
                        });
                        setPackages(result);
                      } catch (err) {
                        setError('Failed to load packages. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchPackages();
                  }}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg: Package) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <p className="mb-2 text-base font-medium text-gray-600">No packages found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
                <Button
                  onClick={clearFilter}
                  className="mt-4"
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PackagesPage;
