"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Star,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  BookOpen,
} from "lucide-react";
import {
  containerStagger,
  slideUp,
  slideInLeft,
  slideInRight,
} from "@/lib/animations";
import UniversityDetailsSkeleton from "@/components/dashboard/UniversityDetailsSkeleton";

export default function UniversityDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [uni, setUni] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetails();
      checkShortlist();
    }
  }, [id]);

  const fetchDetails = async () => {
    const cacheKey = `scholrai_uni_details_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        setUni(JSON.parse(cached));
        setLoading(false);
        return;
      } catch (e) {}
    }

    try {
      const res = await fetch(`/api/universities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUni(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));

        // AI ENRICHMENT TRIGGER
        // If external or missing critical data (fees is "$0"), trigger enrichment
        if (data.fees === "$0" || data.rank === 999) {
          triggerEnrichment(data.id, data.name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerEnrichment = async (uniId: string, uniName: string) => {
    // Don't await this blocking UI, do it in background and update state
    console.log("Triggering AI Enrichment...");
    try {
      const res = await fetch("/api/universities/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId: uniId, universityName: uniName }),
      });
      if (res.ok) {
        const enriched = await res.json();
        // Merge and Update State
        setUni((prev: any) => ({ ...prev, ...enriched.data }));
        // Update Cache
        sessionStorage.setItem(
          `scholrai_uni_details_${uniId}`,
          JSON.stringify(enriched.data),
        );
      }
    } catch (e) {
      console.error("Enrichment failed", e);
    }
  };

  const checkShortlist = async () => {
    // CACHE CHECK: Use global shortlist cache if available
    const cachedShortlist = sessionStorage.getItem("scholrai_shortlist_ids");
    if (cachedShortlist) {
      try {
        const ids = JSON.parse(cachedShortlist);
        if (ids.includes(id)) {
          setShortlisted(true);
          return; // Assume cache is reliable enough for initial render
        }
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/shortlist");
      if (res.ok) {
        const data = await res.json();
        const exists = data.some((item: any) => item.universityId === id);
        setShortlisted(exists);

        // Update/Create cache
        const allIds = data.map((item: any) => item.universityId);
        sessionStorage.setItem(
          "scholrai_shortlist_ids",
          JSON.stringify(allIds),
        );
      }
    } catch (e) {}
  };

  const handleShortlist = async () => {
    if (shortlisted) return;

    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId: id }),
      });
      if (res.ok) {
        setShortlisted(true);

        // Update Cache
        const cached = sessionStorage.getItem("scholrai_shortlist_ids");
        if (cached) {
          try {
            const ids = JSON.parse(cached);
            const newIds = [...ids, id];
            sessionStorage.setItem(
              "scholrai_shortlist_ids",
              JSON.stringify(newIds),
            );
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <UniversityDetailsSkeleton />;
  }

  if (!uni) {
    return (
      <div className="text-center text-white p-10">University not found</div>
    );
  }

  const matchData = uni.matchData || {};
  const score = matchData.score || 0;
  const isSafe = score >= 80;
  const isTarget = score >= 50 && score < 80;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="font-medium">Back to Discovery</span>
      </motion.button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl shadow-black/20"
      >
        <div className="h-64 bg-linear-to-br from-navy-800 via-primary/10 to-navy-900 relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-linear-to-t from-navy-900 via-transparent to-transparent" />

          {/* Global Rank Badge */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-bold text-white tracking-wide uppercase">
                Global Rank #{uni.rank}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row items-end gap-6 z-10">
            <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-navy-800 to-black border-4 border-navy-900 shadow-2xl flex items-center justify-center mb-0 relative z-20">
              <span className="text-5xl font-bold text-white opacity-90">
                {uni.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {uni.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{uni.location}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">
                    Public Research University
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto mb-2">
              <button
                onClick={handleShortlist}
                disabled={shortlisted}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                  shortlisted
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                    : "bg-primary text-navy-900 hover:bg-gold-400 hover:scale-105 active:scale-95"
                }`}
              >
                {shortlisted ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Shortlist
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" /> Shortlist This University
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="h-12 bg-navy-900/40" />
      </motion.div>

      {/* Main Content Grid (Symmetric) */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8"
      >
        {/* LEFT COLUMN: The "Fit" & Academics */}
        <motion.div
          variants={slideUp}
          className="space-y-6 flex flex-col h-full"
        >
          {/* AI Match Card */}
          <motion.div
            variants={slideInLeft}
            className="glass p-8 rounded-3xl border border-white/5 bg-linear-to-br from-purple-900/20 to-navy-900/50 overflow-hidden relative"
          >
            {/* Decorative Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full" />

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-5 h-5 text-purple-400" /> AI Feasibility
              Analysis
            </h2>

            <div className="flex items-center gap-8 relative z-10">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke={
                      isSafe ? "#4ade80" : isTarget ? "#facc15" : "#f87171"
                    }
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {score}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Match
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isSafe ? "bg-green-500/20 text-green-400 border-green-500/30" : isTarget ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                >
                  {matchData.match_category}
                </div>
                <div className="space-y-2">
                  {matchData.why_it_fits?.map((reason: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                      <span className="leading-snug">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Academic Programs (Mock) */}
          <motion.div
            variants={slideInLeft}
            className="glass p-8 rounded-3xl border border-white/5 space-y-6 flex-1 flex flex-col"
          >
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" /> Academic
                Strengths
              </h2>

              <p className="text-gray-400 leading-relaxed text-sm mt-4">
                Known for consistent research output and industry connections.{" "}
                {uni.name} is particularly renowned for its engineering and
                sciences faculities.
              </p>
            </div>

            <div className="space-y-4 mt-auto">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Popular Majors
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Computer Science",
                  "Mechanical Eng",
                  "Business Analytics",
                  "Psychology",
                ].map((major) => (
                  <motion.span
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                    key={major}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300 hover:text-white transition-colors cursor-default"
                  >
                    {major}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: Logistics & Stats */}
        <motion.div
          variants={slideUp}
          className="space-y-6 flex flex-col h-full"
        >
          {/* Admissions Card */}
          <motion.div
            variants={slideInRight}
            className="glass p-8 rounded-3xl border border-white/5 space-y-6"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Admissions
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-navy-900/50 p-4 rounded-2xl border border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                  Acceptance Rate
                </div>
                <div className="text-2xl font-bold text-white">
                  {uni.acceptanceRate || "N/A"}
                </div>
                <div className="text-xs text-blue-400 mt-1">Selective</div>
              </div>
              <div className="bg-navy-900/50 p-4 rounded-2xl border border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                  Your Odds
                </div>
                <div
                  className={`text-2xl font-bold ${matchData.acceptance_chance === "High" ? "text-green-400" : "text-yellow-400"}`}
                >
                  {matchData.acceptance_chance || "Medium"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Based on stats</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-gray-400">Application Deadline</span>
                <span className="text-white font-medium">Jan 15, 2026</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-gray-400">Application Fee</span>
                <span className="text-white font-medium">$85</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-gray-400">Standardized Tests</span>
                <span className="text-white font-medium">Optional</span>
              </div>
            </div>
          </motion.div>

          {/* Financials Card */}
          <motion.div
            variants={slideInRight}
            className="glass p-8 rounded-3xl border border-white/5 space-y-6 flex-1 flex flex-col justify-between"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Costs & Aid
            </h2>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-white">{uni.fees}</span>
              <span className="text-sm text-gray-400 mb-1.5">
                / year approx.
              </span>
            </div>

            <div className="space-y-3">
              {/* Progress bar visual for cost */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Affordability (vs Budget)
                  </span>
                  <span className="text-green-400 font-bold">Good</span>
                </div>
                <div className="w-full bg-navy-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[80%]" />
                </div>
              </div>

              <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 mt-4">
                <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <Star className="w-3 h-3" /> Merit Scholarship
                </h4>
                <p className="text-xs text-gray-400">
                  Based on your GPA ({score > 70 ? "High" : "Good"}), you may
                  qualify for up to{" "}
                  <span className="text-white font-bold">$15,000</span> in merit
                  aid.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
