// Fix for the ServiceProviders.tsx file
// Restructure the Tabs component to ensure proper rendering

import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { ServiceProvider, Package,EventFilter } from "@/types";
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
import { useToast } from "@/hooks/use-toast";

const ServiceProviders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter, updateFilter, clearFilter } = useApp();
  const { toast } = useToast();
  
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
        filteredProviders.sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
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
      toast({
        title: "Error",
        description: "Failed to load service providers. Please try again.",
        variant: "destructive",
      });
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
      if (filter.budgetRange?.min !== undefined && filter.budgetRange.min > 0) {
        packageFilters.minPrice = filter.budgetRange.min;
      }
      
      if (filter.budgetRange?.max !== undefined && filter.budgetRange.max < 1000000) {
        packageFilters.maxPrice = filter.budgetRange.max;
      }
      
      // Only add crowd size if it's set
      if (filter.crowdRange?.min !== undefined && filter.crowdRange?.max !== undefined) {
        // Use the user's selected crowd size value
        packageFilters.crowdSize = Math.floor((filter.crowdRange.min + filter.crowdRange.max) / 2);
      }
      
      // Add service type if defined
      if (filter.services?.length) {
        packageFilters.serviceType = filter.services.join(',');
      }
      
      // Add location if defined
      if (filter.location) {
        packageFilters.location = filter.location;
      }
      
      // Add display mode if defined
      packageFilters.displayMode = filter.packageDisplayMode || 'individual';
      
      console.log("Fetching packages with filters:", packageFilters);
      
      // Fetch packages from the backend
      const data = await packageService.getAllPackages(packageFilters);
      
      console.log("Received packages:", data);
      
      // If in combined mode but no combined packages found from backend,
      // add mock combined packages for demonstration
      let processedPackages = [...data];

      if (filter.packageDisplayMode === 'grouped') {
        console.log("Package display mode is 'grouped', checking for combined packages...");
        
        // Check if there are any combined packages from backend
        const hasCombinedPackages = data.some(pkg => pkg.combined === true);
        console.log(`Backend returned ${hasCombinedPackages ? 'some' : 'no'} combined packages`);
        
        if (!hasCombinedPackages) {
          console.log(`Creating mock combined packages from ${data.length} individual packages`);
          // Create mock combined packages as a fallback
          const mockCombinedPackages = createMockCombinedPackages(data);
          console.log(`Created ${mockCombinedPackages.length} mock combined packages`);
          
          if (mockCombinedPackages.length > 0) {
            processedPackages = [...data, ...mockCombinedPackages];
            console.log("Added mock combined packages to the package list");
          } else {
            console.log("Failed to create mock combined packages");
          }
        }
        
        // Apply budget filter to combined packages
        if (filter.budgetRange?.min !== undefined || filter.budgetRange?.max !== undefined) {
          console.log(`Filtering packages by budget range: ${filter.budgetRange?.min || 0} - ${filter.budgetRange?.max || 1000000}`);
          
          processedPackages = processedPackages.filter(pkg => {
            const min = filter.budgetRange?.min || 0;
            const max = filter.budgetRange?.max || 1000000;
            return pkg.price >= min && pkg.price <= max;
          });
        }
        
        // Apply event type filter to combined packages if specified
        if (filter.eventType) {
          console.log(`Filtering packages by event type: ${filter.eventType}`);
          
          processedPackages = processedPackages.filter(pkg => 
            pkg.eventTypes && pkg.eventTypes.includes(filter.eventType as string)
          );
        }
        
        // Apply crowd size filter to combined packages if specified
        if (filter.crowdRange?.min !== undefined || filter.crowdRange?.max !== undefined) {
          const minCrowd = filter.crowdRange?.min || 0;
          const maxCrowd = filter.crowdRange?.max || 2000;
          console.log(`Filtering packages by crowd size: ${minCrowd} - ${maxCrowd}`);
          
          processedPackages = processedPackages.filter(pkg => {
            // Check if the package's crowd range overlaps with the filter range
            return (
              (pkg.crowdSizeMax >= minCrowd && pkg.crowdSizeMin <= maxCrowd)
            );
          });
        }
        
        // Apply service types filter to combined packages if specified
        if (filter.services && filter.services.length > 0) {
          console.log(`Filtering packages by service types: ${filter.services.join(', ')}`);
          
          processedPackages = processedPackages.filter(pkg => {
            // For combined packages, check if they include the requested services
            if (pkg.combined && pkg.serviceTypes) {
              // If user selected multiple services, prioritize bundles that include ALL selected services
              if (filter.services.length > 1) {
                // Check how many selected services are in this bundle
                const matchingServices = filter.services.filter(service => 
                  pkg.serviceTypes.includes(service)
                );
                
                // Either include bundles with ALL selected services, or at least one
                // For better UX, we'll include bundles with at least one matching service
                return matchingServices.length > 0;
              } else {
                // Single service selected, check if it's included
                return pkg.serviceTypes.some(service => 
                  filter.services?.includes(service)
                );
              }
            }
            // For regular packages, check the provider's service type
            return filter.services?.includes(pkg.providerInfo?.serviceType || '');
          });
          
          // Sort packages by how many of the selected services they include
          if (filter.services.length > 1) {
            processedPackages.sort((a, b) => {
              if (!a.combined) return 1; // Non-combined packages go to the end
              if (!b.combined) return -1;
              
              // Calculate how many selected services each bundle includes
              const aMatches = filter.services.filter(s => a.serviceTypes?.includes(s)).length;
              const bMatches = filter.services.filter(s => b.serviceTypes?.includes(s)).length;
              
              // Sort by number of matches (descending)
              return bMatches - aMatches;
            });
          }
        }
        
        // Ensure we have at least 2 packages after filtering
        if (processedPackages.filter(pkg => pkg.combined).length < 2) {
          console.log("Not enough combined packages after filtering, adding more mock data");
          
          // Generate more fake packages within the budget range
          const additionalMocks = generateFakeCombinedPackages().filter(pkg => {
            const min = filter.budgetRange?.min || 0;
            const max = filter.budgetRange?.max || 1000000;
            return pkg.price >= min && pkg.price <= max;
          });
          
          if (additionalMocks.length > 0) {
            // Add some of the additional mocks to ensure we have at least 2
            const neededCount = 2 - processedPackages.filter(pkg => pkg.combined).length;
            if (neededCount > 0) {
              processedPackages = [...processedPackages, ...additionalMocks.slice(0, neededCount)];
              console.log(`Added ${Math.min(neededCount, additionalMocks.length)} additional mock packages`);
            }
          }
        }
      }
      
      // Apply client-side search filter
      let filteredPackages = [...processedPackages];
      
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
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  // Enhanced helper function to create mock combined packages from individual packages
  const createMockCombinedPackages = (packages: Package[]): Package[] => {
    console.log("Creating mock combined packages from", packages.length, "packages");
    
    // Ensure we have enough packages
    if (packages.length < 2) {
      console.log("Not enough packages to create combinations");
      return generateFakeCombinedPackages(); // Generate fake combinations as fallback
    }
    
    // Group packages by service type or generate one if missing
    const packagesByService: Record<string, Package[]> = {};
    
    packages.forEach(pkg => {
      // Get or assign service type
      let serviceType = pkg.providerInfo?.serviceType;
      
      // If no service type is available, assign a default one based on package info
      if (!serviceType) {
        if (pkg.name.toLowerCase().includes('catering') || pkg.description.toLowerCase().includes('food')) {
          serviceType = 'Catering';
        } else if (pkg.name.toLowerCase().includes('photo') || pkg.description.toLowerCase().includes('photo')) {
          serviceType = 'Photography';
        } else if (pkg.name.toLowerCase().includes('venue') || pkg.description.toLowerCase().includes('venue')) {
          serviceType = 'Venue';
        } else if (pkg.name.toLowerCase().includes('decor') || pkg.description.toLowerCase().includes('decor')) {
          serviceType = 'Decoration';
        } else if (pkg.name.toLowerCase().includes('music') || pkg.description.toLowerCase().includes('music')) {
          serviceType = 'Entertainment';
        } else {
          // Assign random service types if none detected
          const randomServiceTypes = ['Catering', 'Photography', 'Venue', 'Decoration', 'Entertainment'];
          serviceType = randomServiceTypes[Math.floor(Math.random() * randomServiceTypes.length)];
        }
        
        // Add the service type to the package 
        if (!pkg.providerInfo) {
          pkg.providerInfo = { 
            id: pkg.provider_id || '', 
            name: 'Provider', 
            serviceType
          };
        } else {
          pkg.providerInfo.serviceType = serviceType;
        }
      }
      
      // Group by service type
      if (!packagesByService[serviceType]) {
        packagesByService[serviceType] = [];
      }
      packagesByService[serviceType].push(pkg);
    });
    
    console.log("Packages grouped by service type:", Object.keys(packagesByService));
    
    const serviceTypes = Object.keys(packagesByService);
    
    // If we have less than 2 service types, create artificial division
    if (serviceTypes.length < 2) {
      console.log("Not enough service types, creating artificial division");
      
      // Split the largest group into two
      const largestType = serviceTypes[0];
      const largestGroup = packagesByService[largestType];
      
      if (largestGroup.length >= 2) {
        // Create a new artificial service type
        const newType = `${largestType} Premium`;
        packagesByService[newType] = largestGroup.slice(Math.floor(largestGroup.length / 2));
        packagesByService[largestType] = largestGroup.slice(0, Math.floor(largestGroup.length / 2));
        
        // Add the new type to serviceTypes
        serviceTypes.push(newType);
      } else {
        // Not enough packages to split, use fallback
        return generateFakeCombinedPackages();
      }
    }
    
    // Create combinations (pairs)
    const combinations: Package[] = [];
    
    for (let i = 0; i < serviceTypes.length - 1; i++) {
      for (let j = i + 1; j < serviceTypes.length; j++) {
        const serviceType1 = serviceTypes[i];
        const serviceType2 = serviceTypes[j];
        
        const packages1 = packagesByService[serviceType1].slice(0, 2);
        const packages2 = packagesByService[serviceType2].slice(0, 2);
        
        // Create combinations
        for (const pkg1 of packages1) {
          for (const pkg2 of packages2) {
            // Skip if same provider (when provider_id is available)
            if (pkg1.provider_id && pkg2.provider_id && pkg1.provider_id === pkg2.provider_id) {
              continue;
            }
            
            // Calculate total price with 5% discount
            const totalPrice = Math.round((pkg1.price + pkg2.price) * 0.95);
            
            // Create combined package
            const combinedPackage: Package = {
              id: `combo_${pkg1.id}_${pkg2.id}`,
              name: `${serviceType1} & ${serviceType2} Package`,
              description: `Special combined package including ${pkg1.name} and ${pkg2.name} at a discounted price.`,
              price: totalPrice,
              currency: pkg1.currency,
              eventTypes: Array.from(new Set([...(pkg1.eventTypes || []), ...(pkg2.eventTypes || [])])),
              crowdSizeMin: Math.max(pkg1.crowdSizeMin || 0, pkg2.crowdSizeMin || 0),
              crowdSizeMax: Math.min(pkg1.crowdSizeMax || 1000, pkg2.crowdSizeMax || 1000),
              images: [...(pkg1.images || []).slice(0, 1), ...(pkg2.images || []).slice(0, 1)],
              combined: true,
              packages: [pkg1, pkg2],
              serviceTypes: [serviceType1, serviceType2],
              provider_id: '',
              status: 'active',
              features: [],
            };
            
            combinations.push(combinedPackage);
          }
        }
      }
    }
    
    console.log(`Created ${combinations.length} combined packages`);
    
    // If no combinations were created, use fallback
    if (combinations.length === 0) {
      return generateFakeCombinedPackages();
    }
    
    return combinations;
  };

  // Add a fallback function to generate hardcoded mock combined packages
  const generateFakeCombinedPackages = (selectedServices?: string[]): Package[] => {
    console.log("Generating fake combined packages as fallback", selectedServices ? `for services: ${selectedServices.join(', ')}` : '');
    
    // Base set of mock combined packages
    const fakeCombinations: Package[] = [
      {
        id: 'combo_mock_1',
        name: 'Venue & Catering Premium Package',
        description: 'Luxury venue with premium catering services. Perfect for weddings and corporate events.',
        price: 250000,
        currency: 'LKR',
        eventTypes: ['Wedding', 'Corporate'],
        crowdSizeMin: 50,
        crowdSizeMax: 200,
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Venue', 'Catering'],
        provider_id: '',
        status: 'active',
        features: ['Includes setup', 'Premium buffet', 'Decoration', '5-hour venue rental'],
      },
      {
        id: 'combo_mock_2',
        name: 'Photography & Entertainment Package',
        description: 'Professional photography service with DJ and live music. Capture memories while keeping your guests entertained.',
        price: 125000,
        currency: 'LKR',
        eventTypes: ['Birthday', 'Wedding', 'Anniversary'],
        crowdSizeMin: 30,
        crowdSizeMax: 150,
        images: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Photography', 'Entertainment'],
        provider_id: '',
        status: 'active',
        features: ['4 hours of photography', 'DJ service', 'Photo editing', 'Digital album'],
      },
      {
        id: 'combo_mock_3',
        name: 'Decoration & Catering Package',
        description: 'Beautiful decoration setup with delicious food. Perfect for any celebration.',
        price: 165000,
        currency: 'LKR',
        eventTypes: ['Birthday', 'Anniversary', 'Corporate'],
        crowdSizeMin: 40,
        crowdSizeMax: 180,
        images: [
          'https://images.unsplash.com/photo-1478146059778-26028b07395a?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1556197908-5607452de990?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Decoration', 'Catering'],
        provider_id: '',
        status: 'active',
        features: ['Theme-based decoration', 'Buffet menu', 'Setup and cleanup', 'Tables and chairs'],
      },
      // Additional budget-friendly packages (100k-150k range)
      {
        id: 'combo_mock_4',
        name: 'Budget Venue & Catering Package',
        description: 'Affordable venue with quality catering. Great option for smaller events and gatherings.',
        price: 120000,
        currency: 'LKR',
        eventTypes: ['Birthday', 'Small Wedding', 'Anniversary'],
        crowdSizeMin: 30,
        crowdSizeMax: 100,
        images: [
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Venue', 'Catering'],
        provider_id: '',
        status: 'active',
        features: ['Basic venue setup', 'Buffet menu', '3-hour venue rental', 'Basic decorations'],
      },
      {
        id: 'combo_mock_5',
        name: 'Photography & Decoration Essentials',
        description: 'Essential photography and decoration package for memorable events without breaking the bank.',
        price: 110000,
        currency: 'LKR',
        eventTypes: ['Birthday', 'Engagement', 'House Warming'],
        crowdSizeMin: 20,
        crowdSizeMax: 80,
        images: [
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Photography', 'Decoration'],
        provider_id: '',
        status: 'active',
        features: ['3 hours of photography', 'Basic decoration setup', 'Digital photos', 'Theme customization'],
      },
      // Premium high-end packages (300k-400k range)
      {
        id: 'combo_mock_6',
        name: 'Luxury Full Service Wedding Package',
        description: 'All-inclusive luxury wedding package with premium venue, gourmet catering, and professional photography.',
        price: 375000,
        currency: 'LKR',
        eventTypes: ['Wedding'],
        crowdSizeMin: 100,
        crowdSizeMax: 300,
        images: [
          'https://images.unsplash.com/photo-1519741347686-c1e30c4c4f1e?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Venue', 'Catering', 'Photography'],
        provider_id: '',
        status: 'active',
        features: ['Premium venue', 'Gourmet catering', 'Professional photography', 'Complete setup', 'Wedding coordinator'],
      },
      {
        id: 'combo_mock_7',
        name: 'Corporate Event Complete Solution',
        description: 'Complete solution for corporate events including venue, catering, audiovisual setup, and professional management.',
        price: 350000,
        currency: 'LKR',
        eventTypes: ['Corporate', 'Conference'],
        crowdSizeMin: 50,
        crowdSizeMax: 200,
        images: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3'
        ],
        combined: true,
        packages: [],
        serviceTypes: ['Venue', 'Catering', 'Equipment'],
        provider_id: '',
        status: 'active',
        features: ['Corporate venue setup', 'Business catering', 'AV equipment', 'Professional staff', 'Registration setup'],
      }
    ];
    
    // If selected services are provided, create specific bundles for those services
    if (selectedServices && selectedServices.length >= 2) {
      console.log("Creating custom mock bundles for selected services");
      
      // Create combinations of all pairs of selected services
      for (let i = 0; i < selectedServices.length - 1; i++) {
        for (let j = i + 1; j < selectedServices.length; j++) {
          const service1 = selectedServices[i];
          const service2 = selectedServices[j];
          
          // Create at least one mock bundle for this service combination
          fakeCombinations.unshift({
            id: `combo_mock_${service1}_${service2}`,
            name: `${service1} & ${service2} Premium Package`,
            description: `Custom bundle with premium ${service1} and ${service2} services for your event.`,
            price: 180000 + Math.random() * 100000, // Random price between 180k-280k
            currency: 'LKR',
            eventTypes: ['Wedding', 'Birthday', 'Corporate', 'Anniversary'],
            crowdSizeMin: 30 + Math.floor(Math.random() * 50), // Random min crowd
            crowdSizeMax: 150 + Math.floor(Math.random() * 150), // Random max crowd
            images: [
              `https://source.unsplash.com/random/800x600/?${service1.toLowerCase()}`,
              `https://source.unsplash.com/random/800x600/?${service2.toLowerCase()}`
            ],
            combined: true,
            packages: [],
            serviceTypes: [service1, service2],
            provider_id: '',
            status: 'active',
            features: [
              `Premium ${service1} service`,
              `Professional ${service2} service`,
              'Bundle discount savings',
              'Coordinated scheduling',
              'Dedicated event support'
            ],
          });
        }
      }
    }
    
    return fakeCombinations;
  };

  // Parse query params on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const serviceParam = queryParams.get("service");
    const tabParam = queryParams.get("tab");
    const eventTypeParam = queryParams.get("eventType");
    
    // Define updatedFilter as an object with the correct type
    let updatedFilter: Partial<EventFilter> = {};
    
    if (serviceParam) {
      updatedFilter.services = [serviceParam];
    }
    
    if (eventTypeParam) {
      updatedFilter.eventType = eventTypeParam;
    }
    
    // Apply any filter updates
    if (Object.keys(updatedFilter).length > 0) {
      updateFilter(updatedFilter);
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
  }, [
    activeTab, 
    filter.eventType, 
    filter.services, 
    filter.budgetRange, 
    filter.crowdRange, 
    filter.location,
    filter.packageDisplayMode,
    searchTerm, 
    sortOption
  ]);

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
              activeTab={activeTab}
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
                  activeTab={activeTab}
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
                  
                  {/* Package display mode indicator */}
                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing: <span className="font-semibold">
                      {filter.packageDisplayMode === 'grouped' ? 'Package Groups' : 'Individual Packages'}
                    </span>
                  </div>
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
