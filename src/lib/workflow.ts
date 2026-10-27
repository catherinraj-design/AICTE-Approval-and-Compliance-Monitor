import prisma from "./prisma";
import { logAuditEvent } from "./audit";

export const STAGE_CONFIGS: Record<string, string[]> = {
  PATH_ONLY_SCRUTINY: ["Scrutiny"],
  PATH_SCRUTINY_EVC: ["Scrutiny", "EVC"],
  PATH_ONLY_EVC: ["EVC"],
  PATH_EVC_SAC_SHC: ["EVC", "SAC_SHC"],
  PATH_SCRUTINY_EVC_SAC_SHC: ["Scrutiny", "EVC", "SAC_SHC"],
};

export async function getStagesForPath(pathId: string): Promise<string[]> {
  try {
    const config = await prisma.stagePathConfig.findUnique({
      where: { id: pathId },
    });
    if (config && config.stages) {
      return JSON.parse(config.stages);
    }
  } catch (e) {
    console.error("Error loading stage config from db:", e);
  }
  return STAGE_CONFIGS[pathId] || ["Scrutiny", "EVC"];
}

export function generateElectronicCaseSummary(params: {
  applicationNumber: string;
  institutionName: string;
  region: string;
  applicationType: string;
  academicYear: string;
  currentStage: string;
  status: string;
  proposedIntake?: number | null;
  evcRecord?: {
    scheduledDate: Date;
    status: string;
    recommendation?: string | null;
  } | null;
}): string {
  const intakeStr = params.proposedIntake ? `${params.proposedIntake} seats` : "Existing Approved Intake";
  const evcStr = params.evcRecord
    ? `EVC Status: ${params.evcRecord.status} | Recommendation: ${params.evcRecord.recommendation || "Under Committee Review"}`
    : "EVC Stage: Not Applicable or Queued";

  return `[ELECTRONIC CASE SUMMARY - OFFICIAL DRAFT]
Notice: Generated automatically based on verified application dossier. Draft: requires officer review.

1. BASIC DOSSIER
- Application No: ${params.applicationNumber}
- Institution: ${params.institutionName}
- AICTE Regional Jurisdiction: ${params.region} Regional Office
- Proposal Category: ${params.applicationType} (${params.academicYear})
- Proposed / Sanctioned Intake: ${intakeStr}

2. PROCEDURAL SCRUTINY & INSPECTION SUMMARY
- Scrutiny Status: Cleared by Regional Scrutiny Committee
- ${evcStr}
- Current Stage / Status: ${params.currentStage} (${params.status})

3. DEFICIENCIES & COMPLIANCE OBSERVATIONS
- All statutory affidavits, AICTE approval fees, and land registry deeds verified in initial scrutiny.
- Undertakings on biometric faculty attendance and anti-ragging cell recorded in compliance register.

4. OFFICER RECOMMENDATION FOR HIGHER COMPETENT AUTHORITY
- Docket processed pursuant to AICTE Approval Process Handbook (APH) regulations. Awaiting formal decision review by the designated Regional / Bureau Authority.`;
}

export function generateCommunicationDraft(params: {
  applicationNumber: string;
  institutionName: string;
  region: string;
  decisionOrStage: string;
  decisionRemarks?: string | null;
}): string {
  return `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
[COMMUNICATION DRAFT - REQUIRES OFFICER REVIEW & DIGITAL SIGNATURE]

F.No. AICTE/${params.region}/APP/${params.applicationNumber.replace(/[^0-9]/g, "")}/2026-27

To,
The Principal / Director / Authorized Signatory,
${params.institutionName},
${params.region} Region.

Subject: Official Status Communication regarding Application No. ${params.applicationNumber} for Academic Year 2026-27.

Sir / Madam,

This communication is issued regarding your proposal submitted under the AICTE Approval Workflow Portal.

Current Milestone Reached: ${params.decisionOrStage}
Officer Remarks / Directives:
"${params.decisionRemarks || "Your application dossier has advanced to the next scheduled stage of processing pursuant to Council norms. Ensure compliance documents are kept updated in your portal."}"

Note: This standard electronic communication is a system-generated draft subject to formal approval and dispatch under the authority of the Regional Officer, AICTE.

Yours faithfully,
(Designated Scrutiny / Regional Officer)
AICTE Approval Bureau`;
}

/**
 * Advances an application to the next stage in its configured path.
 * If all stages are completed, sets status to READY_FOR_DECISION.
 */
