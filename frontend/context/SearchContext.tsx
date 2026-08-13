"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SearchFilterState {
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  min_price?: number;
  max_price?: number;
  amenities?: string;
}

interface SearchContextType {
  searchFilter: SearchFilterState;
  setSearchFilter: (filters: SearchFilterState) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchFilter: { location: "", check_in: "", check_out: "", guests: 0 },
  setSearchFilter: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchFilter, setSearchFilter] = useState<SearchFilterState>({
    location: "",
    check_in: "",
    check_out: "",
    guests: 0,
  });

  return (
    <SearchContext.Provider value={{ searchFilter, setSearchFilter }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
