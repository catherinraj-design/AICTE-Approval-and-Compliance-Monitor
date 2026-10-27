import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { UndertakingsClient } from "@/components/UndertakingsClient";
import { FileCheck2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UndertakingsPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

  const whereUndertaking: Record<string, unknown> = {};
  if (user.role === "INSTITUTION") {
    whereUndertaking.institutionId = user.institutionId || "inst-101";
  }

  const undertakings = await prisma.undertaking.findMany({
    where: whereUndertaking,
    orderBy: { dueDate: "asc" },
  });

  const total = undertakings.length;
  const pendingCount = undertakings.filter((u) => u.status === "PENDING").length;
  const submittedCount = undertakings.filter((u) => u.status === "SUBMITTED").length;
  const verifiedCount = undertakings.filter((u) => u.status === "VERIFIED").length;
  const overdueCount = undertakings.filter((u) => ["OVERDUE", "ESCALATED"].includes(u.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Time-Bound Compliance Undertakings
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking conditional approvals with mandatory compliance deadlines, document uploads, and multi-tier escalations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg">
            {overdueCount} Overdue / Escalated
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
            {submittedCount} Proofs Awaiting Verification
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total Undertakings
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
            Submitted for Review
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{submittedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
            Overdue / Escalated
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">{overdueCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
            Verified & Satisfied
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{verifiedCount}</div>
        </div>
      </div>

      <UndertakingsClient
        undertakings={undertakings.map((u) => ({
          id: u.id,
          applicationId: u.applicationId,
          institutionId: u.institutionId,
          institutionName: u.institutionName,
          conditionText: u.conditionText,
          approvalRef: u.approvalRef,
          grantedDate: u.grantedDate.toISOString(),
          dueDate: u.dueDate.toISOString(),
          status: u.status,
          escalationLevel: u.escalationLevel,
          evidenceFileName: u.evidenceFileName,
          evidenceUploadedAt: u.evidenceUploadedAt ? u.evidenceUploadedAt.toISOString() : null,
          evidenceRemarks: u.evidenceRemarks,
          verifiedBy: u.verifiedBy,
          verifiedAt: u.verifiedAt ? u.verifiedAt.toISOString() : null,
          officerRemarks: u.officerRemarks,
        }))}
        simulatedDate={simulatedDate.toISOString()}
        currentUserRole={user.role}
      />
    </div>
  );
}
