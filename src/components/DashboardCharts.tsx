"use client";

import React from "react";
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

interface ChartsProps {
  stageData: { name: string; count: number }[];
  regionData: { region: string; count: number }[];
  ageingData: { bucket: string; count: number }[];
  officerData: { officer: string; count: number }[];
  bottleneckStage: { stage: string; count: number; avgDays: number } | null;
}

const AGEING_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];
const REGION_COLORS = ["#005ea2", "#0d9488", "#6366f1", "#8b5cf6", "#ec4899"];

export function DashboardCharts({
  stageData,
  regionData,
  ageingData,
  officerData,
  bottleneckStage,
}: ChartsProps) {
  return (
    <div className="space-y-6">
      {/* Bottleneck Stage Highlight Alert */}
      {bottleneckStage && bottleneckStage.count > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                System Bottleneck Detected: {bottleneckStage.stage} Stage
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Currently holding <strong className="text-rose-700">{bottleneckStage.count} applications</strong> with an average dwell time of{" "}
                <strong className="text-rose-700">{bottleneckStage.avgDays} days</strong>. Regional review and committee dispatch recommended.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-rose-100 text-rose-800 font-semibold text-xs rounded-full border border-rose-300">
            Action Priority High
          </span>
        </div>
      )}

      {/* Grid of 4 Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Stage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Applications by Stage Pipeline
            </h3>
            <span className="text-[11px] text-slate-400">AY 2026-27 Distribution</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#005ea2" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ageing Buckets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Application Ageing Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Elapsed Days in Current Stage</span>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center">
            <div className="h-full w-full md:w-3/5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="bucket"
                  >
                    {ageingData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={AGEING_COLORS[index % AGEING_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-2/5 space-y-2 mt-2 md:mt-0 px-2">
              {ageingData.map((d, i) => (
                <div key={d.bucket} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: AGEING_COLORS[i % AGEING_COLORS.length] }}
                    />
                    <span className="text-slate-600">{d.bucket} days</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.count} apps</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Region-wise Pendency */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Region-Wise Pendency Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Pan-India 5 Regions</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Pending Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Officer Workload Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Officer Workload & Docket Allocation
            </h3>
            <span className="text-[11px] text-slate-400">Active Cases per Officer</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={officerData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  dataKey="officer"
                  type="category"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} name="Assigned Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
