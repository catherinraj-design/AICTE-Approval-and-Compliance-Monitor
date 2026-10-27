import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { undertakingId, decision, officerRemarks } = body; // decision: "VERIFY" | "REJECT"

    if (!officerRemarks || officerRemarks.trim().length === 0) {
      return NextResponse.json({ error: "Mandatory remarks required for compliance verification." }, { status: 400 });
    }

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const undertaking = await prisma.undertaking.findUnique({
      where: { id: undertakingId },
    });

    if (!undertaking) {
      return NextResponse.json({ error: "Undertaking not found" }, { status: 404 });
    }

    const beforeState = { status: undertaking.status };
    const newStatus = decision === "VERIFY" ? "VERIFIED" : "REJECTED";

    const updated = await prisma.undertaking.update({
      where: { id: undertakingId },
      data: {
        status: newStatus,
        escalationLevel: newStatus === "VERIFIED" ? "NONE" : undertaking.escalationLevel,
        verifiedBy: req.cookies.get("aicte_user_id")?.value || "Regional Officer",
        verifiedAt: simulatedNow,
        officerRemarks,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "Regional Officer",
      userRole: req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER",
      action: decision === "VERIFY" ? "UNDERTAKING_VERIFIED" : "UNDERTAKING_REJECTED",
      entityType: "Undertaking",
      entityId: undertaking.id,
      beforeState,
      afterState: { status: newStatus, officerRemarks },
      reason: officerRemarks,
      timestamp: simulatedNow,
    });

    // Notify institution
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Undertaking ${newStatus}: ${undertaking.institutionName}`,
        message: `Condition review result: ${newStatus}. Remarks: ${officerRemarks}`,
        type: newStatus === "VERIFIED" ? "SUCCESS" : "WARNING",
        targetRole: "INSTITUTION",
        link: `/undertakings`,
        createdAt: simulatedNow,
      },
    });

    return NextResponse.json({ success: true, undertaking: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying undertaking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
