"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  RotateCcw,
  Play,
  Bell,
  Building2,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";
import { NotificationDrawer } from "./NotificationDrawer";
import { MOCK_USERS, MockUserSession } from "@/lib/types";
import { formatDateIndian } from "@/lib/formatters";

export function Header({ initialUser }: { initialUser?: MockUserSession }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MockUserSession>(
    initialUser || MOCK_USERS[1] // Default RO
  );
  const [simulatedDate, setSimulatedDate] = useState<string>("26-10-2026");
  const [offsetDays, setOffsetDays] = useState<number>(0);
  const [isClockLoading, setIsClockLoading] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [lastRuleMessage, setLastRuleMessage] = useState<string | null>(null);

  // Sync clock and notif on mount
  useEffect(() => {
    fetch("/api/demo-clock")
      .then((r) => r.json())
      .then((data) => {
        if (data.formattedDate) {
          setSimulatedDate(data.formattedDate);
          setOffsetDays(data.offsetDays || 0);
        }
      })
      .catch(console.error);

    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(console.error);
  }, []);

  const handleAdvanceClock = async (days: number) => {
    try {
      setIsClockLoading(true);
      const res = await fetch("/api/demo-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_days", days }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedDate(data.formattedDate);
        setOffsetDays(data.offsetDays);
        setLastRuleMessage(
          `Date advanced by +${days} days. Rules triggered: ${data.ruleResult.undertakingsEscalated} escalations, ${data.ruleResult.notificationsCreated} alerts generated!`
        );
        setTimeout(() => setLastRuleMessage(null), 6000);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClockLoading(false);
    }
  };

  const handleResetClock = async () => {
    try {
      setIsClockLoading(true);
      const res = await fetch("/api/demo-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedDate(data.formattedDate);
        setOffsetDays(0);
        setLastRuleMessage("Clock reset to base reference date (26-10-2026).");
        setTimeout(() => setLastRuleMessage(null), 4000);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClockLoading(false);
    }
  };

  const handleRunRulesNow = async () => {
    try {
      setIsClockLoading(true);
      const res = await fetch("/api/rules/run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLastRuleMessage(
          `Live Rule Check Completed: ${data.result.undertakingsEscalated} undertakings escalated, ${data.result.evcsDelayed} delayed EVCs flagged.`
        );
        setTimeout(() => setLastRuleMessage(null), 6000);
        // Refresh unread count
        fetch("/api/notifications")
          .then((r) => r.json())
          .then((d) => {
            if (d.unreadCount !== undefined) setUnreadCount(d.unreadCount);
          });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClockLoading(false);
    }
  };

  const handleSwitchRole = async (user: MockUserSession) => {
    try {
      setIsRoleDropdownOpen(false);
      setCurrentUser(user);
      await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          region: user.region,
        }),
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gov-navy text-white shadow-md border-b border-slate-700">
        {/* Top Government Banner */}
        <div className="bg-slate-900/90 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">PROTOTYPE PLATFORM</span>
            <span className="text-slate-400">|</span>
            <span>All India Council for Technical Education (Approval & Compliance Monitoring Prototype)</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <span>Official Jurisdiction: Pan-India (5 Regions)</span>
            <span>AY 2026-27</span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md font-bold text-lg text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg leading-tight tracking-tight text-white">
                  AICTE Approval & Compliance Monitor
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/40">
                  v1.0 Prototype
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Automated Approval Workflows • EVC Inspections • Time-Bound Undertakings • Document Validity
              </p>
            </div>
          </div>

          {/* Action Center: Demo Clock & Role Switcher */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Demo Clock Pill Control */}
            <div className="flex items-center bg-slate-800/90 border border-slate-600 rounded-lg p-1 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 px-2 py-1 text-amber-300 font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{simulatedDate}</span>
                {offsetDays > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1 rounded">
                    +{offsetDays}d
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 border-l border-slate-700 pl-1">
                <button
                  onClick={() => handleAdvanceClock(7)}
                  disabled={isClockLoading}
                  className="px-2 py-1 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-medium transition-colors"
                  title="Advance system date by 7 days"
                >
                  +7d
                </button>
                <button
                  onClick={() => handleAdvanceClock(30)}
                  disabled={isClockLoading}
                  className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded text-[11px] font-medium transition-colors"
                  title="Advance system date by 30 days"
                >
                  +30d
                </button>
                <button
                  onClick={() => handleAdvanceClock(60)}
                  disabled={isClockLoading}
                  className="px-2 py-1 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-medium transition-colors"
                  title="Advance system date by 60 days"
                >
                  +60d
                </button>
                <button
                  onClick={handleResetClock}
                  disabled={isClockLoading}
                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded"
                  title="Reset clock to today"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Run Rules Now Button */}
              <button
                onClick={handleRunRulesNow}
                disabled={isClockLoading}
                className="ml-1 bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-1 rounded text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                title="Evaluate rules & escalation engine immediately"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden lg:inline">Run Rules</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Notification & Escalation Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Interactive Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-left text-white shadow-xs transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="max-w-[140px] md:max-w-[180px] truncate">
                  <div className="font-semibold text-[11px] text-amber-300 uppercase tracking-wider">
                    {currentUser.role.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-slate-200 truncate">
                    {currentUser.name.split(" ")[0]} ({currentUser.region || "All"})
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Mock Persona / Role
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {MOCK_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchRole(user)}
                        className={`w-full px-3 py-2 text-left hover:bg-blue-50/80 flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-b-0 ${
                          currentUser.id === user.id ? "bg-blue-50 font-medium" : ""
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            user.role === "ADMIN"
                              ? "bg-purple-500"
                              : user.role === "BUREAU_OFFICER"
                              ? "bg-blue-600"
                              : user.role === "REGIONAL_OFFICER"
                              ? "bg-emerald-500"
                              : user.role === "COMMITTEE_MEMBER"
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                            <span>{user.role.replace(/_/g, " ")}</span>
                            {user.region && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {user.region}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-700 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.designation}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Rule Execution Feedback Banner */}
        {lastRuleMessage && (
          <div className="bg-emerald-950/90 text-emerald-200 border-t border-emerald-600/30 px-4 py-1.5 text-xs flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{lastRuleMessage}</span>
            </div>
            <button
              onClick={() => setLastRuleMessage(null)}
              className="text-emerald-400 hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>

      {/* Notification Drawer Modal */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onUpdateUnread={(count) => setUnreadCount(count)}
      />
    </>
  );
}
