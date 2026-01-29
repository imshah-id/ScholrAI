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
} from "lucide-react";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

export default function DiscoveryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  // ... (rest of code)

  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [loadingShortlist, setLoadingShortlist] = useState<string | null>(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMatch: 0,
    maxFees: 100000,
    country: "All",
  });

  // Extract unique countries
  const countries = [
    "All",
    ...Array.from(new Set(universities.map((u) => u.country))),
  ].sort();

  useEffect(() => {
    fetchUniversities();
    fetchShortlist();
  }, []);

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

  const handleShortlist = async (universityId: string) => {
    setLoadingShortlist(universityId);
    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });

      if (res.ok) {
        setShortlisted((prev) => new Set(prev).add(universityId));
      }
    } catch (error) {
      console.error("Failed to shortlist", error);
    } finally {
      setLoadingShortlist(null);
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
                    setFilters({ minMatch: 0, maxFees: 100000, country: "All" })
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
          {universities
            .filter((u) => {
              const matchesSearch = u.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
              const matchesScore = (u.matchScore || 0) >= filters.minMatch;
              const matchesCountry =
                filters.country === "All" || u.country === filters.country;
              return matchesSearch && matchesScore && matchesCountry;
            })
            .map((uni, i) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-primary/50 transition-all group relative hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.02] flex flex-col h-full"
              >
                {/* Match Score Badge */}
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

                <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-900 relative p-6 flex items-end shrink-0">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />

                  {/* Category Badge (Top Left) */}
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

                  <h3 className="text-xl font-bold leading-tight relative z-10 text-white line-clamp-2">
                    {uni.name}
                  </h3>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                  {/* Location & AI Insight */}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 text-primary" /> {uni.location}
                    </div>
                    {uni.reasons && uni.reasons.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-purple-200 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 text-purple-400 shrink-0" />
                        <span className="italic leading-snug">
                          "{uni.reasons[0]}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/5 border-b">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Global Rank
                      </div>
                      <div className="font-bold text-white text-sm">
                        #{uni.rank}
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
                        {uni.matchChance || "Medium"}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
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

                  <div className="flex gap-2 mt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        router.push(`/dashboard/universities/${uni.id}`)
                      }
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium text-xs transition-all border border-white/10 hover:border-white/30 cursor-pointer"
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShortlist(uni.id)}
                      disabled={
                        shortlisted.has(uni.id) || loadingShortlist === uni.id
                      }
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        shortlisted.has(uni.id)
                          ? "bg-green-500/20 text-green-400 cursor-default"
                          : "bg-primary text-navy-900 hover:bg-gold-400 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                      }`}
                    >
                      {loadingShortlist === uni.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Adding
                        </>
                      ) : shortlisted.has(uni.id) ? (
                        <>
                          <Check className="w-3 h-3" /> Saved
                        </>
                      ) : (
                        <>
                          <Star className="w-3 h-3" /> Shortlist
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
