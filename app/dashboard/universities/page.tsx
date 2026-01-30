"use client";

import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Check,
  Loader2,
  Sparkles,
  TrendingUp,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertSystem";
import { useShortlist } from "@/components/dashboard/ShortlistContext";

export default function DiscoveryPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { updateCount } = useShortlist();
  const [searchTerm, setSearchTerm] = useState("");
  // ... (rest of code)

  const [universities, setUniversities] = useState<any[]>([]);
  const [externalResults, setExternalResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [externalLoading, setExternalLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [loadingShortlist, setLoadingShortlist] = useState<string | null>(null);

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
    // Remove non-numeric characters except if needed? simple approach:
    // "$55,000" -> "55000"
    // "£20,000" -> "20000" (Ignoring currency conversion for now, treating raw number as value)
    const num = parseInt(feeStr.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Extract unique countries
  const countries = [
    "All",
    ...Array.from(new Set(universities.map((u) => u.country))),
  ].sort();

  useEffect(() => {
    fetchUniversities();
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
        // Filter out ones we already have locally to avoid duplicates
        // Checking by name fuzzy match is hard, checking by exact name or checking if we already have it in displayed
        // Simplest: Just set them. The keys are likely different.
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

  const handleShortlist = async (university: any) => {
    setLoadingShortlist(university.id);
    const isRemoving = shortlisted.has(university.id);

    try {
      const payload: any = { universityId: university.id };
      // If external, pass the full data for creation
      if (university.isExternal && !isRemoving) {
        payload.universityData = university;
      }

      const res = await fetch("/api/shortlist", {
        method: isRemoving ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        // If we created a new university, the ID might have been normalized or changed (if we want to use the DB ID).
        // But for UI consistency, we stick to the ID we have or update logic?
        // Actually, if it was created, the responseData is the shortlist item, containing responseData.universityId.
        // We should probably rely on the 'university.id' we used, unless it completely changed.
        // Our API logic tries to use the 'hipo_' ID if possible.

        // Sync global count
        updateCount();

        if (isRemoving) {
          setShortlisted((prev) => {
            const newSet = new Set(prev);
            newSet.delete(university.id);
            return newSet;
          });
        } else {
          setShortlisted((prev) => new Set(prev).add(university.id));

          // SMART NUDGE: If this was the 3rd one
          // Note: Using 'shortlisted' from closure (current render state).
          // If it was 2, and we just added one successfully, it is now 3.
          if (shortlisted.size === 2 && !shortlisted.has(university.id)) {
            showAlert(
              "Great start! You've shortlisted 3 universities.",
              "success",
              {
                label: "Go to Shortlist →",
                onClick: () => router.push("/dashboard/shortlist"),
              },
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to shortlist", error);
    } finally {
      setLoadingShortlist(null);
    }
  };

  // Combine Local and External
  // Logic:
  // 1. Filter local universities based on search/filters.
  // 2. If filtering by specific criteria (score > 0), maybe don't show external (since they have no score)?
  //    Actually, external ones have null score/rank.
  //    Let's show external ONLY if Filters are permissive or defaults?
  //    Or just show them at the end.
  //    Let's append them.

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

    // Rank Filter (Lower rank is better, so rank <= maxRank)
    // If rank is null/undefined, do we show it (treated as unranked) or hide?
    // Let's hide unranked if strict rank filter is applied (e.g. < 500).
    // Or treat unranked as Infinity.
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

  // Filter external to exclude ones that match local names effectively?
  // Simply filter out if ID exists in local? No, local IDs are UUIDs.
  // Names are unique though.
  const localNames = new Set(filteredLocal.map((u) => u.name.toLowerCase()));
  const filteredExternal = externalResults.filter(
    (u) =>
      !localNames.has(u.name.toLowerCase()) &&
      (filters.country === "All" || u.country === filters.country),
  );

  // De-duplicate final list by ID to avoid Hipo/React key collisions
  const combined = [...filteredLocal, ...filteredExternal];
  const uniqueIds = new Set();
  const displayedUniversities = combined.filter((u) => {
    if (uniqueIds.has(u.id)) return false;
    uniqueIds.add(u.id);
    return true;
  });

  const handleViewDetails = async (uni: any) => {
    if (uni.isExternal) {
      // 1. Show loading state on the button? Or global?
      // Let's use a local loading state if possible, but for now just push.
      // We need to resolve the ID first.

      // OPTIMISTIC: specific loading state?
      // We can use a toast or just let the router handle it if it was fast, but it might take a sec.
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
  };

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

          {/* Filter Dropdown */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-12 z-50 w-72 bg-navy-900 border border-white/10 rounded-2xl shadow-xl p-4 space-y-4 backdrop-blur-xl"
            >
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  Minimum Match Score
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={filters.minMatch}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minMatch: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="text-primary font-bold">
                    {filters.minMatch}%+
                  </span>
                </div>
              </div>

              {/* Max Fees Slider */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  Max Annual Fees
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={filters.maxFees}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxFees: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span className="text-primary font-bold">
                    ${(filters.maxFees / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Max Rank Slider */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  Max Global Rank
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={filters.maxRank}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxRank: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Top 10</span>
                  <span className="text-primary font-bold">
                    Top {filters.maxRank}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
                  }
                  className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between">
                <button
                  onClick={() =>
                    setFilters({
                      minMatch: 0,
                      maxFees: 100000,
                      maxRank: 500,
                      country: "All",
                    })
                  }
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-xs text-primary font-bold hover:text-primary/80"
                >
                  Done
                </button>
              </div>
            </motion.div>
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
            <motion.div
              layoutId={uni.id} // Optional: for smoother layout changes if items shift
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl border overflow-hidden hover:border-primary/50 transition-all group relative hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.02] flex flex-col h-full ${uni.isExternal ? "border-blue-500/20 bg-blue-900/10" : "border-white/5"}`}
            >
              {/* Match Score Badge (Only for Local) */}
              {!uni.isExternal && uni.matchScore !== undefined && (
                <div className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      (uni.matchScore || 0) >= 80
                        ? "bg-green-500"
                        : (uni.matchScore || 0) >= 50
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      (uni.matchScore || 0) >= 80
                        ? "text-green-400"
                        : (uni.matchScore || 0) >= 50
                          ? "text-yellow-400"
                          : "text-gray-400"
                    }`}
                  >
                    {uni.matchScore || 0}% Match
                  </span>
                </div>
              )}

              {/* External Data Badge - Sleek Version */}
              {uni.isExternal && (
                <div className="absolute top-4 right-4 bg-blue-500/10 backdrop-blur-md border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  <span className="text-xs font-bold text-blue-300">
                    AI Discovery
                  </span>
                </div>
              )}

              <div
                className={`h-32 relative p-6 flex items-end shrink-0 ${uni.isExternal ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-navy-800 to-navy-900"}`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />

                {/* Category Badge (Top Left) */}
                {!uni.isExternal && (
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                      (uni.matchScore || 0) >= 80
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : (uni.matchScore || 0) >= 50
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {(uni.matchScore || 0) >= 80
                      ? "🎯 Safe"
                      : (uni.matchScore || 0) >= 50
                        ? "✨ Target"
                        : "🚀 Dream"}
                  </div>
                )}

                <h3 className="text-xl font-bold leading-tight relative z-10 text-white line-clamp-2">
                  {uni.name}
                </h3>
              </div>

              <div className="p-5 flex flex-col flex-1 gap-4 relative">
                {/* Location & AI Insight */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />{" "}
                    {uni.country || "Unknown Location"}
                  </div>
                  {!uni.isExternal && uni.reasons && uni.reasons.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-purple-200 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 text-purple-400 shrink-0" />
                      <span className="italic leading-snug">
                        "{uni.reasons[0]}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Enhanced Stats Grid */}
                {!uni.isExternal ? (
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/5 border-b">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Global Rank
                      </div>
                      <div className="font-bold text-white text-sm">
                        #{uni.rank || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Est. Fees
                      </div>
                      <div className="font-bold text-green-400 text-sm">
                        {uni.fees}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Acceptance
                      </div>
                      <div className="font-bold text-white text-sm">
                        {uni.acceptanceRate || "TBD"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Odds
                      </div>
                      <div
                        className={`font-bold text-sm flex items-center gap-1 ${
                          uni.matchChance === "High"
                            ? "text-green-400"
                            : uni.matchChance === "Medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {uni.matchChance || "TBD"}
                      </div>
                    </div>
                  </div>
                ) : (
                  // External Data - Locked State
                  <div className="relative py-4 border-t border-white/5 border-b border-white/5 space-y-2">
                    {/* Blurred Fake Data for Effect */}
                    <div className="grid grid-cols-2 gap-3 blur-sm select-none opacity-40">
                      <div>
                        <div className="h-2 w-16 bg-gray-600 rounded mb-1"></div>
                        <div className="h-4 w-10 bg-gray-500 rounded"></div>
                      </div>
                      <div>
                        <div className="h-2 w-16 bg-gray-600 rounded mb-1"></div>
                        <div className="h-4 w-12 bg-green-900/50 rounded"></div>
                      </div>
                    </div>

                    {/* Overlay Call to Action */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                      <div className="text-xs font-bold text-blue-300 bg-navy-900/90 px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-2 shadow-xl">
                        <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                        Analyze to Reveal Data
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer / Buttons */}
                <div className="flex flex-col gap-3 mt-auto">
                  {/* Website Link (Subtle) for External */}
                  {uni.isExternal && uni.web_pages?.[0] && (
                    <a
                      href={uni.web_pages[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-gray-500 hover:text-blue-400 flex items-center gap-1 mx-auto transition-colors"
                    >
                      Visit {new URL(uni.web_pages[0]).hostname}{" "}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                  {!uni.isExternal && (
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        try {
                          const tags = JSON.parse(uni.tags || "[]");
                          return tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium px-2 py-0.5 bg-navy-800 text-gray-400 rounded border border-white/5"
                            >
                              {tag}
                            </span>
                          ));
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(uni)}
                      className={`flex-1 ${uni.isExternal ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30" : "bg-white/5 hover:bg-white/10 text-white border-white/10"} py-2.5 rounded-xl font-medium text-xs transition-all border cursor-pointer flex items-center justify-center gap-2`}
                    >
                      {uni.isExternal ? (
                        <>
                          <Sparkles className="w-3 h-3" /> AI Analyze
                        </>
                      ) : (
                        "View Details"
                      )}
                    </motion.button>
                    {!uni.isExternal && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShortlist(uni)}
                        disabled={loadingShortlist === uni.id}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer group/btn ${
                          shortlisted.has(uni.id)
                            ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400 border border-green-500/30 hover:border-red-500/30"
                            : "bg-primary text-navy-900 hover:bg-gold-400 hover:shadow-lg hover:shadow-primary/20"
                        }`}
                      >
                        {loadingShortlist === uni.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {shortlisted.has(uni.id) ? "Removing" : "Adding"}
                          </>
                        ) : shortlisted.has(uni.id) ? (
                          <>
                            <span className="flex items-center gap-1 group-hover/btn:hidden">
                              <Check className="w-3 h-3" /> Saved
                            </span>
                            <span className="hidden group-hover/btn:flex items-center gap-1">
                              <X className="w-3 h-3" /> Remove
                            </span>
                          </>
                        ) : (
                          <>
                            <Star className="w-3 h-3" /> Shortlist
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
