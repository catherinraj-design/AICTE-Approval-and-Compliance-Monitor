import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, verificationRemarks, extendedValidToYears } = body;

    if (!verificationRemarks || verificationRemarks.trim().length === 0) {
      return NextResponse.json({ error: "Verification remarks are mandatory." }, { status: 400 });
    }

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const doc = await prisma.documentValidity.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const beforeState = { status: doc.status, validTo: doc.validTo };

    const years = extendedValidToYears || 5;
    const newValidTo = new Date(simulatedNow.getTime() + years * 365 * 24 * 60 * 60 * 1000);

    const updated = await prisma.documentValidity.update({
      where: { id: documentId },
      data: {
        status: "VERIFIED",
        validTo: newValidTo,
        verifiedBy: req.cookies.get("aicte_user_id")?.value || "Regional Officer",
        verifiedAt: simulatedNow,
        verificationRemarks,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "Regional Officer",
      userRole: req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER",
      action: "DOCUMENT_VERIFIED",
      entityType: "Document",
      entityId: doc.id,
      beforeState,
      afterState: { status: "VERIFIED", validTo: updated.validTo, verificationRemarks },
      reason: verificationRemarks,
      timestamp: simulatedNow,
    });

    // Notify institution
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Document Renewal Approved: ${doc.documentType}`,
        message: `Your ${doc.documentType} renewal has been verified and validity extended until ${newValidTo.toLocaleDateString("en-GB")}.`,
        type: "SUCCESS",
        targetRole: "INSTITUTION",
        link: `/documents`,
        createdAt: simulatedNow,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying document";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
