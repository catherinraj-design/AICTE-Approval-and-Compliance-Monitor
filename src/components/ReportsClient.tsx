"use client";

import React, { useState } from "react";
import {
  Download,
  Printer,
  FileSpreadsheet,
  BarChart2,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian } from "@/lib/formatters";

interface ApplicationReportItem {
  id: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  applicationType: string;
  currentStage: string;
  status: string;
  currentStageIndex: number;
  submittedAt: string;
  deficiencyReason?: string | null;
}

interface EvcReportItem {
  id: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  scheduledDate: string;
  status: string;
  committeeChairman: string;
  recommendation?: string | null;
}

interface UndertakingReportItem {
  id: string;
  institutionName: string;
  approvalRef: string;
  conditionText: string;
  dueDate: string;
  status: string;
  escalationLevel: string;
}

interface DocumentReportItem {
  id: string;
  institutionName: string;
  region: string;
  documentType: string;
  documentNumber: string;
  validTo: string;
  status: string;
}

interface ReportsProps {
  applications: ApplicationReportItem[];
  evcs: EvcReportItem[];
  undertakings: UndertakingReportItem[];
  documents: DocumentReportItem[];
  simulatedDate: string;
}

export function ReportsClient({
  applications,
  evcs,
  undertakings,
  documents,
  simulatedDate,
}: ReportsProps) {
  const [activeTab, setActiveTab] = useState<
    "PENDENCY" | "EVC" | "UNDERTAKINGS" | "DOCUMENTS" | "OVERDUE" | "REGIONAL"
  >("PENDENCY");

  // Export CSV handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `AICTE_Report_${activeTab}_${simulatedDate.replace(/[^0-9]/g, "")}.csv`;

    if (activeTab === "PENDENCY") {
      headers = ["Application No", "Institution", "Region", "Category", "Current Stage", "Status", "Submitted Date"];
      rows = applications.map((a) => [
        `"${a.applicationNumber}"`,
        `"${a.institutionName}"`,
        `"${a.region}"`,
        `"${a.applicationType}"`,
        `"${a.currentStage}"`,
        `"${a.status}"`,
        `"${formatDateIndian(a.submittedAt)}"`,
      ]);
    } else if (activeTab === "EVC") {
      headers = ["Application No", "Institution", "Region", "Scheduled Date", "Status", "Chairman", "Recommendation"];
      rows = evcs.map((e) => [
        `"${e.applicationNumber}"`,
        `"${e.institutionName}"`,
        `"${e.region}"`,
        `"${formatDateIndian(e.scheduledDate)}"`,
        `"${e.status}"`,
        `"${e.committeeChairman}"`,
        `"${e.recommendation || "Pending"}"`,
      ]);
    } else if (activeTab === "UNDERTAKINGS") {
      headers = ["Institution", "Approval Ref", "Condition", "Due Date", "Status", "Escalation"];
      rows = undertakings.map((u) => [
        `"${u.institutionName}"`,
        `"${u.approvalRef}"`,
        `"${u.conditionText.replace(/"/g, '""')}"`,
        `"${formatDateIndian(u.dueDate)}"`,
        `"${u.status}"`,
        `"${u.escalationLevel}"`,
      ]);
    } else if (activeTab === "DOCUMENTS") {
      headers = ["Institution", "Region", "Document Type", "Reg Number", "Valid Until", "Status"];
      rows = documents.map((d) => [
        `"${d.institutionName}"`,
        `"${d.region}"`,
        `"${d.documentType}"`,
        `"${d.documentNumber}"`,
        `"${formatDateIndian(d.validTo)}"`,
        `"${d.status}"`,
      ]);
    } else if (activeTab === "OVERDUE") {
      headers = ["Application No", "Institution", "Stage", "Status", "Deficiency / Reason"];
      const overdueApps = applications.filter((a) => a.status === "DEFICIENCY_REVERTED");
      rows = overdueApps.map((a) => [
        `"${a.applicationNumber}"`,
        `"${a.institutionName}"`,
        `"${a.currentStage}"`,
        `"${a.status}"`,
        `"${(a.deficiencyReason || "").replace(/"/g, '""')}"`,
      ]);
    } else {
      headers = ["Region", "Total Applications", "Scrutiny Cleared", "Approved", "Reverted"];
      const regions = ["North", "South", "West", "East", "Central"];
      rows = regions.map((reg) => {
        const regApps = applications.filter((a) => a.region === reg);
        const approved = regApps.filter((a) => a.status === "APPROVED").length;
        const reverted = regApps.filter((a) => a.status === "DEFICIENCY_REVERTED").length;
        return [
          `"${reg}"`,
          `"${regApps.length}"`,
          `"${regApps.filter((a) => a.currentStageIndex > 0).length}"`,
          `"${approved}"`,
          `"${reverted}"`,
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Statutory Compliance & Pendency Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export official approval records, inspection rosters, and institutional compliance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-gov-blue hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white p-2 rounded-xl shadow-xs gap-1 no-print">
        {([
          { key: "PENDENCY", label: "Application Pendency" },
          { key: "EVC", label: "EVC Inspections" },
          { key: "UNDERTAKINGS", label: "Undertaking Compliance" },
          { key: "DOCUMENTS", label: "Document & Lease Validity" },
          { key: "OVERDUE", label: "Overdue & Reverted Cases" },
          { key: "REGIONAL", label: "Region-Wise Performance" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-gov-blue text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-lg font-bold">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h1>
        <h2 className="text-sm font-semibold mt-1">Approval & Compliance Monitoring Ledger: {activeTab} Report</h2>
        <p className="text-xs text-slate-500">Simulated As of Date: {simulatedDate}</p>
      </div>

      {/* Report Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {activeTab === "PENDENCY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">Application No</th>
                  <th className="px-3 py-3">Institution</th>
                  <th className="px-3 py-3">Region</th>
                  <th className="px-3 py-3">Proposal Category</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{a.applicationNumber}</td>
                    <td className="px-3 py-2.5 text-slate-800 font-medium">{a.institutionName}</td>
                    <td className="px-3 py-2.5 font-mono">{a.region}</td>
                    <td className="px-3 py-2.5 text-slate-600">{a.applicationType}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{a.currentStage}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatDateIndian(a.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "EVC" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">App No</th>
                  <th className="px-3 py-3">Institution</th>
                  <th className="px-3 py-3">Scheduled Date</th>
                  <th className="px-3 py-3">Committee Status</th>
                  <th className="px-3 py-3">Chairman</th>
                  <th className="px-4 py-3 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {evcs.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono font-semibold">{e.applicationNumber}</td>
                    <td className="px-3 py-2.5 text-slate-800 font-medium">{e.institutionName}</td>
                    <td className="px-3 py-2.5 font-mono">{formatDateIndian(e.scheduledDate)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                    <td className="px-3 py-2.5 text-slate-700">{e.committeeChairman}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{e.recommendation || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "UNDERTAKINGS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-3 py-3">Approval Reference</th>
                  <th className="px-3 py-3">Mandatory Condition</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Escalation Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {undertakings.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 text-slate-900 font-semibold">{u.institutionName}</td>
                    <td className="px-3 py-2.5 font-mono text-gov-blue">{u.approvalRef}</td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-xs truncate">{u.conditionText}</td>
                    <td className="px-3 py-2.5 font-mono">{formatDateIndian(u.dueDate)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-800">{u.escalationLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "DOCUMENTS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">Institution & Region</th>
                  <th className="px-3 py-3">Document Category</th>
                  <th className="px-3 py-3">Reg. Number</th>
                  <th className="px-3 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Validity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{d.institutionName} ({d.region})</td>
                    <td className="px-3 py-2.5 text-slate-800">{d.documentType}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">{d.documentNumber}</td>
                    <td className="px-3 py-2.5 font-mono">{formatDateIndian(d.validTo)}</td>
                    <td className="px-4 py-2.5 text-right"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "OVERDUE" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">App No</th>
                  <th className="px-3 py-3">Institution</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3">Recorded Deficiency / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications
                  .filter((a) => a.status === "DEFICIENCY_REVERTED")
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{a.applicationNumber}</td>
                      <td className="px-3 py-2.5 font-medium">{a.institutionName}</td>
                      <td className="px-3 py-2.5">{a.currentStage}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-2.5 text-rose-800 font-medium">{a.deficiencyReason}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "REGIONAL" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">AICTE Regional Jurisdiction</th>
                  <th className="px-3 py-3">Total Proposals</th>
                  <th className="px-3 py-3">Scrutiny Completed</th>
                  <th className="px-3 py-3">Approved Orders</th>
                  <th className="px-3 py-3">Returned for Deficiency</th>
                  <th className="px-4 py-3 text-right">Approval Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {["North", "South", "West", "East", "Central"].map((reg) => {
                  const regApps = applications.filter((a) => a.region === reg);
                  const approved = regApps.filter((a) => a.status === "APPROVED").length;
                  const reverted = regApps.filter((a) => a.status === "DEFICIENCY_REVERTED").length;
                  const rate = Math.round((approved / (regApps.length || 1)) * 100);

                  return (
                    <tr key={reg} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">{reg} Regional Office</td>
                      <td className="px-3 py-3 font-mono font-semibold">{regApps.length}</td>
                      <td className="px-3 py-3 font-mono">{regApps.filter((a) => a.currentStageIndex > 0).length}</td>
                      <td className="px-3 py-3 font-mono text-emerald-700 font-bold">{approved}</td>
                      <td className="px-3 py-3 font-mono text-rose-700 font-bold">{reverted}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gov-blue">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
