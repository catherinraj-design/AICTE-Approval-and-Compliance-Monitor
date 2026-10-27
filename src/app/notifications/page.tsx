import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTimeIndian } from "@/lib/formatters";
import Link from "next/link";
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = getCurrentUser();

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { targetRole: "ALL" },
        { targetRole: user.role },
        ...(user.region ? [{ targetRegion: user.region }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gov-blue" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              In-App Notification & Alert Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workflow progress alerts, EVC inspection schedules, and multi-tier compliance escalations.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Logged for role: <strong className="text-slate-800">{user.role.replace(/_/g, " ")}</strong>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No notifications in your queue.
          </div>
        ) : (
          notifications.map((item) => {
            let Icon = Info;
            let iconCol = "text-blue-600 bg-blue-50";
            if (item.type === "ESCALATION") {
              Icon = AlertCircle;
              iconCol = "text-rose-600 bg-rose-50";
            } else if (item.type === "WARNING") {
              Icon = AlertTriangle;
              iconCol = "text-amber-600 bg-amber-50";
            } else if (item.type === "SUCCESS") {
              Icon = CheckCircle2;
              iconCol = "text-emerald-600 bg-emerald-50";
            }

            return (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/70 ${
                  !item.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${iconCol} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTimeIndian(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>

                {item.link && (
                  <Link
                    href={item.link}
                    className="shrink-0 inline-flex items-center gap-1 text-xs text-gov-blue hover:text-blue-800 font-semibold px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200"
                  >
                    <span>View Item</span>
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
