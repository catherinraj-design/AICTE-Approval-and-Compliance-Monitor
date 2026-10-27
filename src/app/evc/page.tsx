import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { EvcManagementClient } from "@/components/EvcManagementClient";
import { Calendar, Users2, AlertTriangle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EvcPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

  const whereEvc: Record<string, unknown> = {};
  if (user.role === "REGIONAL_OFFICER" && user.region && user.region !== "ALL") {
    whereEvc.region = user.region;
  }

  const evcRecords = await prisma.eVCRecord.findMany({
    where: whereEvc,
    orderBy: { scheduledDate: "asc" },
  });

  // Applications currently in EVC stage that don't have an EVC record or have "Pending Allocation"
  const applicationsInEvcStage = await prisma.application.findMany({
    where: {
      currentStage: "EVC",
      status: "IN_REVIEW",
      ...(user.role === "REGIONAL_OFFICER" && user.region && user.region !== "ALL"
        ? { region: user.region }
        : {}),
    },
  });

  const existingEvcAppIds = new Set(evcRecords.map((e) => e.applicationId));
  const pendingQueueApps = applicationsInEvcStage.filter((a) => !existingEvcAppIds.has(a.id));

  // Compute stats
  const totalEvc = evcRecords.length;
  const delayedCount = evcRecords.filter((e) => e.status === "DELAYED").length;
  const dueCount = evcRecords.filter((e) => e.status === "DUE").length;
  const completedCount = evcRecords.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Expert Visiting Committee (EVC) Inspection Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical campus audits, committee composition, automated reminders, and delayed inspection escalation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg">
            {delayedCount} Delayed Inspections
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
            {dueCount} Due Soon
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total EVC Docket
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalEvc}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
            Due / Imminent (≤7 Days)
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{dueCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
            Delayed Past Due Date
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">{delayedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
            Reports Cleared
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{completedCount}</div>
        </div>
      </div>

      {/* Client Component for Interactive Scheduling & Reporting */}
      <EvcManagementClient
        evcRecords={evcRecords.map((e) => ({
          id: e.id,
          applicationId: e.applicationId,
          applicationNumber: e.applicationNumber,
          institutionName: e.institutionName,
          region: e.region,
          isNewInstitution: e.isNewInstitution,
          visitType: e.visitType,
          scheduledDate: e.scheduledDate.toISOString(),
          committeeChairman: e.committeeChairman,
          committeeMember2: e.committeeMember2,
          committeeMember3: e.committeeMember3,
          status: e.status,
          reportSummary: e.reportSummary,
          deficienciesNoted: e.deficienciesNoted,
          recommendation: e.recommendation,
        }))}
        pendingQueueApps={pendingQueueApps.map((a) => ({
          id: a.id,
          applicationNumber: a.applicationNumber,
          institutionName: a.institutionName,
          region: a.region,
          isNewInstitution: a.isNewInstitution,
        }))}
        simulatedDate={simulatedDate.toISOString()}
        currentUserRole={user.role}
      />
    </div>
  );
}
