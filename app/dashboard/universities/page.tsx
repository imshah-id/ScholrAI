"use client";

import { motion } from "framer-motion";
import { Search, Filter, Star, MapPin, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function DiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUniversities();
    fetchShortlist();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/universities");
      if (res.ok) {
        const data = await res.json();
        setUniversities(data);
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
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Universities</h1>
          <p className="text-gray-400">
            AI-curated recommendations based on your profile.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search universities..."
              className="bg-navy-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-64 focus:ring-2 focus:ring-primary/50 outline-none hover:border-white/20 transition-colors text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-navy-800 border border-white/10 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading top universities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities
            .filter((u) =>
              u.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((uni, i) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-primary/50 transition-colors group relative"
              >
                {/* Match Score Badge - Mocked for now */}
                <div className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md border border-teal-500/30 px-3 py-1 rounded-full flex items-center gap-1 z-10">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-teal-400">
                    90% Match
                  </span>
                </div>

                <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-900 relative p-6 flex items-end">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <h3 className="text-xl font-bold leading-tight relative z-10 text-white">
                    {uni.name}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" /> {uni.location}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/5 border-b">
                    <div>
                      <div className="text-xs text-gray-500">Global Rank</div>
                      <div className="font-bold text-white">#{uni.rank}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Est. Fees</div>
                      <div className="font-bold text-green-400">{uni.fees}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-medium text-sm transition-colors border border-white/10">
                      Details
                    </button>
                    <button
                      onClick={() => handleShortlist(uni.id)}
                      disabled={shortlisted.has(uni.id)}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-1 ${
                        shortlisted.has(uni.id)
                          ? "bg-green-500/20 text-green-400 cursor-default"
                          : "bg-primary text-navy-900 hover:bg-gold-400"
                      }`}
                    >
                      {shortlisted.has(uni.id) ? (
                        <>
                          <Check className="w-4 h-4" /> Shortlisted
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" /> Shortlist
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
