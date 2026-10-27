import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { formatDateIndian, calculateDaysBetween, getAgeingBucket } from "@/lib/formatters";
import {
  FileText,
  Clock,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Building2,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();
  const simulatedDateStr = simulatedDate.toISOString();

  // Scoping queries
  const whereApp: Record<string, unknown> = {};
  if (user.role === "INSTITUTION") {
    whereApp.institutionId = user.institutionId || "inst-101";
  } else if (user.role === "REGIONAL_OFFICER" && user.region && user.region !== "ALL") {
    whereApp.region = user.region;
  }

  const applications = await prisma.application.findMany({
    where: whereApp,
    orderBy: { submittedAt: "desc" },
  });

  // KPI Calculations
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) =>
    ["PENDING", "IN_REVIEW", "READY_FOR_DECISION"].includes(a.status)
  ).length;

  let overdueCount = 0;
  const stageCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {
    North: 0,
    South: 0,
    West: 0,
    East: 0,
    Central: 0,
  };
  const ageingCounts: Record<string, number> = {
    "0-15": 0,
    "16-30": 0,
    "31-60": 0,
    "60+": 0,
  };
  const officerCaseload: Record<string, number> = {};
  const stageAgeTotal: Record<string, { totalDays: number; count: number }> = {};

  for (const app of applications) {
    const daysInStage = calculateDaysBetween(app.stageStartedAt, simulatedDate);
    const bucket = getAgeingBucket(daysInStage);
    ageingCounts[bucket] = (ageingCounts[bucket] || 0) + 1;

    // Track active stages
    stageCounts[app.currentStage] = (stageCounts[app.currentStage] || 0) + 1;

    if (["PENDING", "IN_REVIEW", "READY_FOR_DECISION"].includes(app.status)) {
      if (daysInStage > 30 || app.status === "DEFICIENCY_REVERTED") {
        overdueCount++;
      }
      if (app.region in regionCounts) {
        regionCounts[app.region] = (regionCounts[app.region] || 0) + 1;
      }
      const officer = app.assignedOfficerName || "Regional Desk";
      officerCaseload[officer] = (officerCaseload[officer] || 0) + 1;

      // Track dwell time for bottleneck analysis
      if (!stageAgeTotal[app.currentStage]) {
        stageAgeTotal[app.currentStage] = { totalDays: 0, count: 0 };
      }
      stageAgeTotal[app.currentStage].totalDays += daysInStage;
      stageAgeTotal[app.currentStage].count += 1;
    }
  }

  // Calculate bottleneck stage
  let bottleneckStage: { stage: string; count: number; avgDays: number } | null = null;
  let maxBottleneckScore = -1;

  for (const [stg, data] of Object.entries(stageAgeTotal)) {
    if (data.count > 0) {
      const avg = Math.round(data.totalDays / data.count);
      const score = data.count * 1.5 + avg * 2;
      if (score > maxBottleneckScore) {
        maxBottleneckScore = score;
        bottleneckStage = { stage: stg, count: data.count, avgDays: avg };
      }
    }
  }

  // Count items due in next 7 days (EVC visits + Undertakings)
  const sevenDaysAhead = new Date(simulatedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueEvcs = await prisma.eVCRecord.count({
    where: {
      scheduledDate: {
        gte: simulatedDate,
        lte: sevenDaysAhead,
      },
      status: { in: ["UPCOMING", "DUE"] },
      ...(user.role === "REGIONAL_OFFICER" && user.region ? { region: user.region } : {}),
    },
  });

  const dueUndertakings = await prisma.undertaking.count({
    where: {
      dueDate: {
        gte: simulatedDate,
        lte: sevenDaysAhead,
      },
      status: "PENDING",
      ...(user.role === "INSTITUTION" && user.institutionId ? { institutionId: user.institutionId } : {}),
    },
  });

  const dueIn7Days = dueEvcs + dueUndertakings;

  // Format chart data arrays
  const stageData = Object.entries(stageCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const regionData = Object.entries(regionCounts).map(([region, count]) => ({
    region,
    count,
  }));

  const ageingData = Object.entries(ageingCounts).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  const officerData = Object.entries(officerCaseload)
    .slice(0, 6)
    .map(([officer, count]) => ({
      officer: officer.split(" ")[0] + " (" + officer.split(" ").slice(-1)[0] + ")",
      count,
    }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Approval Workflow & Pendency Monitoring
            </h2>
            <span className="bg-blue-100 text-gov-blue text-xs font-semibold px-2 py-0.5 rounded">
              AY 2026-27
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status monitoring, stage ageing analysis, and compliance escalation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-gov-blue shrink-0" />
          <span>
            Simulated System Date: <strong>{formatDateIndian(simulatedDate)}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{totalApps}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Scope: {user.role === "INSTITUTION" ? "My Institution" : user.region ? `${user.region} Region` : "Pan-India"}</span>
          </div>
        </div>

        {/* KPI 2: Pending Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Pending in Pipeline
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">{pendingApps}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>{Math.round((pendingApps / (totalApps || 1)) * 100)}% of total proposals</span>
          </div>
        </div>

        {/* KPI 3: Overdue Cases (>30d / Reverted) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Overdue / Escalated
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">{overdueCount}</div>
          <div className="text-xs text-rose-700/80 font-medium mt-1">
            <span>Stage dwell &gt; 30d or reverted</span>
          </div>
        </div>

        {/* KPI 4: Due in 7 Days */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Due in Next 7 Days
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2 font-mono">{dueIn7Days}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>{dueEvcs} EVCs + {dueUndertakings} Undertakings</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Module */}
      <DashboardCharts
        stageData={stageData}
        regionData={regionData}
        ageingData={ageingData}
        officerData={officerData}
        bottleneckStage={bottleneckStage}
      />

      {/* Filterable Applications Movement Register Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Institutional Proposals & Active Movements
          </h3>
          <span className="text-xs text-slate-500">
            Interactive Filterable Register ({applications.length} total)
          </span>
        </div>

        <ApplicationsTable
          applications={applications.map((a) => ({
            id: a.id,
            applicationNumber: a.applicationNumber,
            institutionName: a.institutionName,
            region: a.region,
            applicationType: a.applicationType,
            currentStage: a.currentStage,
            status: a.status,
            assignedOfficerName: a.assignedOfficerName,
            stageStartedAt: a.stageStartedAt.toISOString(),
            submittedAt: a.submittedAt.toISOString(),
            isNewInstitution: a.isNewInstitution,
          }))}
          simulatedDate={simulatedDateStr}
          isRoleRestricted={user.role === "INSTITUTION" || user.role === "REGIONAL_OFFICER"}
        />
      </div>
    </div>
  );
}
