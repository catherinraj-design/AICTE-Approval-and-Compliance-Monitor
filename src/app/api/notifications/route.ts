import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const role = req.cookies.get("aicte_role")?.value;
    const region = req.cookies.get("aicte_region")?.value;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: "ALL" },
          { targetRole: role || "ADMIN" },
          ...(region ? [{ targetRegion: region }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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
