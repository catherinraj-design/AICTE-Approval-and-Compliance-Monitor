"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Building,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian, formatDateTimeIndian } from "@/lib/formatters";

interface AppDetailClientProps {
  application: {
    id: string;
    applicationNumber: string;
    institutionName: string;
    region: string;
    applicationType: string;
    academicYear: string;
    stagePathId: string;
    currentStage: string;
    currentStageIndex: number;
    status: string;
    stageStartedAt: string;
    submittedAt: string;
    deficiencyReason?: string | null;
    finalDecisionRemarks?: string | null;
    finalDecisionBy?: string | null;
    finalDecisionDate?: string | null;
    caseSummary?: string | null;
    communicationDraft?: string | null;
    isNewInstitution: boolean;
    proposedIntake?: number | null;
    courseLevel?: string | null;
  };
  stages: string[];
  currentUserRole: string;
  currentUserId: string;
  auditEvents: {
    id: string;
    timestamp: string;
    performedBy: string;
    userRole: string;
    action: string;
    reason: string;
  }[];
}

export function ApplicationDetailClient({
  application,
  stages,
  currentUserRole,
  currentUserId,
  auditEvents,
}: AppDetailClientProps) {
  const router = useRouter();

  // Modals & Action States
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceRemarks, setAdvanceRemarks] = useState("");

  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [revertReason, setRevertReason] = useState("");
  const [revertType, setRevertType] = useState<"DEFICIENCY" | "CLARIFICATION" | "VERIFICATION">("DEFICIENCY");

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"APPROVED" | "REJECTED" | "CONDITIONAL_APPROVAL">("APPROVED");
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [conditionText, setConditionText] = useState("");
  const [conditionDueDays, setConditionDueDays] = useState(60);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCompleted = ["APPROVED", "REJECTED", "CONDITIONAL_APPROVAL"].includes(application.status);
  const isReadyForDecision = application.status === "READY_FOR_DECISION" || application.currentStage === "Ready for Decision";
  const canAdvance =
    !isCompleted &&
    !isReadyForDecision &&
    ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN", "COMMITTEE_MEMBER"].includes(currentUserRole);
  const canRevert =
    !isCompleted &&
    ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);
  const canDecide =
    isReadyForDecision &&
    ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);

  // Advance stage
  const handleAdvance = async () => {
    try {
      setIsSubmitting(true);
      setActionError(null);
      const res = await fetch(`/api/applications/${application.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerName: currentUserId,
          officerRole: currentUserRole,
          remarks: advanceRemarks || "Verification verified and passed to next stage.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to advance stage");
      setIsAdvanceModalOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Error advancing stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revert / return for deficiency
  const handleRevert = async () => {
    try {
      if (!revertReason.trim()) {
        setActionError("Mandatory recorded reason must be provided to return an application.");
        return;
      }
      setIsSubmitting(true);
      setActionError(null);
      const res = await fetch(`/api/applications/${application.id}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerName: currentUserId,
          officerRole: currentUserRole,
          reason: revertReason,
          returnType: revertType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to return application");
      setIsRevertModalOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Error returning application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final manual decision
  const handleDecision = async () => {
    try {
      if (!decisionRemarks.trim()) {
        setActionError("Mandatory remarks must be recorded for the competent authority decision.");
        return;
      }
      if (decisionType === "CONDITIONAL_APPROVAL" && !conditionText.trim()) {
        setActionError("Condition text is required for conditional approval.");
        return;
      }
      setIsSubmitting(true);
      setActionError(null);
      const res = await fetch(`/api/applications/${application.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerName: currentUserId,
          officerRole: currentUserRole,
          decision: decisionType,
          remarks: decisionRemarks,
          conditionalUndertakingText: conditionText,
          conditionDueDateDays: conditionDueDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record decision");
      setIsDecisionModalOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Error recording decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dossier Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-gov-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {application.applicationNumber}
            </span>
            <StatusBadge status={application.status} />
            {application.isNewInstitution && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                New Institution
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {application.institutionName}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span>
              <strong>Proposal:</strong> {application.applicationType} ({application.academicYear})
            </span>
            <span>•</span>
            <span>
              <strong>Jurisdiction:</strong> {application.region} Regional Office
            </span>
            <span>•</span>
            <span>
              <strong>Intake:</strong> {application.proposedIntake || 60} seats ({application.courseLevel || "UG"})
            </span>
            <span>•</span>
            <span>
              <strong>Submitted:</strong> {formatDateIndian(application.submittedAt)}
            </span>
          </div>
        </div>

        {/* Action Controls for Authorized Officers */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {canAdvance && (
            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="bg-gov-blue hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Complete & Advance Stage</span>
            </button>
          )}

          {canRevert && (
            <button
              onClick={() => setIsRevertModalOpen(true)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return for Deficiency</span>
            </button>
          )}

          {canDecide && (
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-md transition-colors animate-pulse"
            >
              <UserCheck className="w-4 h-4" />
              <span>Render Competent Authority Decision</span>
            </button>
          )}
        </div>
      </div>

      {/* Deficiency Alert Banner if Reverted */}
      {application.status === "DEFICIENCY_REVERTED" && application.deficiencyReason && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider text-rose-800">
              Application Returned to Institution for Deficiency Rectification
            </div>
            <p className="mt-1 font-medium">{application.deficiencyReason}</p>
            <p className="mt-1 text-slate-500 text-[11px]">
              The institution must upload rectified proofs or justifications before this application can re-enter the scrutiny stream.
            </p>
          </div>
        </div>
      )}

      {/* Final Decision Banner if Decided */}
      {isCompleted && (
        <div
          className={`border rounded-xl p-4 text-xs flex items-start gap-3 ${
            application.status === "APPROVED"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : application.status === "REJECTED"
              ? "bg-rose-50 border-rose-300 text-rose-900"
              : "bg-purple-50 border-purple-300 text-purple-900"
          }`}
        >
          {application.status === "APPROVED" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : application.status === "REJECTED" ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold uppercase tracking-wider">
              Official Decision Rendered: {application.status.replace(/_/g, " ")}
            </div>
            <p className="mt-1 font-medium">{application.finalDecisionRemarks}</p>
            <p className="mt-1 text-slate-500 text-[11px]">
              Decided by: <strong>{application.finalDecisionBy || "Competent Authority"}</strong> on{" "}
              {formatDateTimeIndian(application.finalDecisionDate)}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Workflow Stage Stepper */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Approval Workflow Movement Pipeline
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Configured Path: <strong>{application.stagePathId}</strong>
          </span>
        </div>

        {/* Pipeline Stepper Nodes */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 relative">
          {stages.map((stageName, idx) => {
            const isCurrent = application.currentStage === stageName;
            const isPast =
              isCompleted ||
              isReadyForDecision ||
              application.currentStageIndex > idx ||
              (stages.indexOf(application.currentStage) > idx && stages.indexOf(application.currentStage) !== -1);

            return (
              <div
                key={stageName}
                className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-blue-50/80 border-gov-blue ring-2 ring-blue-300/40"
                    : isPast
                    ? "bg-emerald-50/60 border-emerald-300"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? "bg-gov-blue text-white"
                      : isPast
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-600"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-800 truncate">{stageName}</div>
                  <div className="text-[10px] text-slate-500">
                    {isCurrent ? "Active Processing" : isPast ? "Cleared" : "Upcoming"}
                  </div>
                </div>
              </div>
            );
          })}

          {/* End Step: Ready for Decision / Decision */}
          <div
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isCompleted
                ? "bg-emerald-50/80 border-emerald-300"
                : isReadyForDecision
                ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-300/40"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isCompleted
                  ? "bg-emerald-600 text-white"
                  : isReadyForDecision
                  ? "bg-purple-600 text-white"
                  : "bg-slate-300 text-slate-600"
              }`}
            >
              {isCompleted ? "✓" : "★"}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-xs text-slate-800 truncate">
                {isCompleted ? application.status.replace(/_/g, " ") : "Final Decision"}
              </div>
              <div className="text-[10px] text-slate-500">
                {isCompleted ? "Executed" : isReadyForDecision ? "Action Required" : "Awaiting Stages"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Electronic Case Summary & Communication Draft Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electronic Case Summary Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gov-blue" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Electronic Case Summary
              </h3>
            </div>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
              Draft: requires officer review
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto max-h-80">
            {application.caseSummary || "Case summary draft being generated by workflow automator..."}
          </div>
        </div>

        {/* Communication Letter Draft Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-gov-blue" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standard Communication Letter Draft
              </h3>
            </div>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
              Draft: requires officer review
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto max-h-80">
            {application.communicationDraft || "Standard communication letter draft queued for digital signature."}
          </div>
        </div>
      </div>

      {/* Movement Audit Trail Specific to This Application */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Application Movement & Procedural Audit Trail
        </h3>
        {auditEvents.length === 0 ? (
          <div className="text-xs text-slate-400 p-4 text-center">No movement logs recorded yet.</div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {auditEvents.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-gov-blue ring-4 ring-white" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ev.action.replace(/_/g, " ")}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTimeIndian(ev.timestamp)}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                      {ev.userRole}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">{ev.reason}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Actor: {ev.performedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advance Stage Modal */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Complete Current Stage & Advance
            </h3>
            <p className="text-xs text-slate-600">
              Advancing from <strong>{application.currentStage}</strong> to the next scheduled stage in the pathway. If this is the final stage, the dossier becomes <em>Ready for Decision</em>.
            </p>

            {actionError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scrutiny / Inspection Remarks
              </label>
              <textarea
                rows={3}
                value={advanceRemarks}
                onChange={(e) => setAdvanceRemarks(e.target.value)}
                placeholder="Enter verification observations or clearance remarks..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdvance}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg"
              >
                {isSubmitting ? "Processing..." : "Confirm & Advance Stage"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revert / Deficiency Modal */}
      {isRevertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-rose-800">
              Return Application for Deficiency / Clarification
            </h3>
            <p className="text-xs text-slate-600">
              The application will be placed in <strong>DEFICIENCY_REVERTED</strong> status and the institution notified. A recorded reason is mandatory.
            </p>

            {actionError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Return Type</label>
              <select
                value={revertType}
                onChange={(e) => setRevertType(e.target.value as "DEFICIENCY" | "CLARIFICATION" | "VERIFICATION")}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              >
                <option value="DEFICIENCY">Statutory Deficiency Rectification</option>
                <option value="CLARIFICATION">Institutional Clarification / Query</option>
                <option value="VERIFICATION">Further Document Verification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Reason / Directives <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                placeholder="Specific deficiencies, missing NOCs, or queries requiring rectification..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRevertModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRevert}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                {isSubmitting ? "Saving..." : "Record Reason & Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competent Authority Final Decision Modal */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Competent Authority Final Decision
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Statutory Safeguard: Algorithms never auto-approve or auto-reject. This manual action issues the final council order.
            </p>

            {actionError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType("APPROVED")}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    decisionType === "APPROVED"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("CONDITIONAL_APPROVAL")}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    decisionType === "CONDITIONAL_APPROVAL"
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Conditional
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("REJECTED")}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    decisionType === "REJECTED"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>

            {decisionType === "CONDITIONAL_APPROVAL" && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-purple-900 mb-1">
                    Conditional Undertaking Requirement <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={conditionText}
                    onChange={(e) => setConditionText(e.target.value)}
                    placeholder="e.g. Submission of Fire Safety Certificate within 60 days"
                    className="w-full p-2 bg-white border border-purple-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-900 mb-1">
                    Compliance Deadline (Days from today)
                  </label>
                  <input
                    type="number"
                    value={conditionDueDays}
                    onChange={(e) => setConditionDueDays(parseInt(e.target.value, 10))}
                    className="w-32 p-2 bg-white border border-purple-300 rounded text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Order Remarks / Reference <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="Enter formal justification and reference numbers for council minutes..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Executing Order..." : "Render Decision & Seal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
