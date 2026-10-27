"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  FileCheck,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian, calculateDaysBetween } from "@/lib/formatters";

export interface DocumentItem {
  id: string;
  institutionId: string;
  institutionName: string;
  region: string;
  documentType: string;
  documentNumber: string;
  validFrom: string;
  validTo: string;
  status: string; // VALID, EXPIRING_SOON, EXPIRED, RENEWAL_SUBMITTED, VERIFIED
  renewalFileName?: string | null;
  renewalSubmittedAt?: string | null;
  renewalRemarks?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationRemarks?: string | null;
}

interface DocumentsClientProps {
  documents: DocumentItem[];
  simulatedDate: string;
  currentUserRole: string;
}

export function DocumentsClient({
  documents,
  simulatedDate,
  currentUserRole,
}: DocumentsClientProps) {
  const router = useRouter();

  // Renewal Modal
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [renewalFileName, setRenewalFileName] = useState("");
  const [renewalRemarks, setRenewalRemarks] = useState("");
  const [newValidToDate, setNewValidToDate] = useState("");

  // Verification Modal
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [extendedYears, setExtendedYears] = useState(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOfficer = ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);
  const isInstitution = currentUserRole === "INSTITUTION" || currentUserRole === "ADMIN";

  const handleOpenRenew = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setRenewalFileName(`Renewal_${doc.documentType.replace(/[^a-zA-Z0-9]/g, "_")}_2026.pdf`);
    setRenewalRemarks("Registered lease/clearance renewal executed at competent sub-registrar office.");
    // 5 years ahead
    const d = new Date(new Date(simulatedDate).getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
    setNewValidToDate(d.toISOString().slice(0, 10));
    setIsRenewOpen(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/documents/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          renewalFileName,
          renewalRemarks,
          newValidTo: newValidToDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit renewal");

      setIsRenewOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting renewal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenVerify = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setVerificationRemarks("Scrutinized renewed registered deed against government registry records. Verified valid.");
    setExtendedYears(5);
    setIsVerifyOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      if (!verificationRemarks.trim()) {
        setError("Officer verification remarks are mandatory.");
        return;
      }
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/documents/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          verificationRemarks,
          extendedValidToYears: extendedYears,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify document");

      setIsVerifyOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error verifying document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Statutory Land Lease & Institutional Document Register
            </h3>
            <p className="text-xs text-slate-500">
              Validity tracking for 30-year registered lease deeds, Fire NOCs, Building Stability & Environmental clearances.
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
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-3 py-3">Document Category</th>
                <th className="px-3 py-3">Document Reg. No.</th>
                <th className="px-3 py-3">Validity Window</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Renewal Dossier</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {documents.map((doc) => {
                const daysRemaining = calculateDaysBetween(simulatedDate, doc.validTo);
                const isExpired = daysRemaining < 0 && doc.status !== "VERIFIED";

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {doc.institutionName}
                      </div>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                        {doc.region} Region
                      </span>
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-800">
                      {doc.documentType}
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-600">
                      {doc.documentNumber}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="font-semibold text-slate-800">
                        Until {formatDateIndian(doc.validTo)}
                      </div>
                      {isExpired ? (
                        <span className="text-[10px] text-rose-700 font-bold block">
                          Expired {Math.abs(daysRemaining)} days ago
                        </span>
                      ) : daysRemaining <= 60 ? (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          Expires in {daysRemaining} days
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          Valid ({daysRemaining} days remaining)
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="px-3 py-3 max-w-[160px]">
                      {doc.renewalFileName ? (
                        <div>
                          <span className="font-mono text-[11px] text-blue-700 font-semibold truncate block">
                            {doc.renewalFileName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateIndian(doc.renewalSubmittedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No renewal lodged</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isInstitution && doc.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleOpenRenew(doc)}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors mr-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-gov-blue" />
                          <span>Submit Renewal</span>
                        </button>
                      )}

                      {isOfficer && doc.status === "RENEWAL_SUBMITTED" && (
                        <button
                          onClick={() => handleOpenVerify(doc)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      )}

                      {doc.status === "VERIFIED" && (
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

      {/* Renewal Upload Modal */}
      {isRenewOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenewSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gov-blue" />
              <h3 className="text-base font-bold text-slate-900">
                Upload Statutory Document Renewal
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Institution: <strong>{selectedDoc.institutionName}</strong> | Document: <strong>{selectedDoc.documentType}</strong>
            </p>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Renewed Document File Name (PDF) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={renewalFileName}
                onChange={(e) => setRenewalFileName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Extended Expiry Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={newValidToDate}
                onChange={(e) => setNewValidToDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration / Execution Remarks
              </label>
              <textarea
                rows={3}
                required
                value={renewalRemarks}
                onChange={(e) => setRenewalRemarks(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenewOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Renewal for Regional Verification"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verify Renewal Modal */}
      {isVerifyOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleVerifySubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Officer Verification of Document Renewal
              </h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <strong>Document:</strong> {selectedDoc.documentType} ({selectedDoc.documentNumber})
              </div>
              <div>
                <strong>Submitted File:</strong> {selectedDoc.renewalFileName}
              </div>
              <div className="text-slate-500 italic">
                "{selectedDoc.renewalRemarks}"
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validity Extension Duration
              </label>
              <select
                value={extendedYears}
                onChange={(e) => setExtendedYears(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-medium"
              >
                <option value={3}>3 Years Extension</option>
                <option value={5}>5 Years Extension (Standard for Fire/Building NOC)</option>
                <option value={30}>30 Years Extension (Registered Land Lease Deed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Findings & Officer Endorsement <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={verificationRemarks}
                onChange={(e) => setVerificationRemarks(e.target.value)}
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
                {isSubmitting ? "Endorsing..." : "Endorse & Extend Validity"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
