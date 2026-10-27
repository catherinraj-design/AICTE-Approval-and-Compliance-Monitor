"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Check,
  Search,
  Filter,
} from "lucide-react";
import { formatDateTimeIndian } from "@/lib/formatters";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string; // INFO, WARNING, ESCALATION, SUCCESS
  targetRole: string;
  targetRegion?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsPageClient({
  initialNotifications,
  userRole,
}: {
  initialNotifications: NotificationRecord[];
  userRole: string;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState<"ALL" | "ESCALATION" | "WARNING" | "INFO">("ALL");
  const [search, setSearch] = useState("");

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((item) => {
    if (filterType !== "ALL" && item.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.targetRole.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const escalationCount = notifications.filter((n) => n.type === "ESCALATION").length;
  const warningCount = notifications.filter((n) => n.type === "WARNING").length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notification title, message, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Filters */}
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType("ESCALATION")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              filterType === "ESCALATION"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Escalations ({escalationCount})</span>
          </button>
          <button
            onClick={() => setFilterType("WARNING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              filterType === "WARNING"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warnings ({warningCount})</span>
          </button>

          <button
            onClick={markAllRead}
            className="ml-auto md:ml-2 text-xs font-semibold text-gov-blue hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications match your current filter.
          </div>
        ) : (
          filtered.map((item) => {
            let Icon = Info;
            let iconCol = "text-blue-600 bg-blue-50 border-blue-200";
            let borderHover = "hover:border-blue-300";
            let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";

            if (item.type === "ESCALATION") {
              Icon = AlertCircle;
              iconCol = "text-rose-600 bg-rose-50 border-rose-200";
              borderHover = "hover:border-rose-300";
              badgeBg = "bg-rose-100 text-rose-800 border-rose-300";
            } else if (item.type === "WARNING") {
              Icon = AlertTriangle;
              iconCol = "text-amber-600 bg-amber-50 border-amber-200";
              borderHover = "hover:border-amber-300";
              badgeBg = "bg-amber-100 text-amber-800 border-amber-300";
            } else if (item.type === "SUCCESS") {
              Icon = CheckCircle2;
              iconCol = "text-emerald-600 bg-emerald-50 border-emerald-200";
              borderHover = "hover:border-emerald-300";
              badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
            }

            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors hover:bg-slate-50/80 ${borderHover} ${
                  !item.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg border ${iconCol} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${badgeBg}`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTimeIndian(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span>Target Role: <strong className="text-slate-600">{item.targetRole.replace(/_/g, " ")}</strong></span>
                      {item.targetRegion && (
                        <span>• Region: <strong className="text-slate-600">{item.targetRegion}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {item.link && (
                  <Link
                    href={item.link}
                    className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-gov-blue hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <span>View Record</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
