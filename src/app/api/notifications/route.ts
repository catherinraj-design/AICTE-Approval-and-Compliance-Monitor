import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const role = req.cookies.get("aicte_role")?.value || "ADMIN";
    const region = req.cookies.get("aicte_region")?.value;

    let whereClause: Record<string, unknown> = {};

    if (role === "ADMIN" || role === "BUREAU_OFFICER") {
      // Senior authorities see all notifications and escalations across the council
      whereClause = {};
    } else if (role === "REGIONAL_OFFICER") {
      whereClause = {
        OR: [
          { targetRole: "ALL" },
          { targetRole: "REGIONAL_OFFICER" },
          ...(region ? [{ targetRegion: region }] : []),
        ],
      };
    } else if (role === "INSTITUTION") {
      whereClause = {
        OR: [
          { targetRole: "ALL" },
          { targetRole: "INSTITUTION" },
          ...(region ? [{ targetRegion: region }] : []),
        ],
      };
    } else if (role === "COMMITTEE_MEMBER") {
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
      take: 60,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error marking notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
