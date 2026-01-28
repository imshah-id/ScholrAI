"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-xs font-medium text-teal-300 tracking-wide uppercase">
              AI-Powered Admissions
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Navigate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              Global Education
            </span>
            <br /> Path
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            AI-driven analysis to optimize your university applications, match
            you with scholarships, and maximize your acceptance chances.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/signup">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:border-primary/50 text-white px-8 py-4 rounded-xl backdrop-blur-md transition-all group">
                <Compass className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" />
                <span className="font-semibold">Start Free Assessment</span>
              </button>
            </Link>
            <Link href="/about">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-400 hover:text-white px-8 py-4 transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 border-t border-white/5">
            {[
              { label: "Success Rate", value: "98%" },
              { label: "Universities", value: "1.2k+" },
              { label: "Scholarships", value: "$5M+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Visual (Mock Dashboard Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 glass-card rounded-2xl p-6 border border-white/10 bg-navy-800/50">
            {/* Header Mock */}
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">
                  Global University Acceptance
                </div>
                <div className="text-lg font-semibold text-primary">
                  Trends & Predictions
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
            </div>

            {/* Premium Area Chart Mock */}
            <div className="h-64 w-full relative p-4 border-b border-l border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { year: "2020", rate: 35 },
                    { year: "2021", rate: 45 },
                    { year: "2022", rate: 40 },
                    { year: "2023", rate: 65 },
                    { year: "2024", rate: 60 },
                    { year: "2025", rate: 85 },
                    { year: "2026", rate: 95 },
                  ]}
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    itemStyle={{ color: "#2dd4bf" }}
                    cursor={{
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#2dd4bf"
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
