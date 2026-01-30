"use client";

import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertSystem";
import { useShortlist } from "@/components/dashboard/ShortlistContext";
import { UniversityCard } from "@/components/dashboard/UniversityCard";
import UniversitySkeleton from "@/components/dashboard/UniversitySkeleton";

import ComparisonModal from "@/components/dashboard/ComparisonModal";

const DiscoveryFilters = dynamic(
  () => import("@/components/dashboard/DiscoveryFilters"),
  { ssr: false, loading: () => null },
);

import { fetchMoreUniversities } from "./actions";
import { m, AnimatePresence } from "framer-motion";
import { triggerConfetti } from "@/lib/confetti";

interface DiscoveryClientProps {
  initialUniversities: any[];
}

export default function DiscoveryClient({
  initialUniversities,
}: DiscoveryClientProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { updateCount } = useShortlist();
  const [searchTerm, setSearchTerm] = useState("");

  const [universities, setUniversities] = useState<any[]>(initialUniversities);
  const [externalResults, setExternalResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Initial loading is done handled by SSR/Suspense

  const [externalLoading, setExternalLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [loadingShortlist, setLoadingShortlist] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const newUnis = await fetchMoreUniversities(nextPage);
      if (newUnis.length === 0) {
        setHasMore(false);
      } else {
        setUniversities((prev) => [...prev, ...newUnis]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Failed to load more", e);
    } finally {
      setLoadingMore(false);
    }
  };

  // Ref to keep handleShortlist stable
  const shortlistedRef = useRef(shortlisted);
  useEffect(() => {
    shortlistedRef.current = shortlisted;
  }, [shortlisted]);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMatch: 0,
    maxFees: 100000,
    maxRank: 500,
    country: "All",
  });

  // Helper: Parse Fees to Number
  const parseFees = (feeStr: string | undefined): number => {
    if (!feeStr) return 0;
    const num = parseInt(feeStr.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Extract unique countries
  const countries = useMemo(
    () =>
      [
        "All",
        ...Array.from(new Set(universities.map((u) => u.country))),
      ].sort(),
    [universities],
  );

  useEffect(() => {
    // fetchUniversities(); // Handled by SSR
    fetchShortlist();
  }, []);

  // Debounced External Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchExternal();
      } else {
        setExternalResults([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchExternal = async () => {
    setExternalLoading(true);
    try {
      const res = await fetch(
        `/api/universities/external?name=${encodeURIComponent(searchTerm)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setExternalResults(data);
      }
    } catch (e) {
      console.error("External search failed", e);
    } finally {
      setExternalLoading(false);
    }
  };

  const fetchUniversities = async () => {
    // Check Cache
    const cached = sessionStorage.getItem("scholrai_uni_recommendations");
    if (cached) {
      try {
        setUniversities(JSON.parse(cached));
        setLoading(false);
        // Optional: Background revalidation could go here
        return;
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/universities");
      if (res.ok) {
        const data = await res.json();
        setUniversities(data);
        sessionStorage.setItem(
          "scholrai_uni_recommendations",
          JSON.stringify(data),
        );
      }
    } catch (error) {
      console.error("Failed to fetch universities", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlist = async () => {
    try {
      const res = await fetch("/api/shortlist");
      if (res.ok) {
        const data = await res.json();
        setShortlisted(new Set(data.map((item: any) => item.universityId)));
      }
    } catch (error) {
      console.error("Failed to fetch shortlist", error);
    }
  };

  const handleShortlist = useCallback(
    async (university: any) => {
      setLoadingShortlist(university.id);
      const currentShortlisted = shortlistedRef.current;
      const isRemoving = currentShortlisted.has(university.id);

      try {
        const payload: any = { universityId: university.id };
        // If external, pass the full data for creation, checking original object reference might be safer but for now relying on isExternal property
        if (university.isExternal && !isRemoving) {
          payload.universityData = university;
        }

        const res = await fetch("/api/shortlist", {
          method: isRemoving ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          updateCount();

          if (isRemoving) {
            setShortlisted((prev) => {
              const newSet = new Set(prev);
              newSet.delete(university.id);
              return newSet;
            });
          } else {
            setShortlisted((prev) => {
              const newSet = new Set(prev);
              newSet.add(university.id);
              // SMART NUDGE Logic (using local copy of size)
              if (newSet.size === 3 && !prev.has(university.id)) {
                triggerConfetti();
                // Trigger alert slightly deferred to avoid state update collision if any
                setTimeout(() => {
                  showAlert(
                    "Great start! You've shortlisted 3 universities.",
                    "success",
                    {
                      label: "Go to Shortlist →",
                      onClick: () => router.push("/dashboard/shortlist"),
                    },
                  );
                }, 100);
              }
              return newSet;
            });
          }
        }
      } catch (error) {
        console.error("Failed to shortlist", error);
      } finally {
        setLoadingShortlist(null);
      }
    },
    [updateCount, showAlert, router],
  );

  const handleViewDetails = useCallback(
    async (uni: any) => {
      if (uni.isExternal) {
        const toastId = showAlert("Initializing University Profile...", "info"); // Pseudo-toast

        try {
          const res = await fetch("/api/universities/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: uni.name }),
          });

          if (res.ok) {
            const resolved = await res.json();
            router.push(`/dashboard/universities/${resolved.id}`);
          } else {
            showAlert("Could not load details.", "error");
          }
        } catch (e) {
          showAlert("Connection failed.", "error");
        }
      } else {
        router.push(`/dashboard/universities/${uni.id}`);
      }
    },
    [router, showAlert],
  );

  const displayedUniversities = useMemo(() => {
    const filteredLocal = universities.filter((u) => {
      const matchesSearch = u.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesScore = (u.matchScore || 0) >= filters.minMatch;
      const matchesCountry =
        filters.country === "All" || u.country === filters.country;

      // Fee Filter
      const feeVal = parseFees(u.fees);
      const matchesFees = feeVal <= filters.maxFees;

      // Rank Filter
      const rankVal = u.rank || 9999;
      const matchesRank = rankVal <= filters.maxRank;

      return (
        matchesSearch &&
        matchesScore &&
        matchesCountry &&
        matchesFees &&
        matchesRank
      );
    });

    const localNames = new Set(filteredLocal.map((u) => u.name.toLowerCase()));
    const filteredExternal = externalResults.filter(
      (u) =>
        !localNames.has(u.name.toLowerCase()) &&
        (filters.country === "All" || u.country === filters.country),
    );

    const combined = [...filteredLocal, ...filteredExternal];
    const uniqueIds = new Set();
    return combined.filter((u) => {
      if (uniqueIds.has(u.id)) return false;
      uniqueIds.add(u.id);
      return true;
    });
  }, [universities, externalResults, searchTerm, filters]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Universities</h1>
          <p className="text-gray-400">
            AI-curated recommendations based on your profile.
          </p>
        </div>

        <div className="flex gap-2 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search universities..."
              className="bg-navy-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/50 outline-none hover:border-white/20 transition-colors text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {externalLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-navy-800 border p-2.5 rounded-xl transition-colors ${
              showFilters || filters.minMatch > 0 || filters.country !== "All"
                ? "border-primary text-primary bg-primary/10"
                : "border-white/10 text-gray-400 hover:bg-white/5"
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Filter Dropdown - Lazy Loaded */}
          {showFilters && (
            <DiscoveryFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              setFilters={setFilters}
              countries={countries}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading top universities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUniversities.map((uni, i) => (
            <UniversityCard
              key={uni.id}
              uni={uni}
              index={i}
              isShortlisted={shortlisted.has(uni.id)}
              isLoadingShortlist={loadingShortlist === uni.id}
              onViewDetails={handleViewDetails}
              onShortlist={handleShortlist}
            />
          ))}
          {/* External Search Skeletons */}
          {externalLoading &&
            [...Array(3)].map((_, i) => (
              <UniversitySkeleton key={`skel-${i}`} />
            ))}
        </div>
      )}

      {/* Load More Button */}
      {displayedUniversities.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-navy-800 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </>
            ) : (
              "Load More Universities"
            )}
          </m.button>
        </div>
      )}
    </div>
  );
}
