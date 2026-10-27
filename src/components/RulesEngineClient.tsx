"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Edit2,
  Sparkles,
} from "lucide-react";

export interface RuleItem {
  id: string;
  name: string;
  module: string;
  triggerCondition: string;
  thresholdDays: number;
  recipientRole: string;
  escalationLevel: string;
  actionMessage: string;
  isActive: boolean;
  isOfficialNotice: string;
}

interface RulesClientProps {
  rules: RuleItem[];
  currentUserRole: string;
  simulatedDate: string;
}

export function RulesEngineClient({ rules, currentUserRole, simulatedDate }: RulesClientProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RuleItem | null>(null);
  const [thresholdDays, setThresholdDays] = useState(30);
  const [recipientRole, setRecipientRole] = useState("REGIONAL_OFFICER");
  const [escalationLevel, setEscalationLevel] = useState("WARNING");
  const [actionMessage, setActionMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === "ADMIN";

  const handleOpenEdit = (rule: RuleItem) => {
    setSelectedRule(rule);
    setThresholdDays(rule.thresholdDays);
    setRecipientRole(rule.recipientRole);
    setEscalationLevel(rule.escalationLevel);
    setActionMessage(rule.actionMessage);
    setIsActive(rule.isActive);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRule.id,
          thresholdDays,
          recipientRole,
          escalationLevel,
          actionMessage,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update rule");

      setIsEditOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunNow = async () => {
    try {
      setIsTriggering(true);
      setTriggerResult(null);
      const res = await fetch("/api/rules/run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTriggerResult(
          `Evaluated all rules: ${data.result.undertakingsEscalated} undertakings escalated, ${data.result.evcsDelayed} delayed EVCs flagged, ${data.result.notificationsCreated} notifications issued.`
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner with Run Rule Button */}
      <div className="bg-gradient-to-r from-slate-900 to-gov-navy text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Autonomous Rule & Alert Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Dynamic Compliance Rules & Escalation Thresholds
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Evaluates deadlines as of simulated system date: <strong>{simulatedDate}</strong>
          </p>
        </div>

        <button
          onClick={handleRunNow}
          disabled={isTriggering}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-md transition-colors self-start md:self-center shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isTriggering ? "Evaluating Rules..." : "Run Rule Check Now"}</span>
        </button>
      </div>

      {triggerResult && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{triggerResult}</span>
          </div>
          <button
            onClick={() => setTriggerResult(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-900">Configured Rule Catalog ({rules.length} Rules)</h3>
          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded font-medium">
            Editable Prototype Rules • Not Official AICTE Guidelines
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Rule Name & Module</th>
                <th className="px-3 py-3">Trigger Condition</th>
                <th className="px-3 py-3">Threshold Days</th>
                <th className="px-3 py-3">Recipient Role</th>
                <th className="px-3 py-3">Escalation Tier</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{rule.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rule.actionMessage}
                    </div>
                    <div className="text-[10px] text-amber-700/80 font-mono mt-0.5">
                      {rule.isOfficialNotice}
                    </div>
                  </td>

                  <td className="px-3 py-3 font-mono font-medium text-slate-700">
                    {rule.triggerCondition.replace(/_/g, " ")}
                  </td>

                  <td className="px-3 py-3 font-mono font-bold text-slate-900">
                    {rule.thresholdDays} days
                  </td>

                  <td className="px-3 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {rule.recipientRole.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                        rule.escalationLevel === "ESCALATION_L2"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : rule.escalationLevel === "ESCALATION_L1"
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : rule.escalationLevel === "WARNING"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {rule.escalationLevel.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    {rule.isActive ? (
                      <span className="text-emerald-700 font-semibold text-xs">Active</span>
                    ) : (
                      <span className="text-slate-400 font-semibold text-xs">Disabled</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {isAdmin ? (
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Admin Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {isEditOpen && selectedRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gov-blue" />
              <h3 className="text-base font-bold text-slate-900">
                Configure Rule Threshold & Target
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Rule: <strong>{selectedRule.name}</strong> ({selectedRule.module})
            </p>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Threshold (Days) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  value={thresholdDays}
                  onChange={(e) => setThresholdDays(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Recipient Role
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                >
                  <option value="REGIONAL_OFFICER">Regional Officer</option>
                  <option value="BUREAU_OFFICER">Bureau Officer</option>
                  <option value="ADMIN">Senior Authority / Admin</option>
                  <option value="INSTITUTION">Institution User</option>
                  <option value="COMMITTEE_MEMBER">Committee Member</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escalation Severity
                </label>
                <select
                  value={escalationLevel}
                  onChange={(e) => setEscalationLevel(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                >
                  <option value="INFO">INFO (Standard Notice)</option>
                  <option value="WARNING">WARNING (Urgent Pre-Expiry)</option>
                  <option value="ESCALATION_L1">ESCALATION_L1 (Bureau Level)</option>
                  <option value="ESCALATION_L2">ESCALATION_L2 (Member Secretary / Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Active Status
                </label>
                <select
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                >
                  <option value="true">Active (Evaluated on clock movements)</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action / Notification Template Message
              </label>
              <textarea
                rows={2}
                required
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Saving..." : "Save Rule Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
