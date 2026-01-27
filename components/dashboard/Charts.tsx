"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function ProfileRadar({ strength }: { strength: number }) {
  // Mock data breakdown derived from single strength score for MVP
  const data = [
    { subject: "GPA", A: Math.min(100, strength * 1.2), fullMark: 100 },
    { subject: "Tests", A: Math.min(100, strength * 0.9), fullMark: 100 },
    { subject: "Projects", A: Math.min(100, strength * 1.1), fullMark: 100 },
    { subject: "Essays", A: Math.min(100, strength * 0.8), fullMark: 100 },
    { subject: "Experience", A: Math.min(100, strength), fullMark: 100 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Profile"
            dataKey="A"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="#14b8a6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReadinessGraph({ stage }: { stage: string }) {
  const data = [
    { name: "Week 1", score: 20 },
    { name: "Week 2", score: 35 },
    { name: "Week 3", score: 45 },
    { name: "Week 4", score: 60 },
    {
      name: "Current",
      score: stage === "GUIDANCE" ? 85 : stage === "SHORTLIST" ? 50 : 30,
    },
  ];

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#334155",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#facc15" }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#facc15"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
