"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users2,
  CalendarCheck,
  FileCheck2,
  ShieldAlert,
  Sliders,
  Mail,
  History,
  BarChart3,
  Building,
} from "lucide-react";
import { Role } from "@/lib/types";

interface SidebarProps {
  userRole: Role;
  institutionName?: string;
  region?: string;
}

export function Sidebar({ userRole, institutionName, region }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard & Pendency",
      href: "/",
      icon: LayoutDashboard,
      roles: ["INSTITUTION", "REGIONAL_OFFICER", "BUREAU_OFFICER", "COMMITTEE_MEMBER", "ADMIN"],
    },
    {
      label: "Approval Applications",
      href: "/applications",
      icon: FileText,
      roles: ["INSTITUTION", "REGIONAL_OFFICER", "BUREAU_OFFICER", "COMMITTEE_MEMBER", "ADMIN"],
    },
    {
      label: "Submit New Proposal",
      href: "/applications/new",
      icon: PlusCircle,
      roles: ["INSTITUTION", "ADMIN"],
      highlight: true,
    },
    {
      label: "EVC Inspections Queue",
      href: "/evc",
      icon: CalendarCheck,
      roles: ["REGIONAL_OFFICER", "BUREAU_OFFICER", "COMMITTEE_MEMBER", "ADMIN"],
    },
    {
      label: "Time-Bound Undertakings",
      href: "/undertakings",
      icon: FileCheck2,
      roles: ["INSTITUTION", "REGIONAL_OFFICER", "BUREAU_OFFICER", "COMMITTEE_MEMBER", "ADMIN"],
    },
    {
      label: "Lease & Document Validity",
      href: "/documents",
      icon: ShieldAlert,
      roles: ["INSTITUTION", "REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"],
    },
    {
      label: "Rule Engine Config",
      href: "/rules",
      icon: Sliders,
      roles: ["ADMIN", "BUREAU_OFFICER"],
    },
    {
      label: "Email Dispatch Log",
      href: "/email-logs",
      icon: Mail,
      roles: ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN"],
    },
    {
      label: "Append-Only Audit Trail",
      href: "/audit",
      icon: History,
      roles: ["REGIONAL_OFFICER", "BUREAU_OFFICER", "ADMIN", "COMMITTEE_MEMBER"],
    },
    {
      label: "Compliance Reports & Export",
      href: "/reports",
      icon: BarChart3,
      roles: ["INSTITUTION", "REGIONAL_OFFICER", "BUREAU_OFFICER", "COMMITTEE_MEMBER", "ADMIN"],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-64px)]">
      {/* Active Persona Context Card */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Current Access Context
        </div>
        <div className="text-sm font-semibold text-white mt-0.5 truncate">
          {userRole === "INSTITUTION"
            ? institutionName || "Apex Institute of Tech"
            : userRole.replace(/_/g, " ")}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>Region: {region || "National Jurisdiction"}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-gov-blue text-white shadow-sm"
                  : item.highlight
                  ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : item.highlight ? "text-amber-400" : "text-slate-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Help / Info Pill */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/40">
        <div className="font-semibold text-slate-300">Need Demo Assistance?</div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          Use the header Demo Clock (+7d, +30d) to trigger reminders and automatic escalations live.
        </p>
      </div>
    </aside>
  );
}
