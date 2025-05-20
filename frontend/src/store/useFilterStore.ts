  import { create } from 'zustand';
  import { EventFilter } from '@/types';

  const defaultFilter: EventFilter = {
    services: [],
    budgetRange: { min: 0, max: 1000000 },
    crowdRange: { min: 0, max: 2000 },
    packageFilter: null,
    packageDisplayMode: 'individual',
    hotelType: undefined
  };

  interface FilterState {
    filter: EventFilter;
    hasAppliedFilters: boolean;
    updateFilter: (newFilter: Partial<EventFilter>) => void;
    clearFilter: () => void;
  }

  export const useFilterStore = create<FilterState>()((set) => ({
    filter: defaultFilter,
    hasAppliedFilters: false,

    updateFilter: (newFilter) => set((state) => {
      // If changing display mode to grouped, ensure we have a reasonable budget cap
      let updatedFilter = { ...newFilter }
      
      if (newFilter.packageDisplayMode === 'grouped') {
        // If budget is not set or set to max, provide a reasonable default
        if (!state.filter.budgetRange || state.filter.budgetRange.max >= 1000000) {
          updatedFilter.budgetRange = {
            min: state.filter.budgetRange?.min || 0, // Ensure min is always defined
            max: 500000 // Set a reasonable default for package combinations
          }
        }
      }
      
      return {
        filter: { ...state.filter, ...updatedFilter },
        hasAppliedFilters: true
      }
    }),
    clearFilter: () => set({ 
      filter: defaultFilter,
      hasAppliedFilters: false
    })
  }));