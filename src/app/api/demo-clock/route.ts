import { NextRequest, NextResponse } from "next/server";
import { getSimulatedDateFromOffset, BASE_DEMO_DATE } from "@/lib/demoClock";
import { runRules } from "@/lib/rulesEngine";
import { logAuditEvent } from "@/lib/audit";
import { formatDateIndian } from "@/lib/formatters";

export async function GET(req: NextRequest) {
  const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
  const simulatedDate = getSimulatedDateFromOffset(offsetDays);
  return NextResponse.json({
    offsetDays,
    simulatedDate: simulatedDate.toISOString(),
    formattedDate: formatDateIndian(simulatedDate),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let newOffset = 0;

    const currentOffset = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);

    if (body.action === "add_days") {
      newOffset = currentOffset + (body.days || 7);
    } else if (body.action === "set_days") {
      newOffset = body.days || 0;
    } else if (body.action === "reset") {
      newOffset = 0;
    }

    const simulatedDate = getSimulatedDateFromOffset(newOffset);

    // Immediately execute rule check as of the new simulated date!
    const ruleResult = await runRules(simulatedDate);

    await logAuditEvent({
      performedBy: "Demo Clock Controller",
      userRole: "SYSTEM",
      action: "DEMO_CLOCK_ADVANCED",
      entityType: "System",
      entityId: "DEMO-CLOCK",
      beforeState: { offsetDays: currentOffset },
      afterState: { offsetDays: newOffset, simulatedDate: simulatedDate.toISOString() },
      reason: `System simulated clock shifted by ${newOffset - currentOffset} day(s) to ${formatDateIndian(simulatedDate)}. Rules evaluated live.`,
      timestamp: simulatedDate,
    });

    const response = NextResponse.json({
      success: true,
      offsetDays: newOffset,
      simulatedDate: simulatedDate.toISOString(),
      formattedDate: formatDateIndian(simulatedDate),
      ruleResult,
    });

    response.cookies.set("aicte_demo_offset_days", String(newOffset), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating demo clock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
