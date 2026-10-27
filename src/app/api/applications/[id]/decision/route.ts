import { NextRequest, NextResponse } from "next/server";
import { recordFinalDecision } from "@/lib/workflow";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const officerName = body.officerName || "Competent Authority";
    const officerRole = body.officerRole || req.cookies.get("aicte_role")?.value || "BUREAU_OFFICER";
    const decision = body.decision; // APPROVED | REJECTED | CONDITIONAL_APPROVAL
    const remarks = body.remarks;
    const conditionalUndertakingText = body.conditionalUndertakingText;
    const conditionDueDateDays = body.conditionDueDateDays;

    if (!remarks || remarks.trim().length === 0) {
      return NextResponse.json({ error: "Mandatory remarks must be provided for final decision." }, { status: 400 });
    }

    if (!["APPROVED", "REJECTED", "CONDITIONAL_APPROVAL"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision value." }, { status: 400 });
    }

    const updatedApp = await recordFinalDecision(
      id,
      officerName,
      officerRole,
      decision,
      remarks,
      conditionalUndertakingText,
      conditionDueDateDays
    );

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error recording final decision";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
