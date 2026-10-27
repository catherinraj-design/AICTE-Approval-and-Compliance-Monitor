"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ChevronRight, FileText } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateIndian, calculateDaysBetween, getAgeingBucket } from "@/lib/formatters";

export interface ApplicationRow {
  id: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  applicationType: string;
  currentStage: string;
  status: string;
  assignedOfficerName: string | null;
  stageStartedAt: string;
  submittedAt: string;
  isNewInstitution: boolean;
}

interface TableProps {
  applications: ApplicationRow[];
  simulatedDate: string;
  isRoleRestricted?: boolean;
}

export function ApplicationsTable({ applications, simulatedDate, isRoleRestricted = false }: TableProps) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedAge, setSelectedAge] = useState("ALL");

  const regions = ["ALL", "North", "South", "West", "East", "Central"];
  const stages = [
    "ALL",
    "Submitted",
    "Scrutiny",
    "EVC",
    "SAC_SHC",
    "Ready for Decision",
    "Approved",
    "Rejected",
    "Conditional Approval",
  ];
  const statuses = [
    "ALL",
    "PENDING",
    "IN_REVIEW",
    "DEFICIENCY_REVERTED",
    "READY_FOR_DECISION",
    "APPROVED",
    "REJECTED",
    "CONDITIONAL_APPROVAL",
  ];
  const ageBuckets = ["ALL", "0-15", "16-30", "31-60", "60+"];

  // Filter logic
  const filtered = applications.filter((app) => {
    // Search
    const q = search.toLowerCase();
    const matchSearch =
      app.applicationNumber.toLowerCase().includes(q) ||
      app.institutionName.toLowerCase().includes(q) ||
      (app.assignedOfficerName && app.assignedOfficerName.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Region
    if (selectedRegion !== "ALL" && app.region !== selectedRegion) return false;

    // Stage
    if (selectedStage !== "ALL" && app.currentStage !== selectedStage) return false;

    // Status
    if (selectedStatus !== "ALL" && app.status !== selectedStatus) return false;

    // Age
    if (selectedAge !== "ALL") {
      const days = calculateDaysBetween(app.stageStartedAt, simulatedDate);
      const bucket = getAgeingBucket(days);
      if (bucket !== selectedAge) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by application number, institution, or officer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium self-end md:self-center">
            Showing <strong className="text-slate-800">{filtered.length}</strong> of {applications.length} cases
          </div>
        </div>

        {/* Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {!isRoleRestricted && (
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md text-xs py-1.5 px-2 text-slate-700"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r === "ALL" ? "All Regions" : `${r} Region`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
              Workflow Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md text-xs py-1.5 px-2 text-slate-700"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Stages" : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md text-xs py-1.5 px-2 text-slate-700"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "All Statuses" : st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
              Ageing Bucket
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md text-xs py-1.5 px-2 text-slate-700"
            >
              {ageBuckets.map((b) => (
                <option key={b} value={b}>
                  {b === "ALL" ? "All Ages" : `${b} days in stage`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Application Dossier</th>
              <th className="px-3 py-3">Institution & Region</th>
              <th className="px-3 py-3">Current Stage</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Age in Stage</th>
              <th className="px-3 py-3">Scrutiny Officer</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No applications match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const daysInStage = calculateDaysBetween(app.stageStartedAt, simulatedDate);
                const isOverdue = daysInStage > 30 && !["APPROVED", "REJECTED"].includes(app.status);

                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gov-blue shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">{app.applicationNumber}</div>
                          <div className="text-[11px] text-slate-500">{app.applicationType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800 line-clamp-1">{app.institutionName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          {app.region}
                        </span>
                        {app.isNewInstitution && (
                          <span className="bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                            New Inst.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-800">{app.currentStage}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`font-mono font-medium px-2 py-0.5 rounded text-xs ${
                          isOverdue
                            ? "bg-rose-100 text-rose-800 font-bold"
                            : daysInStage > 15
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {daysInStage} days
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {app.assignedOfficerName || "Regional Desk"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 bg-white hover:bg-gov-blue hover:text-white border border-slate-300 text-gov-blue font-semibold px-2.5 py-1 rounded text-xs transition-colors shadow-2xs"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
