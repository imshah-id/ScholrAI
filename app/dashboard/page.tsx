"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Scholar");
  const [stage, setStage] = useState("Discovery");

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.fullName) setUserName(data.fullName.split(" ")[0]);
        if (data.currentStage) setStage(data.currentStage);
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
        <Link href="/dashboard/counsellor">
          <button className="bg-gradient-to-r from-teal-500 to-teal-400 hover:scale-105 transition-transform text-navy-900 font-bold px-6 py-2 rounded-lg shadow-lg shadow-teal-500/20">
            Ask AI Counsellor
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <BookOpen />
            </div>
            <div>
              <div className="text-sm text-gray-400">Profile Strength</div>
              <div className="text-2xl font-bold text-white">85%</div>
            </div>
          </div>
          <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[85%]" />
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <UserCheck />
            </div>
            <div>
              <div className="text-sm text-gray-400">Readiness Score</div>
              <div className="text-2xl font-bold text-white">High</div>
            </div>
          </div>
          <div className="text-xs text-green-400 font-mono">
            +12% from last week
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
              <TrendingUp />
            </div>
            <div>
              <div className="text-sm text-gray-400">Admission Chance</div>
              <div className="text-2xl font-bold text-white">72%</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Based on target universities
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
