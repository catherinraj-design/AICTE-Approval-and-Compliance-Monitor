import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { advanceApplicationStage } from "@/lib/workflow";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evcId, reportSummary, deficienciesNoted, recommendation } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const evc = await prisma.eVCRecord.findUnique({
      where: { id: evcId },
    });

    if (!evc) {
      return NextResponse.json({ error: "EVC Record not found" }, { status: 404 });
    }

    const beforeState = { status: evc.status };

    const updatedEvc = await prisma.eVCRecord.update({
      where: { id: evcId },
      data: {
        status: "COMPLETED",
        reportSummary: reportSummary || "Physical verification of laboratories, library and infrastructure completed.",
        deficienciesNoted: deficienciesNoted || "Nil.",
        recommendation: recommendation || "Recommended",
        conductedAt: simulatedNow,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_role")?.value || "COMMITTEE_MEMBER",
      userRole: "COMMITTEE_MEMBER",
      action: "EVC_REPORT_SUBMITTED",
      entityType: "EVC",
      entityId: evc.id,
      beforeState,
      afterState: {
        status: "COMPLETED",
        recommendation: updatedEvc.recommendation,
      },
      reason: `EVC report submitted with recommendation: ${updatedEvc.recommendation}`,
      timestamp: simulatedNow,
    });

    // Advance the associated application's workflow stage!
    await advanceApplicationStage(
      evc.applicationId,
      "EVC Committee Chairman",
      "COMMITTEE_MEMBER",
      `EVC stage successfully completed. Recommendation: ${updatedEvc.recommendation}`
    );

    return NextResponse.json({ success: true, evc: updatedEvc });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error completing EVC";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
