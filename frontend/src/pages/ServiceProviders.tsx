// Fix for the ServiceProviders.tsx file
// Restructure the Tabs component to ensure proper rendering

import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { ServiceProvider, Package } from "@/types";
import { ServiceProviderCard } from "@/components/service-providers/ServiceProviderCard";
import { PackageCard } from "@/components/service-providers/PackageCard";
import { FilterSidebar } from "@/components/service-providers/FilterSidebar";
import { Search, Filter as FilterIcon, Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import providerService from "@/services/providerService";
import packageService from "@/services/packageService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ServiceProviders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter, updateFilter, clearFilter } = useApp();
  
  // State for providers tab
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);
  
  // State for packages tab
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  
  // Shared state
  const [searchTerm, setSearchTerm] = useState("");
   const [sortOption, setSortOption] = useState("rating");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("providers");

  const fetchProviders = async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    
    try {
      // Extract only the filters we want to implement now
      const activeFilters = {
        eventType: filter.eventType,
        services: filter.services,
        location: filter.location
      };
      
      // Fetch approved providers from the backend
      const data = await providerService.getApprovedProviders(activeFilters);
      
      // Apply client-side search filter
      let filteredProviders = [...data];
      
      if (searchTerm) {
        filteredProviders = filteredProviders.filter((provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      if (sortOption === "rating") {
        filteredProviders.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortOption === "price_low") {
        filteredProviders.sort((a, b) => 
          (a.pricing?.minPrice || 0) - (b.pricing?.minPrice || 0)
        );
      } else if (sortOption === "price_high") {
        filteredProviders.sort((a, b) => 
          (b.pricing?.maxPrice || 0) - (a.pricing?.maxPrice || 0)
        );
      } else if (sortOption === "reviews") {
        filteredProviders.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      }
      
      setProviders(filteredProviders);
    } catch (err) {
      console.error('Error fetching service providers:', err);
      setProvidersError('Failed to load service providers. Please try again.');
    } finally {
      setProvidersLoading(false);
    }
  };

  const fetchPackages = async () => {
    setPackagesLoading(true);
    setPackagesError(null);
    
    try {
      // Extract relevant filters - only include non-zero/undefined values
      const packageFilters: any = {};
      
      if (filter.eventType) {
        packageFilters.eventType = filter.eventType;
      }
      
      // Only add price filters if they're non-default values
      if (filter.budgetRange?.min && filter.budgetRange.min > 0) {
        packageFilters.minPrice = filter.budgetRange.min;
      }
      
      if (filter.budgetRange?.max && filter.budgetRange.max < 1000000) {
        packageFilters.maxPrice = filter.budgetRange.max;
      }
      
      // Only add crowd size if it's set
      if (filter.crowdRange?.max && filter.crowdRange.max < 2000) {
        packageFilters.crowdSize = filter.crowdRange.max;
      }
      
      // Only add service type if it's defined
      if (filter.services?.length) {
        packageFilters.serviceType = filter.services[0];
      }
      
      console.log("Fetching packages with filters:", packageFilters);
      
      // Fetch packages from the backend
      const data = await packageService.getAllPackages(packageFilters);
      
      console.log("Received packages:", data);
      
      // Apply client-side search filter
      let filteredPackages = [...data];
      
      if (searchTerm) {
        filteredPackages = filteredPackages.filter((pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.providerInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.providerInfo?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      if (sortOption === "rating") {
        // Sort by provider rating if available
        filteredPackages.sort((a, b) => (b.providerInfo?.rating || 0) - (a.providerInfo?.rating || 0));
      } else if (sortOption === "price_low") {
        filteredPackages.sort((a, b) => a.price - b.price);
      } else if (sortOption === "price_high") {
        filteredPackages.sort((a, b) => b.price - a.price);
      } else if (sortOption === "reviews") {
        // Sort by provider review count if available
        filteredPackages.sort((a, b) => (b.providerInfo?.reviewCount || 0) - (a.providerInfo?.reviewCount || 0));
      }
      
      setPackages(filteredPackages);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setPackagesError('Failed to load packages. Please try again.');
    } finally {
      setPackagesLoading(false);
    }
  };

  // Parse query params on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const serviceParam = queryParams.get("service");
    const tabParam = queryParams.get("tab");
    
    if (serviceParam) {
      updateFilter({ services: [serviceParam] });
    }
    
    if (tabParam === "packages") {
      setActiveTab("packages");
    }
    
    // Initially fetch data for both tabs to avoid empty content on tab switch
    fetchProviders();
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Re-fetch providers when filters or sort option changes
  useEffect(() => {
    if (activeTab === "providers") {
      fetchProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filter.eventType, filter.services, filter.location, searchTerm, sortOption]);

  // Fetch packages when the packages tab is active or when filters change
  useEffect(() => {
    if (activeTab === "packages") {
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filter.eventType, filter.services, filter.budgetRange, filter.crowdRange, searchTerm, sortOption]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL to reflect the current tab
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("tab", value);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Common search and filters UI
  const SearchAndFilterControls = () => (
    <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={activeTab === "providers" ? "Search service providers..." : "Search packages..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 sm:h-10 rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm sm:text-base focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative w-full min-w-[150px] sm:min-w-[200px] md:w-auto">
          <Select defaultValue="rating" value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="price_low">Lowest Price</SelectItem>
              <SelectItem value="price_high">Highest Price</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="hidden md:flex h-9 sm:h-10 text-xs sm:text-sm"
          onClick={toggleFilters}
        >
          <FilterIcon size={16} className="mr-2" />
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </Button>

        <Sheet
          open={mobileFiltersOpen}
          onOpenChange={setMobileFiltersOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden h-9 sm:h-10 text-xs sm:text-sm"
            >
              <FilterIcon size={16} className="mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[400px] p-4 sm:p-6">
            <div className="mb-2 text-lg font-bold">Filters</div>
            <FilterSidebar
              filter={filter}
              onFilterChange={updateFilter}
              onClearFilter={clearFilter}
              onClose={() => setMobileFiltersOpen(false)}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto py-4 px-3 sm:px-4 sm:py-6 md:py-8">
        <h1 className="mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">
          {activeTab === "providers" ? "Service Providers" : "Available Packages"}
        </h1>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="providers">Service Providers</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          {/* Search and filter controls */}
          <SearchAndFilterControls />

          {/* Content layout with sidebar */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
            {/* Filter sidebar */}
            {filtersVisible && (
              <div className="hidden w-64 shrink-0 md:block">
                <FilterSidebar
                  filter={filter}
                  onFilterChange={updateFilter}
                  onClearFilter={clearFilter}
                />
              </div>
            )}

            {/* Tab content */}
            <div className="flex-grow">
              {/* Providers tab content */}
              <TabsContent value="providers" className="mt-0">
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Found <span className="font-semibold">{providers.length}</span> service providers
                  </p>
                </div>

                {providersLoading ? (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-gray-600">Loading service providers...</p>
                  </div>
                ) : providersError ? (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 p-4 sm:p-8 text-center">
                    <p className="text-base sm:text-lg font-medium text-red-600">{providersError}</p>
                    <Button
                      onClick={fetchProviders}
                      className="mt-4 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : providers.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                    {providers.map((provider) => (
                      <ServiceProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 sm:p-8 text-center">
                    <p className="mb-2 text-base sm:text-lg font-medium text-gray-600">No service providers found</p>
                    <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filters</p>
                    <Button
                      variant="outline"
                      onClick={clearFilter}
                      className="mt-4 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Packages tab content */}
              <TabsContent value="packages" className="mt-0">
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Found <span className="font-semibold">{packages.length}</span> packages
                  </p>
                </div>

                {packagesLoading ? (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-gray-600">Loading packages...</p>
                  </div>
                ) : packagesError ? (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 p-4 sm:p-8 text-center">
                    <p className="text-base sm:text-lg font-medium text-red-600">{packagesError}</p>
                    <Button
                      onClick={fetchPackages}
                      className="mt-4 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : packages.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}
                  </div>
                               ) : (
                  <div className="flex h-40 sm:h-60 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 sm:p-8 text-center">
                    <p className="mb-2 text-base sm:text-lg font-medium text-gray-600">No packages found</p>
                    <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filters</p>
                    <Button
                      variant="outline"
                      onClick={clearFilter}
                      className="mt-4 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceProviders;
