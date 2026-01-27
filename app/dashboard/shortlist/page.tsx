"use client";

import { motion } from "framer-motion";
import { Trash2, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedId, setLockedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShortlist();
  }, []);

  const fetchShortlist = async () => {
    try {
      const res = await fetch("/api/shortlist");
      if (res.ok) {
        const data = await res.json();
        setShortlist(data);
        const locked = data.find((item: any) => item.isLocked);
        if (locked) setLockedId(locked.universityId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (universityId: string) => {
    try {
      await fetch("/api/shortlist", {
        method: "DELETE",
        body: JSON.stringify({ universityId }),
      });
      setShortlist((prev) =>
        prev.filter((item) => item.universityId !== universityId),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleLock = async (shortlistId: string, universityId: string) => {
    try {
      const res = await fetch("/api/shortlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, isLocked: true }),
      });

      if (res.ok) {
        setLockedId(universityId);
        // Refresh list to update UI state if needed, but local update is faster
        setShortlist((prev) =>
          prev.map((item) =>
            item.universityId === universityId
              ? { ...item, isLocked: true }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to lock university", error);
    }
  };

  if (loading) return <div className="text-gray-400">Loading shortlist...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Shortlist</h1>
          <p className="text-gray-400">
            Select and lock a university to unlock Application Guidance.
          </p>
        </div>
        <div className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-primary/20">
          <AlertCircle className="w-4 h-4" />
          {lockedId
            ? "University Locked"
            : "Action Required: Lock 1 University"}
        </div>
      </div>

      {shortlist.length === 0 ? (
        <div className="text-gray-500 py-10 text-center glass rounded-xl">
          No universities shortlisted yet. Go to{" "}
          <Link
            href="/dashboard/universities"
            className="text-primary hover:underline"
          >
            Discovery
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4">
          {shortlist.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass p-6 rounded-xl border flex items-center justify-between transition-all ${
                lockedId === item.universityId
                  ? "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-6">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                    lockedId === item.universityId
                      ? "bg-green-500"
                      : "bg-navy-800"
                  }`}
                >
                  {item.university.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.university.name}</h3>
                  <p className="text-gray-400">{item.university.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Note: Match score is not in DB yet, hiding or defaulting */}

                {lockedId === item.universityId ? (
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Locked for Application
                    </span>
                    <Link href="/dashboard/guidance">
                      <button className="bg-green-500 text-navy-900 font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors">
                        Go to Guidance
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLock(item.id, item.universityId)}
                      disabled={lockedId !== null}
                      className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors ${
                        lockedId !== null
                          ? "opacity-50 cursor-not-allowed bg-white/5 text-gray-400"
                          : "bg-primary text-navy-900 hover:bg-gold-400 shadow-lg shadow-primary/10"
                      }`}
                    >
                      <Lock className="w-4 h-4" />{" "}
                      {lockedId !== null ? "Locked" : "Lock"}
                    </button>
                    <button
                      onClick={() => removeItem(item.universityId)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
