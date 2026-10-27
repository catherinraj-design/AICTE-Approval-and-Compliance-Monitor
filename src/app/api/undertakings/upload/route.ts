import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { undertakingId, evidenceFileName, evidenceRemarks } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const undertaking = await prisma.undertaking.findUnique({
      where: { id: undertakingId },
    });

    if (!undertaking) {
      return NextResponse.json({ error: "Undertaking not found" }, { status: 404 });
    }

    const beforeState = { status: undertaking.status, evidenceFileName: undertaking.evidenceFileName };

    const updated = await prisma.undertaking.update({
      where: { id: undertakingId },
      data: {
        status: "SUBMITTED",
        evidenceFileName: evidenceFileName || "Compliance_Proof_Document.pdf",
        evidenceRemarks: evidenceRemarks || "Proof of compliance submitted as per council directives.",
        evidenceUploadedAt: simulatedNow,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "Institution Registrar",
      userRole: "INSTITUTION",
      action: "UNDERTAKING_EVIDENCE_UPLOAD",
      entityType: "Undertaking",
      entityId: undertaking.id,
      beforeState,
      afterState: { status: "SUBMITTED", evidenceFileName: updated.evidenceFileName },
      reason: `Compliance evidence document submitted online for review.`,
      timestamp: simulatedNow,
    });

    // Notify Regional Officer
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Compliance Proof Uploaded: ${undertaking.institutionName}`,
        message: `Evidence submitted for condition: "${undertaking.conditionText.substring(0, 50)}...". Ready for officer verification.`,
        type: "INFO",
        targetRole: "REGIONAL_OFFICER",
        link: `/undertakings`,
        createdAt: simulatedNow,
      },
    });

    return NextResponse.json({ success: true, undertaking: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error uploading evidence";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
