"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";
import { formatDateIndian } from "@/lib/formatters";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ESCALATION" | "SUCCESS";
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onUpdateUnread,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUnread?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ESCALATION" | "WARNING">("ALL");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        if (onUpdateUnread) onUpdateUnread(data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUpdateUnread) onUpdateUnread(0);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === "ALL") return true;
    return n.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gov-blue" />
            <h3 className="font-semibold text-slate-800">Notification & Alert Center</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs text-gov-blue hover:text-blue-800 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
              title="Mark all notifications as read"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-3 py-1.5 text-xs font-medium gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-full ${
              filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("ESCALATION")}
            className={`px-3 py-1 rounded-full flex items-center gap-1 ${
              filter === "ESCALATION"
                ? "bg-rose-600 text-white"
                : "text-rose-700 bg-rose-50 hover:bg-rose-100"
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Escalations
          </button>
          <button
            onClick={() => setFilter("WARNING")}
            className={`px-3 py-1 rounded-full flex items-center gap-1 ${
              filter === "WARNING"
                ? "bg-amber-600 text-white"
                : "text-amber-700 bg-amber-50 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Warnings
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Checking alert queue...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No alerts in this category</div>
          ) : (
            filtered.map((item) => {
              let Icon = Info;
              let borderCol = "border-slate-200 bg-white";
              let iconCol = "text-blue-600";

              if (item.type === "ESCALATION") {
                Icon = AlertCircle;
                borderCol = "border-rose-200 bg-rose-50/60";
                iconCol = "text-rose-600";
              } else if (item.type === "WARNING") {
                Icon = AlertTriangle;
                borderCol = "border-amber-200 bg-amber-50/60";
                iconCol = "text-amber-600";
              } else if (item.type === "SUCCESS") {
                Icon = CheckCircle2;
                borderCol = "border-emerald-200 bg-emerald-50/60";
                iconCol = "text-emerald-600";
              }

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border text-xs shadow-xs relative ${borderCol} ${
                    !item.isRead ? "ring-1 ring-blue-400" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconCol}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDateIndian(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                        {item.message}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={onClose}
                          className="inline-flex items-center text-gov-blue hover:underline font-medium text-[11px]"
                        >
                          View Action Item &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-white text-center">
          <Link
            href="/notifications"
            onClick={onClose}
            className="text-xs text-gov-blue hover:text-blue-800 font-semibold"
          >
            View Full Notification History & Email Logs &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
