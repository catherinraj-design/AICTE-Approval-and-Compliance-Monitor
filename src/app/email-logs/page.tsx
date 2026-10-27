import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTimeIndian } from "@/lib/formatters";
import { Mail, CheckCircle2, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmailLogsPage() {
  const emails = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Mock Electronic Mail Dispatch Journal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated electronic notifications dispatched to Regional Officers, Bureau HQ, and Institutional Registrars.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Zero external emails dispatched (Mock simulation mode active)</span>
        </div>
      </div>

      {/* Email Journal Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Outbound Mail Dispatch Ledger ({emails.length} Records)
          </span>
          <span className="text-[11px] text-slate-500">
            Logged automatically by Workflow & Escalation Rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Dispatched Timestamp</th>
                <th className="px-3 py-3">Recipient Address & Role</th>
                <th className="px-3 py-3">Official Subject Line</th>
                <th className="px-3 py-3">Delivery Status</th>
                <th className="px-4 py-3 text-right">Email Body Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No emails logged in current session.
                  </td>
                </tr>
              ) : (
                emails.map((eml) => (
                  <tr key={eml.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {formatDateTimeIndian(eml.sentAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-800">{eml.recipientEmail}</div>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-medium">
                        {eml.recipientRole.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900 max-w-sm">
                      {eml.subject}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Dispatched (Simulated)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {eml.contentHtml.replace(/<[^>]*>?/gm, "").substring(0, 60)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
