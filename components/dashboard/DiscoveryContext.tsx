"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FilterState {
  minMatch: number;
  maxFees: number;
  maxRank: number;
  country: string;
}

interface DiscoveryContextType {
  universities: any[];
  setUniversities: React.Dispatch<React.SetStateAction<any[]>>;
  externalResults: any[];
  setExternalResults: React.Dispatch<React.SetStateAction<any[]>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  hasMore: boolean;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
}

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(
  undefined,
);

export const useDiscovery = () => {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error("useDiscovery must be used within a DiscoveryProvider");
  }
  return context;
};

export const DiscoveryProvider = ({ children }: { children: ReactNode }) => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [externalResults, setExternalResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    minMatch: 0,
    maxFees: 100000,
    maxRank: 500,
    country: "All",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  return (
    <DiscoveryContext.Provider
      value={{
        universities,
        setUniversities,
        externalResults,
        setExternalResults,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        page,
        setPage,
        hasMore,
        setHasMore,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};
