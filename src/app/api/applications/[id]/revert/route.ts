import { NextRequest, NextResponse } from "next/server";
import { revertApplicationForDeficiency } from "@/lib/workflow";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const officerName = body.officerName || "Regional Officer";
    const officerRole = body.officerRole || req.cookies.get("aicte_role")?.value || "REGIONAL_OFFICER";
    const reason = body.reason;
    const returnType = body.returnType || "DEFICIENCY";

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "A mandatory reason must be provided to return an application." }, { status: 400 });
    }

    const updatedApp = await revertApplicationForDeficiency(id, officerName, officerRole, reason, returnType);

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error returning application";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
