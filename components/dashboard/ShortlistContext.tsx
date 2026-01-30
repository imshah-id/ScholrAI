"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ShortlistContextType {
  count: number;
  updateCount: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(
  undefined,
);

export const useShortlist = () => {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error("useShortlist must be used within a ShortlistProvider");
  }
  return context;
};

export const ShortlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/shortlist");
      if (res.ok) {
        const data = await res.json();
        setCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch shortlist count", error);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <ShortlistContext.Provider value={{ count, updateCount: fetchCount }}>
      {children}
    </ShortlistContext.Provider>
  );
};