export async function advanceApplicationStage(
  applicationId: string,
  officerName: string,
  officerRole: string,
  remarks: string
) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!app) {
    throw new Error("Application not found");
  }

  const stages = await getStagesForPath(app.stagePathId);
  const currentIndex = stages.indexOf(app.currentStage);

  const beforeState = {
    currentStage: app.currentStage,
    status: app.status,
    currentStageIndex: app.currentStageIndex,
  };

  let nextStage: string;
  let nextStatus: string;
  let nextIndex: number;

  if (currentIndex === -1) {
    // If it was at Submitted, move to stage 0
    nextIndex = 0;
    nextStage = stages[0];
    nextStatus = "IN_REVIEW";
  } else if (currentIndex + 1 < stages.length) {
    // Move to next stage
    nextIndex = currentIndex + 1;
    nextStage = stages[nextIndex];
    nextStatus = "IN_REVIEW";
  } else {
    // Reached end of path: Ready for decision
    nextIndex = stages.length;
    nextStage = "Ready for Decision";
    nextStatus = "READY_FOR_DECISION";
  }

  // If nextStage is EVC, ensure an EVCRecord exists or is in queue
  if (nextStage === "EVC") {
    const existingEvc = await prisma.eVCRecord.findUnique({
      where: { applicationId: app.id },
    });
    if (!existingEvc) {
      await prisma.eVCRecord.create({
        data: {
          id: `evc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          applicationId: app.id,
          applicationNumber: app.applicationNumber,
          institutionName: app.institutionName,
          region: app.region,
          isNewInstitution: app.isNewInstitution,
          visitType: "Physical",
          scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days ahead
          committeeChairman: "Pending Allocation",
          committeeMember2: "Pending Allocation",
          committeeMember3: "Pending Allocation",
          status: "UPCOMING",
          scheduledBy: officerName,
        },
      });
    }
  }

  const updatedCaseSummary = generateElectronicCaseSummary({
    applicationNumber: app.applicationNumber,
    institutionName: app.institutionName,
    region: app.region,
    applicationType: app.applicationType,
    academicYear: app.academicYear,
    currentStage: nextStage,
    status: nextStatus,
    proposedIntake: app.proposedIntake,
  });

  const updatedDraft = generateCommunicationDraft({
    applicationNumber: app.applicationNumber,
    institutionName: app.institutionName,
    region: app.region,
    decisionOrStage: `${nextStage} (${nextStatus})`,
    decisionRemarks: remarks,
  });

  const now = new Date();

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      currentStage: nextStage,
      currentStageIndex: nextIndex,
      status: nextStatus,
      lastActionDate: now,
      stageStartedAt: now,
      caseSummary: updatedCaseSummary,
      communicationDraft: updatedDraft,
    },
  });

  await logAuditEvent({
    performedBy: officerName,
    userRole: officerRole,
    action: "STAGE_ADVANCED",
    entityType: "Application",
    entityId: applicationId,
    beforeState,
    afterState: {
      currentStage: updated.currentStage,
      status: updated.status,
      currentStageIndex: updated.currentStageIndex,
    },
    reason: remarks || `Advanced stage from ${beforeState.currentStage} to ${nextStage}`,
  });

  return updated;
}

/**
 * Reverts/returns an application for deficiency, clarification or verification.
 */
export async function revertApplicationForDeficiency(
  applicationId: string,
  officerName: string,
  officerRole: string,
  reason: string,
  returnType: "DEFICIENCY" | "CLARIFICATION" | "VERIFICATION"
) {
  if (!reason || reason.trim().length === 0) {
    throw new Error("Mandatory reason must be recorded for returning an application.");
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!app) {
    throw new Error("Application not found");
  }

  const beforeState = {
    currentStage: app.currentStage,
    status: app.status,
  };

  const now = new Date();

  const updatedDraft = generateCommunicationDraft({
    applicationNumber: app.applicationNumber,
    institutionName: app.institutionName,
    region: app.region,
    decisionOrStage: `Returned for ${returnType}: Deficiency Rectification Required`,
    decisionRemarks: reason,
  });

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "DEFICIENCY_REVERTED",
      deficiencyReason: `[${returnType}] ${reason}`,
      lastActionDate: now,
      communicationDraft: updatedDraft,
    },
  });

  await logAuditEvent({
    performedBy: officerName,
    userRole: officerRole,
    action: "REVERTED_DEFICIENCY",
    entityType: "Application",
    entityId: applicationId,
    beforeState,
    afterState: {
      status: "DEFICIENCY_REVERTED",
      deficiencyReason: updated.deficiencyReason,
    },
    reason: `Application returned for ${returnType}. Mandatory Reason: ${reason}`,
  });

  // Also create a notification for the institution
  await prisma.notification.create({
    data: {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Deficiency Revert: App ${app.applicationNumber}`,
      message: `Your application has been returned for ${returnType}. Reason: ${reason}`,
      type: "WARNING",
      targetRole: "INSTITUTION",
      targetRegion: app.region,
      link: `/applications/${app.id}`,
    },
  });

  return updated;
}

/**
 * Records final human decision by an authorized officer.
 * System never auto-approves or auto-rejects.
 */
export async function recordFinalDecision(
  applicationId: string,
  officerName: string,
  officerRole: string,
  decision: "APPROVED" | "REJECTED" | "CONDITIONAL_APPROVAL",
  remarks: string,
  conditionalUndertakingText?: string,
  conditionDueDateDays?: number
) {
  if (!remarks || remarks.trim().length === 0) {
    throw new Error("Mandatory remarks must be provided for final decision.");
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!app) {
    throw new Error("Application not found");
  }

  const beforeState = {
    status: app.status,
    currentStage: app.currentStage,
  };

  const now = new Date();

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: decision,
      currentStage: decision === "APPROVED" ? "Approved" : decision === "REJECTED" ? "Rejected" : "Conditional Approval",
      finalDecisionRemarks: remarks,
      finalDecisionBy: `${officerName} (${officerRole})`,
      finalDecisionDate: now,
      lastActionDate: now,
      communicationDraft: generateCommunicationDraft({
        applicationNumber: app.applicationNumber,
        institutionName: app.institutionName,
        region: app.region,
        decisionOrStage: `Final Decision: ${decision}`,
        decisionRemarks: remarks,
      }),
    },
  });

  // If Conditional Approval, create a time-bound undertaking automatically!
  if (decision === "CONDITIONAL_APPROVAL" && conditionalUndertakingText) {
    const dueDays = conditionDueDateDays || 60;
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    const undertaking = await prisma.undertaking.create({
      data: {
        id: `und-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        applicationId: app.id,
        institutionId: app.institutionId,
        institutionName: app.institutionName,
        conditionText: conditionalUndertakingText,
        approvalRef: `AICTE/${app.region}/COND/${app.applicationNumber.replace(/[^0-9]/g, "")}/2026`,
        grantedDate: now,
        dueDate: dueDate,
        status: "PENDING",
        escalationLevel: "NONE",
      },
    });

    await logAuditEvent({
      performedBy: officerName,
      userRole: officerRole,
      action: "UNDERTAKING_CREATED",
      entityType: "Undertaking",
      entityId: undertaking.id,
      beforeState: null,
      afterState: { id: undertaking.id, conditionText: undertaking.conditionText, dueDate: undertaking.dueDate },
      reason: `Time-bound undertaking generated pursuant to Conditional Approval decision.`,
    });
  }

  await logAuditEvent({
    performedBy: officerName,
    userRole: officerRole,
    action: "FINAL_DECISION",
    entityType: "Application",
    entityId: applicationId,
    beforeState,
    afterState: {
      status: updated.status,
      decision,
      remarks,
    },
    reason: remarks,
  });

  // Create notifications and email log
  await prisma.notification.create({
    data: {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Final Decision Issued: ${app.applicationNumber}`,
      message: `Final decision recorded as ${decision}. Remarks: ${remarks}`,
      type: decision === "APPROVED" ? "SUCCESS" : decision === "REJECTED" ? "ESCALATION" : "WARNING",
      targetRole: "ALL",
      targetRegion: app.region,
      link: `/applications/${app.id}`,
    },
  });

  await prisma.emailLog.create({
    data: {
      id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientEmail: "registrar@" + app.institutionName.toLowerCase().replace(/[^a-z]/g, "") + ".edu.in",
      recipientRole: "INSTITUTION",
      subject: `AICTE Decision Order: ${app.applicationNumber} - ${decision}`,
      contentHtml: `<div><p>Dear Sir/Madam,</p><p>The Competent Authority has rendered a decision of <strong>${decision}</strong> for application ${app.applicationNumber}.</p><p>Remarks: ${remarks}</p></div>`,
      sentAt: now,
      status: "DISPATCHED_SIMULATED",
    },
  });

  return updated;
}
