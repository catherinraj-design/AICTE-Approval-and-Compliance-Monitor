import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AuditTrailClient } from "@/components/AuditTrailClient";
import { History, Shield, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const user = getCurrentUser();

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 150,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Append-Only Procedural Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system-wide ledger of every workflow movement, committee inspection, compliance verification, and escalation.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg font-semibold">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Statutory Integrity: Record edit or delete prohibited</span>
        </div>
      </div>

      <AuditTrailClient
        initialLogs={auditLogs.map((a) => ({
          id: a.id,
          timestamp: a.timestamp.toISOString(),
          performedBy: a.performedBy,
          userRole: a.userRole,
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          beforeState: a.beforeState,
          afterState: a.afterState,
          reason: a.reason,
        }))}
      />
    </div>
  );
}
