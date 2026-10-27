import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function GET() {
  try {
    const paths = await prisma.stagePathConfig.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ success: true, paths });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving stage paths";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stages, description, isActive } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const existing = await prisma.stagePathConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Stage path not found" }, { status: 404 });
    }

    const beforeState = { stages: existing.stages, isActive: existing.isActive };

    const updated = await prisma.stagePathConfig.update({
      where: { id },
      data: {
        stages: stages ? JSON.stringify(stages) : existing.stages,
        description: description || existing.description,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedAt: simulatedNow,
      },
    });

    await logAuditEvent({
      performedBy: req.cookies.get("aicte_user_id")?.value || "System Administrator",
      userRole: "ADMIN",
      action: "STAGE_PATH_MODIFIED",
      entityType: "System",
      entityId: id,
      beforeState,
      afterState: { stages: updated.stages, isActive: updated.isActive },
      reason: `Workflow stage path config updated.`,
      timestamp: simulatedNow,
    });

    return NextResponse.json({ success: true, path: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating stage path";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
