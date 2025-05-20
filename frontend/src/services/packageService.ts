import axios from 'axios';
import { Package } from '@/types';

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventHub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Package service functions
const packageService = {
  // Get a specific package by ID
  getPackageById: async (packageId: string): Promise<Package> => {
    try {
      const response = await api.get(`/packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  },

  // Function to combine packages locally
  combinePackages: (packages: Package[], maxBudget?: number): Package[] => {
    console.log("Combining packages locally");
    
    // Group packages by service type
    const packagesByService: Record<string, Package[]> = {};
    
    packages.forEach(pkg => {
      // Get service type from provider info
      const serviceType = pkg.providerInfo?.serviceType;
      if (serviceType) {
        if (!packagesByService[serviceType]) {
          packagesByService[serviceType] = [];
        }
        packagesByService[serviceType].push(pkg);
      }
    });
    
    const serviceTypes = Object.keys(packagesByService);
    console.log(`Found ${serviceTypes.length} service types to combine`);
    
    // We need at least 2 different services to create combinations
    if (serviceTypes.length < 2) {
      console.log("Not enough service types to create combinations");
      return [];
    }
    
    // Create combinations (just pairs for simplicity)
    const combinations: Package[] = [];
    
    for (let i = 0; i < serviceTypes.length - 1; i++) {
      for (let j = i + 1; j < serviceTypes.length; j++) {
        const serviceType1 = serviceTypes[i];
        const serviceType2 = serviceTypes[j];
        
        const packages1 = packagesByService[serviceType1].slice(0, 3); // Limit to 3 packages per type
        const packages2 = packagesByService[serviceType2].slice(0, 3);
        
        // Create all possible combinations
        for (const pkg1 of packages1) {
          for (const pkg2 of packages2) {
            // Skip packages from the same provider
            if (pkg1.provider_id === pkg2.provider_id) {
              continue;
            }
            
            // Calculate total price
            const totalPrice = pkg1.price + pkg2.price;
            
            // Skip if exceeds budget
            if (maxBudget && totalPrice > maxBudget) {
              continue;
            }
            
            // Create combined package
            const combinedPackage: Package = {
              id: `combo_${pkg1.id}_${pkg2.id}`,
              name: `${serviceType1.charAt(0).toUpperCase() + serviceType1.slice(1)} & ${serviceType2.charAt(0).toUpperCase() + serviceType2.slice(1)} Package`,
              description: `Combined package including ${pkg1.name} and ${pkg2.name}`,
              price: totalPrice,
              currency: pkg1.currency,
              eventTypes: Array.from(new Set([...(pkg1.eventTypes || []), ...(pkg2.eventTypes || [])])),
              crowdSizeMin: Math.max(pkg1.crowdSizeMin || 0, pkg2.crowdSizeMin || 0),
              crowdSizeMax: Math.min(pkg1.crowdSizeMax || 1000, pkg2.crowdSizeMax || 1000),
              images: [...(pkg1.images || []).slice(0, 1), ...(pkg2.images || []).slice(0, 1)],
              combined: true,
              packages: [pkg1, pkg2],
              serviceTypes: [serviceType1, serviceType2],
              provider_id: '', // Not relevant for combined packages
              status: 'active',
              features: [] // Add the required features property
            };
            
            combinations.push(combinedPackage);
          }
        }
      }
    }
    
    console.log(`Created ${combinations.length} combined packages`);
    return combinations;
  },

  // Get all packages with filters
  getAllPackages: async (filters: { 
    eventType?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    crowdSize?: number;
    serviceType?: string;
    location?: string;
    displayMode?: 'individual' | 'grouped';
  }): Promise<Package[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      
      // Only add crowdSize if it's explicitly set and not a default value
      if (filters.crowdSize !== undefined && filters.crowdSize !== 1000) {
        queryParams.append('crowdSize', filters.crowdSize.toString());
      }
      
      // Handle service types
      if (filters.serviceType) {
        // If serviceType is an array, join with commas
        if (Array.isArray(filters.serviceType)) {
          queryParams.append('serviceType', filters.serviceType.join(','));
        } else {
          queryParams.append('serviceType', filters.serviceType);
        }
      }
      
      if (filters.location) queryParams.append('location', filters.location);

      // Add display mode parameter
      if (filters.displayMode) {
        queryParams.append('displayMode', filters.displayMode);
      }
      
      console.log(`Fetching packages with params: ${queryParams.toString()}`);
      console.log("Display mode being sent to API:", filters.displayMode);
      
      const response = await api.get(`/packages/available?${queryParams.toString()}`);
      
      // Process the response to normalize package data
      let packages = response.data.map((pkg: any) => {
        // Ensure the combined flag is properly set
        if (pkg.combined) {
          console.log("Found combined package:", pkg.name);
        }
        return pkg;
      });
      
      // Log the package breakdown before local combination
      let regular = packages.filter((p: any) => !p.combined).length;
      let combined = packages.filter((p: any) => p.combined).length;
      console.log(`Package breakdown from API: ${regular} regular, ${combined} combined`);
      
      // If display mode is grouped but no combined packages were returned, combine locally
      if (filters.displayMode === 'grouped' && combined === 0 && regular >= 2) {
        console.log("No combined packages from API, combining locally");
        const combinedPackages = packageService.combinePackages(packages, filters.maxPrice);
        
        // Add the locally combined packages to the result
        if (combinedPackages.length > 0) {
          packages = [...packages, ...combinedPackages];
          
          // Update the counts for logging
          regular = packages.filter((p: any) => !p.combined).length;
          combined = packages.filter((p: any) => p.combined).length;
          console.log(`Package breakdown after local combination: ${regular} regular, ${combined} combined`);
        }
      }
      
      return packages;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }
};

export default packageService;