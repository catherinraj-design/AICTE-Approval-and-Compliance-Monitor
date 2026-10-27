import prisma from "./prisma";

export interface LogAuditParams {
  performedBy: string;
  userRole: string;
  action: string;
  entityType: "Application" | "EVC" | "Undertaking" | "Document" | "Rule" | "System";
  entityId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason: string;
  timestamp?: Date;
}

export async function logAuditEvent(params: LogAuditParams) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return await prisma.auditLog.create({
      data: {
        id,
        performedBy: params.performedBy || "System Automator",
        userRole: params.userRole || "SYSTEM",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeState: params.beforeState ? JSON.stringify(params.beforeState) : null,
        afterState: params.afterState ? JSON.stringify(params.afterState) : null,
        reason: params.reason || "Automatic workflow / compliance update",
        timestamp: params.timestamp || new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to write append-only audit log:", error);
    return null;
  }
}
