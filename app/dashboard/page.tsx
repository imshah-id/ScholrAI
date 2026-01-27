"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  UserCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProfileRadar, ReadinessGraph } from "@/components/dashboard/Charts";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Scholar");
  const [stage, setStage] = useState("Discovery");
  const [stats, setStats] = useState({
    strength: 0,
    chance: 0,
    readiness: "Low",
  });

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.fullName) setUserName(data.fullName.split(" ")[0]);
        if (data.currentStage) setStage(data.currentStage);

        // Stats from API
        const strength = data.profileStrength || 0;
        const chance = data.admissionChance || 0;

        let readiness = "Low";
        if (strength > 75) readiness = "High";
        else if (strength > 40) readiness = "Medium";

        setStats({ strength, chance, readiness });
      })
      .catch((err) => console.error(err));
  }, []);

  const steps = [
    {
      id: 1,
      name: "Build Profile",
      status: "completed",
      link: "/dashboard/profile",
    },
    {
      id: 2,
      name: "Discover Universities",
      status: "active",
      link: "/dashboard/universities",
    },
    {
      id: 3,
      name: "Shortlist",
      status: "locked",
      link: "/dashboard/shortlist",
    },
    {
      id: 4,
      name: "Application Guidance",
      status: "locked",
      link: "/dashboard/guidance",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Good Evening, {userName}</h1>
          <p className="text-gray-400">
            You are currently in{" "}
            <span className="text-primary font-bold">Stage 2: {stage}</span>.
          </p>
        </div>
        <Link href="/dashboard/counsellor" className="hidden md:block">
          <button className="bg-gradient-to-r from-teal-500 to-teal-400 hover:scale-105 transition-transform text-navy-900 font-bold px-6 py-2 rounded-lg shadow-lg shadow-teal-500/20">
            Ask AI Counsellor
          </button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Profile Strength
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.strength}%
              </div>
              <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000"
                  style={{ width: `${stats.strength}%` }}
                />
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Readiness
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.readiness}
              </div>
              <div className="text-xs text-green-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Trending Up
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-20 h-20 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Acceptance Odds
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.chance}%
              </div>
              <div className="text-xs text-gray-500">Avg. for targets</div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Recommended Next
              Steps
            </h3>
            <div className="space-y-3">
              {stage === "DISCOVERY" && (
                <Link href="/dashboard/universities">
                  <div className="p-4 rounded-xl bg-navy-800/50 border border-white/5 hover:border-primary/30 hover:bg-navy-800 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-bold group-hover:text-primary transition-colors">
                          Shortlist 3 Universities
                        </div>
                        <div className="text-xs text-gray-400">
                          Find ambitious, target, and safe schools.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              )}
              {stage === "SHORTLIST" && (
                <Link href="/dashboard/shortlist">
                  <div className="p-4 rounded-xl bg-navy-800/50 border border-white/5 hover:border-green-500/30 hover:bg-navy-800 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                        !
                      </div>
                      <div>
                        <div className="font-bold group-hover:text-green-400 transition-colors">
                          Lock Your First Choice
                        </div>
                        <div className="text-xs text-gray-400">
                          Commit to a university to unlock specific guidance
                          tasks.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </div>
                </Link>
              )}
              {stage === "GUIDANCE" && (
                <Link href="/dashboard/guidance">
                  <div className="p-4 rounded-xl bg-navy-800/50 border border-white/5 hover:border-teal-500/30 hover:bg-navy-800 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-bold group-hover:text-teal-400 transition-colors">
                          Start Reviewing Requirements
                        </div>
                        <div className="text-xs text-gray-400">
                          Check document checklist for your locked university.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 transition-colors" />
                  </div>
                </Link>
              )}

              <Link href="/dashboard/profile">
                <div className="p-4 rounded-xl bg-navy-800/50 border border-white/5 hover:border-purple-500/30 hover:bg-navy-800 transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                      +
                    </div>
                    <div>
                      <div className="font-bold group-hover:text-purple-400 transition-colors">
                        Boost Profile Strength
                      </div>
                      <div className="text-xs text-gray-400">
                        Add more details to increase your admission chances.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>

          {/* Readiness Graph */}
          <div className="glass p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Readiness Timeline</h3>
              <span className="text-xs bg-navy-800 px-2 py-1 rounded text-gray-400">
                Last 30 Days
              </span>
            </div>
            <ReadinessGraph stage={stage} />
          </div>
        </div>

        {/* Right Column: Radar & Deadlines (1/3 width) */}
        <div className="space-y-6">
          {/* Profile Radar Chart */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2 self-start">
              Profile Breakdown
            </h3>
            <ProfileRadar strength={stats.strength} />
            <div className="mt-4 text-center text-xs text-gray-400">
              Your profile is strong in{" "}
              <span className="text-teal-400 font-bold">GPA</span> but needs
              work in <span className="text-pink-400 font-bold">Essays</span>.
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-400" /> Upcoming
            </h3>
            <div className="space-y-4">
              {/* Mock Data for MVP */}
              <div className="flex items-center gap-3">
                <div className="text-center bg-navy-800 rounded-lg p-2 min-w-[50px]">
                  <div className="text-xs text-red-400 font-bold">DEC</div>
                  <div className="text-lg font-bold">15</div>
                </div>
                <div>
                  <div className="font-bold text-sm">Early Action Deadline</div>
                  <div className="text-xs text-gray-400">
                    Stanford University
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center bg-navy-800 rounded-lg p-2 min-w-[50px]">
                  <div className="text-xs text-orange-400 font-bold">JAN</div>
                  <div className="text-lg font-bold">01</div>
                </div>
                <div>
                  <div className="font-bold text-sm">Regular Decision</div>
                  <div className="text-xs text-gray-400">MIT & Harvard</div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <div className="text-center bg-navy-800 rounded-lg p-2 min-w-[50px]">
                  <div className="text-xs text-blue-400 font-bold">FEB</div>
                  <div className="text-lg font-bold">15</div>
                </div>
                <div>
                  <div className="font-bold text-sm">Scholarship App</div>
                  <div className="text-xs text-gray-400">Global Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="glass p-8 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold mb-6">Application Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <Link
              href={step.status === "locked" ? "#" : step.link}
              key={step.id}
            >
              <div
                className={`
                            relative p-6 rounded-xl border border-dashed transition-all h-full flex flex-col justify-between
                            ${step.status === "completed" ? "bg-green-500/10 border-green-500/30 text-green-400" : ""}
                            ${step.status === "active" ? "bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(250,204,21,0.1)] scale-105 transform z-10" : ""}
                            ${step.status === "locked" ? "bg-navy-800/50 border-white/5 text-gray-600 cursor-not-allowed" : "hover:border-white/30 cursor-pointer"}
                        `}
              >
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1">
                    Step {step.id}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {step.name}
                  </div>
                </div>

                <div className="self-end">
                  {step.status === "completed" && (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                  {step.status === "active" && (
                    <ArrowRight className="w-6 h-6 animate-pulse" />
                  )}
                  {step.status === "locked" && <Lock className="w-6 h-6" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
