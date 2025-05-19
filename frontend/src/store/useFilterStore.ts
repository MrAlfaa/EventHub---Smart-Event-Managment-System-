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

    updateFilter: (newFilter) => set((state) => ({
      filter: { ...state.filter, ...newFilter },
      hasAppliedFilters: true
    })),

    clearFilter: () => set({ 
      filter: defaultFilter,
      hasAppliedFilters: false
    })
  }));