import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { serviceProviders } from "@/data/mockData";
import { ServiceProvider } from "@/types";
import { ServiceProviderCard } from "@/components/service-providers/ServiceProviderCard";
import { FilterSidebar } from "@/components/service-providers/FilterSidebar";
import { Search, Filter as FilterIcon, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ServiceProviders = () => {
  const location = useLocation();
  const { filter, updateFilter, clearFilter } = useApp();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("rating");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const applyFilters = () => {
    let filtered = [...serviceProviders];

    if (searchTerm) {
      filtered = filtered.filter((provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter.eventType) {
      filtered = filtered.filter((provider) =>
        provider.eventTypes.includes(filter.eventType!)
      );
    }

    if (filter.services && filter.services.length > 0) {
      filtered = filtered.filter((provider) =>
        filter.services.some((service) => provider.services.includes(service))
      );
    }

    if (filter.location) {
      filtered = filtered.filter(
        (provider) =>
          provider.location.city
            .toLowerCase()
            .includes(filter.location!.toLowerCase()) ||
          provider.location.address
            .toLowerCase()
            .includes(filter.location!.toLowerCase())
      );
    }

    if (filter.date) {
      filtered = filtered.filter((provider) =>
        provider.availableDates.some(
          (date) =>
            new Date(date).toDateString() ===
            filter.date!.toDateString()
        )
      );
    }

    filtered = filtered.filter(
      (provider) =>
        provider.pricing.maxPrice >= filter.budgetRange.min &&
        provider.pricing.minPrice <= filter.budgetRange.max
    );

    filtered = filtered.filter(
      (provider) =>
        provider.capacity.max >= filter.crowdRange.min &&
        provider.capacity.min <= filter.crowdRange.max
    );

    // Apply sorting
    if (sortOption === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "price_low") {
      filtered.sort((a, b) => a.pricing.minPrice - b.pricing.minPrice);
    } else if (sortOption === "price_high") {
      filtered.sort((a, b) => b.pricing.maxPrice - a.pricing.maxPrice);
    } else if (sortOption === "reviews") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setProviders(filtered);
  };

  // Parse query params on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const serviceParam = queryParams.get("service");
    
    if (serviceParam) {
      updateFilter({ services: [serviceParam] });
    }
    
    // Otherwise use existing filter
    applyFilters();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Re-filter when filters or sort option changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchTerm, sortOption]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <Layout>
      <div className="container mx-auto py-4 px-3 sm:px-4 sm:py-6 md:py-8">
        <h1 className="mb-4 sm:mb-6 md:mb-8 text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">Service Providers</h1>

        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search service providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 sm:h-10 rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm sm:text-base focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative w-full min-w-[150px] sm:min-w-[200px] md:w-auto">
              <Select defaultValue="rating" onValueChange={setSortOption}>
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

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 md:flex-row">
          {filtersVisible && (
            <div className="hidden w-64 shrink-0 md:block">
              <FilterSidebar
                filter={filter}
                onFilterChange={updateFilter}
                onClearFilter={clearFilter}
              />
            </div>
          )}

          <div className="flex-grow">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600">
                Found <span className="font-semibold">{providers.length}</span> service providers
              </p>
            </div>

            {providers.length > 0 ? (
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceProviders;
