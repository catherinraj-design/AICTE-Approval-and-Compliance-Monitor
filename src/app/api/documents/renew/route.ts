import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, renewalFileName, renewalRemarks, newValidTo } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const doc = await prisma.documentValidity.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const beforeState = { status: doc.status };

    const updated = await prisma.documentValidity.update({
      where: { id: documentId },
      data: {
        status: "RENEWAL_SUBMITTED",
        renewalFileName: renewalFileName || "Registered_Lease_Deed_Renewal.pdf",
        renewalRemarks: renewalRemarks || "Renewal deed submitted online for regional verification.",
        renewalSubmittedAt: simulatedNow,
        validTo: newValidTo ? new Date(newValidTo) : doc.validTo,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "Institution Registrar",
      userRole: "INSTITUTION",
      action: "DOCUMENT_RENEWAL_SUBMITTED",
      entityType: "Document",
      entityId: doc.id,
      beforeState,
      afterState: { status: "RENEWAL_SUBMITTED", renewalFileName: updated.renewalFileName },
      reason: `Renewal submitted for ${doc.documentType}.`,
      timestamp: simulatedNow,
    });

    // Notify Regional Officer
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Document Renewal Uploaded: ${doc.institutionName}`,
        message: `${doc.documentType} renewal submitted for verification.`,
        type: "INFO",
        targetRole: "REGIONAL_OFFICER",
        targetRegion: doc.region,
        link: `/documents`,
        createdAt: simulatedNow,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error submitting document renewal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
