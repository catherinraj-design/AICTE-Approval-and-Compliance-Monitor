import { NextRequest, NextResponse } from "next/server";
import { advanceApplicationStage } from "@/lib/workflow";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const officerName = body.officerName || "Regional Officer";
    const officerRole = body.officerRole || req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER";
    const remarks = body.remarks || "Stage completed satisfactorily upon verification.";

    const updatedApp = await advanceApplicationStage(id, officerName, officerRole, remarks);

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error advancing application stage";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
