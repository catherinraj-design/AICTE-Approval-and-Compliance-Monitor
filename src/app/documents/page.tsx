import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { DocumentsClient } from "@/components/DocumentsClient";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

  const whereDoc: Record<string, unknown> = {};
  if (user.role === "INSTITUTION") {
    whereDoc.institutionId = user.institutionId || "inst-101";
  } else if (user.role === "REGIONAL_OFFICER" && user.region && user.region !== "ALL") {
    whereDoc.region = user.region;
  }

  const documents = await prisma.documentValidity.findMany({
    where: whereDoc,
    orderBy: { validTo: "asc" },
  });

  const total = documents.length;
  const validCount = documents.filter((d) => d.status === "VALID" || d.status === "VERIFIED").length;
  const expiringSoonCount = documents.filter((d) => d.status === "EXPIRING_SOON").length;
  const expiredCount = documents.filter((d) => d.status === "EXPIRED").length;
  const renewalSubmittedCount = documents.filter((d) => d.status === "RENEWAL_SUBMITTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Lease & Statutory Document Validity Monitoring
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional land leases, fire clearance NOCs, building safety certificates, and proactive renewal alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg">
            {expiredCount} Expired Clearances
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
            {expiringSoonCount} Expiring Soon (&lt;60d)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total Documents
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
            Valid & Verified
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{validCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
            Expiring Soon (&lt;60 Days)
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{expiringSoonCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
            Expired Statutory NOCs
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">{expiredCount}</div>
        </div>
      </div>

      <DocumentsClient
        documents={documents.map((d) => ({
          id: d.id,
          institutionId: d.institutionId,
          institutionName: d.institutionName,
          region: d.region,
          documentType: d.documentType,
          documentNumber: d.documentNumber,
          validFrom: d.validFrom.toISOString(),
          validTo: d.validTo.toISOString(),
          status: d.status,
          renewalFileName: d.renewalFileName,
          renewalSubmittedAt: d.renewalSubmittedAt ? d.renewalSubmittedAt.toISOString() : null,
          renewalRemarks: d.renewalRemarks,
          verifiedBy: d.verifiedBy,
          verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
          verificationRemarks: d.verificationRemarks,
        }))}
        simulatedDate={simulatedDate.toISOString()}
        currentUserRole={user.role}
      />
    </div>
  );
}
