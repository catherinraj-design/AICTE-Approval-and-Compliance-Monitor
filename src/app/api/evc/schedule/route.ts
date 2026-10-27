import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      applicationId,
      scheduledDate,
      committeeChairman,
      committeeMember2,
      committeeMember3,
      visitType,
    } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const scheduledDateTime = new Date(scheduledDate);

    const existing = await prisma.eVCRecord.findUnique({
      where: { applicationId },
    });

    let evc;
    const beforeState = existing ? { scheduledDate: existing.scheduledDate, status: existing.status } : null;

    if (existing) {
      evc = await prisma.eVCRecord.update({
        where: { applicationId },
        data: {
          scheduledDate: scheduledDateTime,
          committeeChairman: committeeChairman || existing.committeeChairman,
          committeeMember2: committeeMember2 || existing.committeeMember2,
          committeeMember3: committeeMember3 || existing.committeeMember3,
          visitType: visitType || existing.visitType,
          status: "UPCOMING",
          scheduledBy: req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER",
        },
      });
    } else {
      evc = await prisma.eVCRecord.create({
        data: {
          id: `evc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          applicationId: app.id,
          applicationNumber: app.applicationNumber,
          institutionName: app.institutionName,
          region: app.region,
          isNewInstitution: app.isNewInstitution,
          visitType: visitType || "Physical",
          scheduledDate: scheduledDateTime,
          committeeChairman: committeeChairman || "Prof. Dr. Amitabh Sen (Chairman)",
          committeeMember2: committeeMember2 || "Dr. K. Srinivas (Subject Expert)",
          committeeMember3: committeeMember3 || "State Directorate Nominee",
          status: "UPCOMING",
          scheduledBy: req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER",
        },
      });
    }

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER",
      userRole: "REGIONAL_OFFICER",
      action: "EVC_SCHEDULED",
      entityType: "EVC",
      entityId: evc.id,
      beforeState,
      afterState: {
        scheduledDate: evc.scheduledDate,
        committeeChairman: evc.committeeChairman,
        status: evc.status,
      },
      reason: `Expert Visiting Committee inspection scheduled for ${evc.scheduledDate.toISOString().slice(0, 10)}.`,
      timestamp: simulatedNow,
    });

    // Notify institution and committee
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `EVC Inspection Scheduled: ${app.applicationNumber}`,
        message: `Physical inspection scheduled for ${scheduledDateTime.toLocaleDateString("en-GB")}. Committee constituted.`,
        type: "INFO",
        targetRole: "INSTITUTION",
        targetRegion: app.region,
        link: `/evc`,
        createdAt: simulatedNow,
      },
    });

    return NextResponse.json({ success: true, evc });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error scheduling EVC";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
