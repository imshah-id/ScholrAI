"use client";

import { motion } from "framer-motion";
import { Trash2, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAlert } from "@/components/ui/AlertSystem";
import { useRouter } from "next/navigation";

export default function ShortlistPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleLock = async (
    shortlistId: string,
    universityId: string,
    lockStatus: boolean,
  ) => {
    setActionLoading(shortlistId);
    try {
      const res = await fetch("/api/shortlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, isLocked: lockStatus }),
      });

      if (res.ok) {
        setLockedId(lockStatus ? universityId : null);
        // Refresh list locally
        setShortlist((prev) =>
          prev.map((item) =>
            item.universityId === universityId
              ? { ...item, isLocked: lockStatus }
              : item,
          ),
        );

        // Show success alert
        if (lockStatus) {
          showAlert("University Locked Successfully!", "success");
        } else {
          showAlert("University Unlocked", "info");
        }
      }
    } catch (error) {
      console.error("Failed to update lock status", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-gray-400">Loading shortlist...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Your Shortlist</h1>
          <p className="text-sm md:text-base text-gray-400">
            Select and lock a university to unlock Application Guidance.
          </p>
        </div>
        <div className="bg-primary/20 text-primary px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 border border-primary/20 whitespace-nowrap">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {lockedId
              ? "University Locked"
              : "Action Required: Lock 1 University"}
          </span>
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
              className={`glass p-4 md:p-6 rounded-xl border transition-all cursor-default group hover:shadow-xl hover:shadow-purple-500/10 ${
                lockedId === item.universityId
                  ? "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* University Info */}
                <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-white shrink-0 ${
                      lockedId === item.universityId
                        ? "bg-green-500"
                        : "bg-navy-800"
                    }`}
                  >
                    {item.university.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold truncate">
                      {item.university.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {item.university.location}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  {lockedId === item.universityId ? (
                    <>
                      <span className="hidden md:flex text-green-400 font-bold items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Locked
                      </span>
                      <Link
                        href="/dashboard/guidance"
                        className="flex-1 md:flex-none"
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full md:w-auto bg-green-500 text-navy-900 font-bold px-4 py-2 text-sm rounded-lg hover:bg-green-400 transition-colors cursor-pointer"
                        >
                          Guidance
                        </motion.button>
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleLock(item.id, item.universityId, false)
                        }
                        className="bg-navy-800 text-gray-400 font-bold px-4 py-2 text-sm rounded-lg hover:text-white hover:bg-navy-700 transition-colors border border-white/10 flex items-center gap-2 cursor-pointer"
                        disabled={!!actionLoading}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        {actionLoading === item.id ? "..." : "Unlock"}
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleLock(item.id, item.universityId, true)
                        }
                        disabled={lockedId !== null || !!actionLoading}
                        className={`flex items-center justify-center gap-2 font-bold px-4 py-2 text-sm rounded-lg transition-colors flex-1 md:flex-none ${
                          lockedId !== null
                            ? "opacity-50 cursor-not-allowed bg-white/5 text-gray-400"
                            : "bg-primary text-navy-900 hover:bg-gold-400 shadow-lg shadow-primary/10 cursor-pointer"
                        }`}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span className="hidden md:inline">
                          {actionLoading === item.id ? "Locking..." : "Lock"}
                        </span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeItem(item.universityId)}
                        disabled={!!actionLoading}
                        className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
