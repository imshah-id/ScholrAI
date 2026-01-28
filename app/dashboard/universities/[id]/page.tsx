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
  Loader2,
} from "lucide-react";

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
    try {
      const res = await fetch(`/api/universities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUni(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkShortlist = async () => {
    // Optimization: In a real app we might check specific ID or load all shortlist IDs once
    // For now reusing the list endpoint or checking if we store it.
    // Actually, let's just assume we can fetch the user's shortlist status from updated API or list
    // For simplicity MVP, we'll fetch list and find.
    // Ideally we update the Detail API to include "isShortlisted" boolean.
    // Let's stick to the current "fetch all ids" pattern used in list view for consistency.
    try {
      const res = await fetch("/api/shortlist");
      if (res.ok) {
        const data = await res.json();
        const exists = data.some((item: any) => item.universityId === id);
        setShortlisted(exists);
      }
    } catch (e) {}
  };

  const handleShortlist = async () => {
    // Toggle logic if we supported remove, but currently only add
    if (shortlisted) return;

    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId: id }),
      });
      if (res.ok) {
        setShortlisted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Discovery
      </button>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-white/10 overflow-hidden relative"
      >
        <div className="h-48 bg-gradient-to-r from-navy-800 to-primary/20 relative">
          <div className="absolute inset-0 bg-black/20" />

          {/* Rank Badge */}
          <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-400" />
            <span className="text-white font-bold">
              Global Rank #{uni.rank}
            </span>
          </div>

          <div className="absolute -bottom-10 left-8 md:left-12 flex items-end gap-6">
            <div className="w-24 h-24 rounded-2xl bg-navy-900 border-4 border-navy-950 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {uni.name.charAt(0)}
            </div>
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white shadow-sm">
                {uni.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" /> {uni.location}
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 bg-navy-900/50" />
      </motion.div>

      {/* Quick Stats & Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-xl border border-white/5 text-center">
            <div className="text-gray-400 text-xs uppercase mb-1">Tuition</div>
            <div className="text-xl font-bold text-green-400">{uni.fees}</div>
          </div>
          <div className="glass p-4 rounded-xl border border-white/5 text-center">
            <div className="text-gray-400 text-xs uppercase mb-1">
              Acceptance
            </div>
            <div className="text-xl font-bold text-white">
              {uni.acceptanceRate}
            </div>
          </div>
          <div className="glass p-4 rounded-xl border border-white/5 text-center">
            <div className="text-gray-400 text-xs uppercase mb-1">Type</div>
            <div className="text-xl font-bold text-white">Public</div>
          </div>
          <div className="glass p-4 rounded-xl border border-white/5 text-center">
            <div className="text-gray-400 text-xs uppercase mb-1">Language</div>
            <div className="text-xl font-bold text-white">English</div>
          </div>
        </div>

        <div className="w-full md:w-64">
          <button
            onClick={handleShortlist}
            disabled={shortlisted}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              shortlisted
                ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                : "bg-primary text-navy-900 hover:bg-gold-400 shadow-lg hover:shadow-primary/20"
            }`}
          >
            {shortlisted ? (
              <>
                <Check className="w-5 h-5" /> Shortlisted
              </>
            ) : (
              <>
                <Star className="w-5 h-5" /> Add to Shortlist
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT: AI ANALYSIS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 space-y-6"
        >
          <div className="glass p-8 rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-navy-900/50 to-navy-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />

            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" /> AI Match Analysis
            </h2>

            <div className="flex items-start gap-8">
              {/* Match Ring */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="none"
                  />
                  <motion.circle
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: score / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={
                      isSafe ? "#22c55e" : isTarget ? "#eab308" : "#ef4444"
                    }
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    className="drop-shadow-lg"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {score}%
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${isSafe ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {matchData.match_category}
                  </span>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-medium text-gray-300">
                  Why this matches you:
                </h3>
                {matchData.why_it_fits?.map((reason: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5"
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{reason}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* University Description (Mock) */}
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" /> About the Program
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {uni.name} offers a world-class environment for students pursuing{" "}
              {matchData.targetDegree || "higher education"}. With a ranking of
              #{uni.rank}, it stands out for its research excellence and global
              reputation. Located in {uni.location}, it provides a vibrant
              cultural setting alongside rigorous academic training.
            </p>
          </div>
        </motion.div>

        {/* RIGHT: DETAILS SIDEBAR */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">
              Estimated Costs
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-300">Tuition (Annual)</span>
                <span className="font-bold">{uni.fees}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-300">Living (Est.)</span>
                <span className="font-bold text-gray-400">$15k - $20k</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white font-bold">Total</span>
                <span className="font-bold text-green-400">
                  ~{uni.fees} + Living
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">
              Admission Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Acceptance Rate</span>
                <span className="font-bold text-white">
                  {uni.acceptanceRate}
                </span>
              </div>
              <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: uni.acceptanceRate }}
                  className="h-full bg-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Admission is competitive. High GPA and strong test scores are
                recommended.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
