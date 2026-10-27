"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Building,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian, calculateDaysBetween } from "@/lib/formatters";

export interface UndertakingItem {
  id: string;
  applicationId: string;
  institutionId: string;
  institutionName: string;
  conditionText: string;
  approvalRef: string;
  grantedDate: string;
  dueDate: string;
  status: string; // PENDING, SUBMITTED, VERIFIED, REJECTED, OVERDUE, ESCALATED
  escalationLevel: string; // NONE, RO_ALERT, BO_ALERT, SENIOR_ALERT
  evidenceFileName?: string | null;
  evidenceUploadedAt?: string | null;
  evidenceRemarks?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  officerRemarks?: string | null;
}

interface UndertakingsClientProps {
  undertakings: UndertakingItem[];
  simulatedDate: string;
  currentUserRole: string;
}

export function UndertakingsClient({
  undertakings,
  simulatedDate,
  currentUserRole,
}: UndertakingsClientProps) {
  const router = useRouter();

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedUndertaking, setSelectedUndertaking] = useState<UndertakingItem | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState("");
  const [evidenceRemarks, setEvidenceRemarks] = useState("");

  // Verify Modal
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyDecision, setVerifyDecision] = useState<"VERIFY" | "REJECT">("VERIFY");
  const [officerRemarks, setOfficerRemarks] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOfficer = ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);
  const isInstitution = currentUserRole === "INSTITUTION" || currentUserRole === "ADMIN";

  const handleOpenUpload = (item: UndertakingItem) => {
    setSelectedUndertaking(item);
    setEvidenceFileName(`Compliance_Proof_${item.approvalRef.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    setEvidenceRemarks("Enclosing statutory documentation and verification receipts fulfilling the council condition.");
    setIsUploadOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUndertaking) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/undertakings/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          undertakingId: selectedUndertaking.id,
          evidenceFileName,
          evidenceRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit evidence");

      setIsUploadOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting compliance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenVerify = (item: UndertakingItem) => {
    setSelectedUndertaking(item);
    setVerifyDecision("VERIFY");
    setOfficerRemarks("Verified original authenticated documentation. Condition successfully fulfilled.");
    setIsVerifyOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUndertaking) return;

    try {
      if (!officerRemarks.trim()) {
        setError("Officer verification remarks are mandatory.");
        return;
      }
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/undertakings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          undertakingId: selectedUndertaking.id,
          decision: verifyDecision,
          officerRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify condition");

      setIsVerifyOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error verifying compliance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Time-Bound Conditional Approvals Register
            </h3>
            <p className="text-xs text-slate-500">
              Tracking conditional EoAs requiring evidentiary proof of compliance before statutory cutoffs.
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-medium">
            Simulated Reference Date: {formatDateIndian(simulatedDate)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Institution & Ref Order</th>
                <th className="px-3 py-3">Imposed Condition</th>
                <th className="px-3 py-3">Due Date</th>
                <th className="px-3 py-3">Compliance Status</th>
                <th className="px-3 py-3">Escalation Tier</th>
                <th className="px-3 py-3">Uploaded Proof</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {undertakings.map((item) => {
                const diffDays = calculateDaysBetween(item.dueDate, simulatedDate);
                const isOverdue = diffDays > 0 && item.status !== "VERIFIED";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {item.institutionName}
                      </div>
                      <div className="text-[11px] font-mono text-gov-blue mt-0.5">
                        {item.approvalRef}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Granted: {formatDateIndian(item.grantedDate)}
                      </div>
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <p className="text-slate-700 font-medium line-clamp-2">{item.conditionText}</p>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-slate-800">{formatDateIndian(item.dueDate)}</div>
                      {isOverdue ? (
                        <span className="text-[10px] text-rose-700 font-bold block">
                          {diffDays} days overdue!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          {Math.abs(diffDays)} days left
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-3 py-3">
                      {item.escalationLevel === "NONE" ? (
                        <span className="text-slate-400 text-[11px]">Normal</span>
                      ) : (
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.escalationLevel === "SENIOR_ALERT"
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : item.escalationLevel === "BO_ALERT"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {item.escalationLevel.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 max-w-[160px]">
                      {item.evidenceFileName ? (
                        <div>
                          <span className="font-mono text-[11px] text-blue-700 font-semibold truncate block">
                            {item.evidenceFileName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateIndian(item.evidenceUploadedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No evidence uploaded</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {/* Institution action: Upload proof */}
                      {isInstitution && item.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleOpenUpload(item)}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors mr-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-gov-blue" />
                          <span>Upload</span>
                        </button>
                      )}

                      {/* Officer action: Verify evidence */}
                      {isOfficer && item.status === "SUBMITTED" && (
                        <button
                          onClick={() => handleOpenVerify(item)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      )}

                      {item.status === "VERIFIED" && (
                        <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {isUploadOpen && selectedUndertaking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gov-blue" />
              <h3 className="text-base font-bold text-slate-900">
                Upload Compliance Evidence Document
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Condition: <strong>"{selectedUndertaking.conditionText}"</strong>
            </p>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document File Reference (PDF) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={evidenceFileName}
                onChange={(e) => setEvidenceFileName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Simulated upload: standard digitized PDF document identifier.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Remarks & Justification
              </label>
              <textarea
                rows={3}
                required
                value={evidenceRemarks}
                onChange={(e) => setEvidenceRemarks(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Uploading..." : "Submit Proof for Officer Verification"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verify Evidence Modal */}
      {isVerifyOpen && selectedUndertaking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleVerifySubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Officer Verification of Compliance Proof
              </h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <strong>Condition:</strong> {selectedUndertaking.conditionText}
              </div>
              <div>
                <strong>Submitted File:</strong> {selectedUndertaking.evidenceFileName}
              </div>
              <div className="text-slate-500 italic">
                "{selectedUndertaking.evidenceRemarks}"
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyDecision("VERIFY")}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    verifyDecision === "VERIFY"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  Verify & Satisfy Condition
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyDecision("REJECT")}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    verifyDecision === "REJECT"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  Reject Proof / Resubmit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Remarks & Procedural Observations <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Enter statutory verification findings..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Processing..." : "Confirm Verification Record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
