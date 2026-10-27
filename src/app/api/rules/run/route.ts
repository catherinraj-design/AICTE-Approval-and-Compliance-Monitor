import { NextRequest, NextResponse } from "next/server";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";
import { runRules } from "@/lib/rulesEngine";
import { logAuditEvent } from "@/lib/audit";
import { formatDateIndian } from "@/lib/formatters";

export async function POST(req: NextRequest) {
  try {
    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedDate = getSimulatedDateFromOffset(offsetDays);

    const result = await runRules(simulatedDate);

    await logAuditEvent({
      performedBy: "Officer Manual Trigger",
      userRole: req.cookies.get("aicte_role")?.value || "ADMIN",
      action: "MANUAL_RULE_CHECK",
      entityType: "Rule",
      entityId: "SYSTEM-RULES",
      beforeState: null,
      afterState: result as unknown as Record<string, unknown>,
      reason: `Manual execution of rule engine evaluated as of ${formatDateIndian(simulatedDate)}.`,
      timestamp: simulatedDate,
    });

    return NextResponse.json({
      success: true,
      message: `Rule engine evaluated successfully as of ${formatDateIndian(simulatedDate)}`,
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error executing rule engine";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
