"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users2,
  Building,
  PlusCircle,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian, calculateDaysBetween } from "@/lib/formatters";

export interface EvcItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  isNewInstitution: boolean;
  visitType: string;
  scheduledDate: string;
  committeeChairman: string;
  committeeMember2: string;
  committeeMember3: string;
  status: string; // UPCOMING, DUE, COMPLETED, DELAYED
  reportSummary?: string | null;
  deficienciesNoted?: string | null;
  recommendation?: string | null;
}

interface EvcClientProps {
  evcRecords: EvcItem[];
  pendingQueueApps: {
    id: string;
    applicationNumber: string;
    institutionName: string;
    region: string;
    isNewInstitution: boolean;
  }[];
  simulatedDate: string;
  currentUserRole: string;
}

export function EvcManagementClient({
  evcRecords,
  pendingQueueApps,
  simulatedDate,
  currentUserRole,
}: EvcClientProps) {
  const router = useRouter();

  // Scheduling Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{
    id: string;
    applicationNumber: string;
    institutionName: string;
  } | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [chairman, setChairman] = useState("Prof. (Dr.) Amitabh Sen (IIT/NIT Eminent Faculty)");
  const [member2, setMember2] = useState("Dr. K. Srinivas (Institutional Subject Expert)");
  const [member3, setMember3] = useState("State Directorate of Technical Education Nominee");
  const [visitType, setVisitType] = useState("Physical");

  // Complete / Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedEvc, setSelectedEvc] = useState<EvcItem | null>(null);
  const [reportSummary, setReportSummary] = useState("");
  const [recommendation, setRecommendation] = useState<"Recommended" | "Not Recommended" | "Recommended with Conditions">("Recommended");
  const [deficienciesNoted, setDeficienciesNoted] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSchedule = ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);
  const canReport = ["COMMITTEE_MEMBER", "REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"].includes(currentUserRole);

  const handleOpenSchedule = (app: { id: string; applicationNumber: string; institutionName: string }) => {
    setSelectedApp(app);
    // Default 14 days ahead
    const d = new Date(new Date(simulatedDate).getTime() + 14 * 24 * 60 * 60 * 1000);
    setScheduleDate(d.toISOString().slice(0, 10));
    setIsScheduleOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/evc/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          scheduledDate: scheduleDate,
          committeeChairman: chairman,
          committeeMember2: member2,
          committeeMember3: member3,
          visitType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule EVC");

      setIsScheduleOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error scheduling EVC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReport = (evc: EvcItem) => {
    setSelectedEvc(evc);
    setReportSummary(
      `Inspection conducted at ${evc.institutionName}. Verified classrooms, laboratories, computer center, and library facilities pursuant to AICTE Approval Process Handbook.`
    );
    setRecommendation("Recommended");
    setDeficienciesNoted("Nil deficiencies observed in statutory infrastructural requirements.");
    setIsReportOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvc) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch("/api/evc/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evcId: selectedEvc.id,
          reportSummary,
          deficienciesNoted,
          recommendation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete EVC");

      setIsReportOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Queue: Applications Needing EVC Scheduling */}
      {pendingQueueApps.length > 0 && canSchedule && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm text-amber-950 uppercase tracking-wider">
                EVC Scheduling Queue ({pendingQueueApps.length} Applications Cleared Scrutiny)
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-semibold">
              Action Required: Constitute Committee
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingQueueApps.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {app.applicationNumber}
                    </span>
                    {app.isNewInstitution && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        New Inst.
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-700 font-medium truncate max-w-xs mt-0.5">
                    {app.institutionName}
                  </div>
                  <div className="text-[10px] text-slate-400">Region: {app.region}</div>
                </div>

                <button
                  onClick={() => handleOpenSchedule(app)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main EVC Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Expert Visiting Committee (EVC) Schedule Register
            </h3>
            <p className="text-xs text-slate-500">
              Total {evcRecords.length} visits configured across AICTE regional panels.
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
                <th className="px-4 py-3">Application & Institution</th>
                <th className="px-3 py-3">Scheduled Date</th>
                <th className="px-3 py-3">Committee Status</th>
                <th className="px-3 py-3">Committee Panel</th>
                <th className="px-3 py-3">Visit Type</th>
                <th className="px-3 py-3">Outcome / Recommendation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {evcRecords.map((evc) => {
                const diffDays = calculateDaysBetween(evc.scheduledDate, simulatedDate);
                const isDelayed = diffDays > 0 && evc.status !== "COMPLETED";

                return (
                  <tr key={evc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{evc.applicationNumber}</div>
                      <div className="text-xs text-slate-700 font-medium line-clamp-1">
                        {evc.institutionName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                          {evc.region}
                        </span>
                        {evc.isNewInstitution && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                            New Institution
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-slate-800">
                        {formatDateIndian(evc.scheduledDate)}
                      </div>
                      {isDelayed && (
                        <span className="text-[10px] text-rose-700 font-semibold">
                          Overdue by {diffDays} days
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={evc.status} />
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <div className="text-[11px] font-medium text-slate-800 truncate">
                        {evc.committeeChairman}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        2. {evc.committeeMember2}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        3. {evc.committeeMember3}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {evc.visitType}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {evc.recommendation ? (
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded ${
                            evc.recommendation === "Recommended"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : evc.recommendation === "Not Recommended"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {evc.recommendation}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Inspection</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {evc.status !== "COMPLETED" && canReport ? (
                        <button
                          onClick={() => handleOpenReport(evc)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-xs shadow-2xs transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Submit Report</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gov-blue" />
              <h3 className="text-base font-bold text-slate-900">
                Constitute & Schedule EVC Inspection
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Application: <strong>{selectedApp.applicationNumber}</strong> ({selectedApp.institutionName})
            </p>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Inspection Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Mode</label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Physical">Physical Campus Inspection</option>
                  <option value="Hybrid">Hybrid / Virtual Facility Audit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Committee Chairman (Senior Professor / Eminent Academician)
              </label>
              <input
                type="text"
                required
                value={chairman}
                onChange={(e) => setChairman(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Member 2 (Subject Expert)
              </label>
              <input
                type="text"
                required
                value={member2}
                onChange={(e) => setMember2(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Member 3 (State Directorate Nominee)
              </label>
              <input
                type="text"
                required
                value={member3}
                onChange={(e) => setMember3(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-gov-blue hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Allocating..." : "Confirm Schedule & Dispatch Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submit Report Modal */}
      {isReportOpen && selectedEvc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReportSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Submit Expert Visiting Committee Report
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Inspection findings for <strong>{selectedEvc.institutionName}</strong> ({selectedEvc.applicationNumber}).
              Submitting advances this proposal to the subsequent workflow stage automatically.
            </p>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Committee Recommendation <span className="text-rose-600">*</span>
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as "Recommended" | "Not Recommended" | "Recommended with Conditions")}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Recommended">Recommended (Meets all statutory norms)</option>
                <option value="Recommended with Conditions">Recommended with Conditions (Time-bound undertaking required)</option>
                <option value="Not Recommended">Not Recommended (Substantial infrastructural deficiencies)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Inspection Summary Findings
              </label>
              <textarea
                rows={3}
                required
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deficiencies / Minor Remarks
              </label>
              <textarea
                rows={2}
                value={deficienciesNoted}
                onChange={(e) => setDeficienciesNoted(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                {isSubmitting ? "Recording Report..." : "Submit Inspection Report & Advance Stage"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
