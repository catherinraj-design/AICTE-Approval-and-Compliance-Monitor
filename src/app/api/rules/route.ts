import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function GET() {
  try {
    const rules = await prisma.ruleConfig.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ success: true, rules });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving rules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, thresholdDays, recipientRole, escalationLevel, isActive, actionMessage } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const existing = await prisma.ruleConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const beforeState = {
      thresholdDays: existing.thresholdDays,
      recipientRole: existing.recipientRole,
      escalationLevel: existing.escalationLevel,
      isActive: existing.isActive,
    };

    const updated = await prisma.ruleConfig.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        thresholdDays: thresholdDays !== undefined ? parseInt(thresholdDays, 10) : existing.thresholdDays,
        recipientRole: recipientRole !== undefined ? recipientRole : existing.recipientRole,
        escalationLevel: escalationLevel !== undefined ? escalationLevel : existing.escalationLevel,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        actionMessage: actionMessage !== undefined ? actionMessage : existing.actionMessage,
        updatedAt: simulatedNow,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "System Administrator",
      userRole: "ADMIN",
      action: "RULE_CONFIG_MODIFIED",
      entityType: "Rule",
      entityId: id,
      beforeState,
      afterState: {
        thresholdDays: updated.thresholdDays,
        recipientRole: updated.recipientRole,
        escalationLevel: updated.escalationLevel,
        isActive: updated.isActive,
      },
      reason: `Rule configuration modified by Senior Authority / Admin.`,
      timestamp: simulatedNow,
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating rule";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
