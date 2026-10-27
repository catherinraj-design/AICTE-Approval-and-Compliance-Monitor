import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStagesForPath } from "@/lib/workflow";
import { ApplicationDetailClient } from "@/components/ApplicationDetailClient";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const user = getCurrentUser();

  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app) {
    notFound();
  }

  // Retrieve configured stages for this application's path
  const stages = await getStagesForPath(app.stagePathId);

  // Retrieve movement audit logs for this application
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "Application",
      entityId: app.id,
    },
    orderBy: { timestamp: "desc" },
  });

  return (
    <div className="space-y-6">
      <ApplicationDetailClient
        application={{
          id: app.id,
          applicationNumber: app.applicationNumber,
          institutionName: app.institutionName,
          region: app.region,
          applicationType: app.applicationType,
          academicYear: app.academicYear,
          stagePathId: app.stagePathId,
          currentStage: app.currentStage,
          currentStageIndex: app.currentStageIndex,
          status: app.status,
          stageStartedAt: app.stageStartedAt.toISOString(),
          submittedAt: app.submittedAt.toISOString(),
          deficiencyReason: app.deficiencyReason,
          finalDecisionRemarks: app.finalDecisionRemarks,
          finalDecisionBy: app.finalDecisionBy,
          finalDecisionDate: app.finalDecisionDate ? app.finalDecisionDate.toISOString() : null,
          caseSummary: app.caseSummary,
          communicationDraft: app.communicationDraft,
          isNewInstitution: app.isNewInstitution,
          proposedIntake: app.proposedIntake,
          courseLevel: app.courseLevel,
        }}
        stages={stages}
        currentUserRole={user.role}
        currentUserId={user.name}
        auditEvents={auditLogs.map((a) => ({
          id: a.id,
          timestamp: a.timestamp.toISOString(),
          performedBy: a.performedBy,
          userRole: a.userRole,
          action: a.action,
          reason: a.reason,
        }))}
      />
    </div>
  );
}
