"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const RANKING_DATA = [
  { range: "Top 10", count: 120 },
  { range: "Top 50", count: 450 },
  { range: "Top 100", count: 800 },
  { range: "Top 500", count: 1500 },
];

const SCHOLARSHIP_DATA = [
  { name: "Full Ride", value: 15, color: "#facc15" },
  { name: "Partial", value: 45, color: "#2dd4bf" },
  { name: "Small Grant", value: 25, color: "#60a5fa" },
  { name: "None", value: 15, color: "#94a3b8" },
];

export function GlobalImpact() {
  return (
    <section className="py-24 bg-navy-900 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Real Impact, Real Data</h2>
          <p className="text-gray-400">
            Analyzing over 50,000 successful applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Chart 1: University Placements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-2xl border border-white/5"
          >
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="w-1 h-6 bg-teal-500 rounded-full" />
              Global Placements
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Students admitted to top-ranked institutions worldwide
            </p>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={RANKING_DATA}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value} Students`, "Admitted"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#2dd4bf"
                    radius={[4, 4, 0, 0]}
                    barSize={50}
                  >
                    {RANKING_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#14b8a6" : "#2dd4bf"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Scholarship Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-2xl border border-white/5"
          >
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold-400 rounded-full" />
              Scholarship Success
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Percentage of students receiving financial aid
            </p>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-[250px] w-[250px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SCHOLARSHIP_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {SCHOLARSHIP_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}%`, "share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">85%</span>
                  <span className="text-xs text-gray-400">Received Aid</span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="flex-1 w-full space-y-4">
                {SCHOLARSHIP_DATA.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-white font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
