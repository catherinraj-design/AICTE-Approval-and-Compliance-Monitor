"use client";

import React, { useState } from "react";
import { Search, History, Shield, Eye, Filter } from "lucide-react";
import { formatDateTimeIndian } from "@/lib/formatters";

export interface AuditRecord {
  id: string;
  timestamp: string;
  performedBy: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: string | null;
  afterState?: string | null;
  reason: string;
}

export function AuditTrailClient({ initialLogs }: { initialLogs: AuditRecord[] }) {
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [activeSnapshot, setActiveSnapshot] = useState<AuditRecord | null>(null);

  const entities = ["ALL", "Application", "EVC", "Undertaking", "Document", "Rule", "System"];

  const filtered = initialLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(q) ||
      log.performedBy.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (selectedEntity !== "ALL" && log.entityType !== selectedEntity) return false;
    if (selectedAction !== "ALL" && log.action !== selectedAction) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, action, entity ID or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Entity Type:</label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent === "ALL" ? "All Entities" : ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-3 py-3">Actor & Role</th>
                <th className="px-3 py-3">Action Recorded</th>
                <th className="px-3 py-3">Entity Target</th>
                <th className="px-3 py-3">Mandatory Reason / Directives</th>
                <th className="px-4 py-3 text-right">State Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateTimeIndian(log.timestamp)}
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900">{log.performedBy}</div>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-mono">
                        {log.userRole}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-bold text-slate-800 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono text-[11px] text-gov-blue">
                      <span className="font-bold text-slate-700">{log.entityType}</span> / {log.entityId}
                    </td>

                    <td className="px-3 py-3 max-w-sm">
                      <p className="text-slate-700 line-clamp-2">{log.reason}</p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {(log.beforeState || log.afterState) ? (
                        <button
                          onClick={() => setActiveSnapshot(log)}
                          className="inline-flex items-center gap-1 text-[11px] text-gov-blue hover:text-blue-800 font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View State</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Modal */}
      {activeSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  State Mutation Snapshot: {activeSnapshot.action}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Log ID: {activeSnapshot.id} | Timestamp: {formatDateTimeIndian(activeSnapshot.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setActiveSnapshot(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-64">
                <span className="font-bold text-slate-600 block mb-1">Before State:</span>
                <pre className="text-[11px] text-slate-800">
                  {activeSnapshot.beforeState
                    ? JSON.stringify(JSON.parse(activeSnapshot.beforeState), null, 2)
                    : "null"}
                </pre>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 overflow-x-auto max-h-64">
                <span className="font-bold text-emerald-800 block mb-1">After State:</span>
                <pre className="text-[11px] text-emerald-950">
                  {activeSnapshot.afterState
                    ? JSON.stringify(JSON.parse(activeSnapshot.afterState), null, 2)
                    : "null"}
                </pre>
              </div>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-700">Recorded Reason / Justification:</strong>
              <p className="text-slate-600 mt-1">{activeSnapshot.reason}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSnapshot(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
