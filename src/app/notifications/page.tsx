import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NotificationsPageClient } from "@/components/NotificationsPageClient";
import { Bell, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = getCurrentUser();

  let whereClause: Record<string, unknown> = {};

  if (user.role === "ADMIN" || user.role === "BUREAU_OFFICER") {
    whereClause = {}; // Senior authorities see full notification stream
  } else if (user.role === "REGIONAL_OFFICER") {
    whereClause = {
      OR: [
        { targetRole: "ALL" },
        { targetRole: "REGIONAL_OFFICER" },
        ...(user.region ? [{ targetRegion: user.region }] : []),
      ],
    };
  } else if (user.role === "INSTITUTION") {
    whereClause = {
      OR: [
        { targetRole: "ALL" },
        { targetRole: "INSTITUTION" },
        ...(user.region ? [{ targetRegion: user.region }] : []),
      ],
    };
  } else if (user.role === "COMMITTEE_MEMBER") {
    whereClause = {
      OR: [
        { targetRole: "ALL" },
        { targetRole: "COMMITTEE_MEMBER" },
      ],
    };
  }

  const notifications = await prisma.notification.findMany({
    where: whereClause,
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

      <NotificationsPageClient
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          targetRole: n.targetRole,
          targetRegion: n.targetRegion,
          link: n.link,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
        userRole={user.role}
      />
    </div>
  );
}
