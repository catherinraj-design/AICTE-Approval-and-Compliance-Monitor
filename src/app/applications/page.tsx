import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { PlusCircle, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

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

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Approval Applications
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {applications.length} applications across scrutiny, expert visiting committees, and final decisions.
          </p>
        </div>

        {(user.role === "INSTITUTION" || user.role === "ADMIN") && (
          <Link
            href="/applications/new"
            className="inline-flex items-center gap-2 bg-gov-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors self-start sm:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Proposal</span>
          </Link>
        )}
      </div>

      {/* Interactive Table */}
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
        simulatedDate={simulatedDate.toISOString()}
        isRoleRestricted={user.role === "INSTITUTION" || user.role === "REGIONAL_OFFICER"}
      />
    </div>
  );
}
