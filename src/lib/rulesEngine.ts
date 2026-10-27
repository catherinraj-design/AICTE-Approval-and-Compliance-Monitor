import prisma from "./prisma";
import { logAuditEvent } from "./audit";
import { formatDateIndian } from "./formatters";

export interface RuleExecutionResult {
  asOfDate: Date;
  undertakingsChecked: number;
  undertakingsEscalated: number;
  evcsChecked: number;
  evcsDelayed: number;
  documentsChecked: number;
  documentsExpired: number;
  applicationsFlagged: number;
  notificationsCreated: number;
  emailsLogged: number;
}

export async function runRules(asOfDate: Date): Promise<RuleExecutionResult> {
  const result: RuleExecutionResult = {
    asOfDate,
    undertakingsChecked: 0,
    undertakingsEscalated: 0,
    evcsChecked: 0,
    evcsDelayed: 0,
    documentsChecked: 0,
    documentsExpired: 0,
    applicationsFlagged: 0,
    notificationsCreated: 0,
    emailsLogged: 0,
  };

  const asOfTime = asOfDate.getTime();

  // Helper to send in-app notification & mock email
  async function notify(params: {
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "ESCALATION" | "SUCCESS";
    targetRole: string;
    targetRegion?: string;
    link?: string;
    recipientEmail?: string;
    subject?: string;
  }) {
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: params.title,
        message: params.message,
        type: params.type,
        targetRole: params.targetRole,
        targetRegion: params.targetRegion,
        link: params.link,
        createdAt: asOfDate,
      },
    });
    result.notificationsCreated++;

    if (params.recipientEmail && params.subject) {
      await prisma.emailLog.create({
        data: {
          id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          recipientEmail: params.recipientEmail,
          recipientRole: params.targetRole,
          subject: params.subject,
          contentHtml: `<div><h3>${params.title}</h3><p>${params.message}</p><p>As of Simulated Date: ${formatDateIndian(asOfDate)}</p></div>`,
          sentAt: asOfDate,
          status: "DISPATCHED_SIMULATED",
        },
      });
      result.emailsLogged++;
    }
  }

  // ----------------------------------------------------
  // 1. EVALUATE TIME-BOUND UNDERTAKINGS
  // ----------------------------------------------------
  const undertakings = await prisma.undertaking.findMany({
    where: {
      status: { in: ["PENDING", "SUBMITTED", "OVERDUE", "ESCALATED"] },
    },
  });

  result.undertakingsChecked = undertakings.length;

  for (const und of undertakings) {
    if (und.status === "VERIFIED") continue;

    const dueTime = new Date(und.dueDate).getTime();
    const diffDays = Math.floor((asOfTime - dueTime) / (1000 * 60 * 60 * 24)); // >0 if overdue, <0 if upcoming

    // Case A: Pre-deadline reminders (e.g. 30, 15, 7 days before)
    if (diffDays < 0 && und.status === "PENDING") {
      const daysLeft = Math.abs(diffDays);
      if (daysLeft === 30 || daysLeft === 15 || daysLeft === 7 || (daysLeft <= 7 && daysLeft > 0)) {
        await notify({
          title: `Compliance Reminder: Undertaking Due in ${daysLeft} days`,
          message: `Undertaking "${und.conditionText.substring(0, 50)}..." for ${und.institutionName} is due on ${formatDateIndian(und.dueDate)}. Please upload proof of compliance.`,
          type: daysLeft <= 7 ? "WARNING" : "INFO",
          targetRole: "INSTITUTION",
          link: `/undertakings`,
          recipientEmail: `registrar@${und.institutionId}.edu.in`,
          subject: `AICTE Alert: ${daysLeft} Days Remaining for Compliance Undertaking`,
        });
      }
    }

    // Case B: Overdue and Multi-level Escalation
    if (diffDays >= 1 && und.status !== "VERIFIED") {
      let targetEscalation = "RO_ALERT";
      let targetRole = "REGIONAL_OFFICER";
      let levelTitle = "L1 Escalation: Regional Officer Alert";

      if (diffDays >= 30) {
        targetEscalation = "SENIOR_ALERT";
        targetRole = "ADMIN";
        levelTitle = "L3 Escalation: Senior Authority / Member Secretary";
      } else if (diffDays >= 15) {
        targetEscalation = "BO_ALERT";
        targetRole = "BUREAU_OFFICER";
        levelTitle = "L2 Escalation: Bureau Officer Alert";
      }

      // Check if escalation state needs update
      if (und.escalationLevel !== targetEscalation || und.status !== "OVERDUE" && und.status !== "ESCALATED") {
        const nextStatus = diffDays >= 15 ? "ESCALATED" : "OVERDUE";
        const beforeState = { status: und.status, escalationLevel: und.escalationLevel };

        await prisma.undertaking.update({
          where: { id: und.id },
          data: {
            status: nextStatus,
            escalationLevel: targetEscalation,
          },
        });

        result.undertakingsEscalated++;

        await logAuditEvent({
          performedBy: "Rule Engine (Automated)",
          userRole: "SYSTEM",
          action: "RULE_ESCALATION",
          entityType: "Undertaking",
          entityId: und.id,
          beforeState,
          afterState: { status: nextStatus, escalationLevel: targetEscalation, diffDays },
          reason: `Undertaking overdue by ${diffDays} day(s). Rule triggered ${levelTitle}.`,
          timestamp: asOfDate,
        });

        await notify({
          title: `Overdue Undertaking (${diffDays} days) - ${levelTitle}`,
          message: `Undertaking "${und.conditionText}" by ${und.institutionName} is overdue by ${diffDays} days. Escalated to ${targetRole}.`,
          type: "ESCALATION",
          targetRole,
          link: `/undertakings`,
          recipientEmail: `${targetRole.toLowerCase()}@aicte-india.org`,
          subject: `AICTE ESCALATION: Unfulfilled Undertaking overdue by ${diffDays} days [${und.approvalRef}]`,
        });
      }
    }
  }

  // ----------------------------------------------------
  // 2. EVALUATE EVC SCHEDULING & DELAYS
  // ----------------------------------------------------
  const evcRecords = await prisma.eVCRecord.findMany({
    where: { status: { in: ["UPCOMING", "DUE", "DELAYED"] } },
  });

  result.evcsChecked = evcRecords.length;

  for (const evc of evcRecords) {
    const schedTime = new Date(evc.scheduledDate).getTime();
    const diffDays = Math.floor((asOfTime - schedTime) / (1000 * 60 * 60 * 24)); // >0 = overdue/delayed

    // Upcoming check: within 7 days
    if (diffDays >= -7 && diffDays <= 0 && evc.status === "UPCOMING") {
      await prisma.eVCRecord.update({
        where: { id: evc.id },
        data: { status: "DUE" },
      });
      await notify({
        title: `EVC Inspection Imminent: ${evc.institutionName}`,
        message: `Expert Visiting Committee visit is due on ${formatDateIndian(evc.scheduledDate)} for ${evc.institutionName}.`,
        type: "INFO",
        targetRole: "COMMITTEE_MEMBER",
        targetRegion: evc.region,
        link: `/evc`,
      });
    }

    // Delayed check: if scheduled date has elapsed without completion
    if (diffDays >= 1) {
      if (evc.status !== "DELAYED") {
        await prisma.eVCRecord.update({
          where: { id: evc.id },
          data: { status: "DELAYED" },
        });
        result.evcsDelayed++;

        await logAuditEvent({
          performedBy: "Rule Engine (Automated)",
          userRole: "SYSTEM",
          action: "EVC_DELAYED",
          entityType: "EVC",
          entityId: evc.id,
          beforeState: { status: evc.status },
          afterState: { status: "DELAYED", diffDays },
          reason: `EVC visit overdue by ${diffDays} day(s) against scheduled date ${formatDateIndian(evc.scheduledDate)}.`,
          timestamp: asOfDate,
        });
      }

      // Escalation for delayed EVC
      const targetRole = diffDays >= 30 ? "ADMIN" : diffDays >= 15 ? "BUREAU_OFFICER" : "REGIONAL_OFFICER";
      if (diffDays === 1 || diffDays === 15 || diffDays === 30) {
        await notify({
          title: `EVC Delayed by ${diffDays} days: ${evc.institutionName}`,
          message: `EVC Inspection for App ${evc.applicationNumber} is delayed by ${diffDays} days past schedule. Escalated to ${targetRole}.`,
          type: "ESCALATION",
          targetRole,
          targetRegion: evc.region,
          link: `/evc`,
          recipientEmail: `${targetRole.toLowerCase()}@aicte-india.org`,
          subject: `AICTE Escalation: Delayed EVC Inspection (${diffDays} days) for ${evc.institutionName}`,
        });
      }
    }
  }

  // ----------------------------------------------------
  // 3. EVALUATE LEASE AND DOCUMENT VALIDITY
  // ----------------------------------------------------
  const documents = await prisma.documentValidity.findMany();
  result.documentsChecked = documents.length;

  for (const doc of documents) {
    if (doc.status === "VERIFIED") continue;

    const validToTime = new Date(doc.validTo).getTime();
    const daysUntilExpiry = Math.floor((validToTime - asOfTime) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0 && doc.status !== "EXPIRED" && doc.status !== "RENEWAL_SUBMITTED") {
      await prisma.documentValidity.update({
        where: { id: doc.id },
        data: { status: "EXPIRED" },
      });
      result.documentsExpired++;

      await logAuditEvent({
        performedBy: "Rule Engine (Automated)",
        userRole: "SYSTEM",
        action: "DOCUMENT_EXPIRED",
        entityType: "Document",
        entityId: doc.id,
        beforeState: { status: doc.status },
        afterState: { status: "EXPIRED", daysUntilExpiry },
        reason: `${doc.documentType} expired on ${formatDateIndian(doc.validTo)}.`,
        timestamp: asOfDate,
      });

      await notify({
        title: `CRITICAL: ${doc.documentType} EXPIRED`,
        message: `${doc.documentType} for ${doc.institutionName} expired on ${formatDateIndian(doc.validTo)}. Immediate renewal mandatory.`,
        type: "ESCALATION",
        targetRole: "REGIONAL_OFFICER",
        targetRegion: doc.region,
        link: `/documents`,
        recipientEmail: `ro.${doc.region.toLowerCase()}@aicte-india.org`,
        subject: `AICTE Critical Alert: Statutory Document Expired for ${doc.institutionName}`,
      });
    } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 60 && doc.status === "VALID") {
      await prisma.documentValidity.update({
        where: { id: doc.id },
        data: { status: "EXPIRING_SOON" },
      });

      await notify({
        title: `Document Expiring Soon (${daysUntilExpiry} days)`,
        message: `${doc.documentType} for ${doc.institutionName} expires on ${formatDateIndian(doc.validTo)}. Renewal must be submitted.`,
        type: "WARNING",
        targetRole: "INSTITUTION",
        link: `/documents`,
        recipientEmail: `registrar@${doc.institutionId}.edu.in`,
        subject: `AICTE Expiry Notice: ${doc.documentType} expiring in ${daysUntilExpiry} days`,
      });
    }
  }

  // ----------------------------------------------------
  // 4. EVALUATE APPLICATION STAGE PENDENCY & AGEING
  // ----------------------------------------------------
  const activeApplications = await prisma.application.findMany({
    where: {
      status: { in: ["PENDING", "IN_REVIEW", "READY_FOR_DECISION"] },
    },
  });

  for (const app of activeApplications) {
    const stageStartTime = new Date(app.stageStartedAt).getTime();
    const daysInStage = Math.floor((asOfTime - stageStartTime) / (1000 * 60 * 60 * 24));

    if (daysInStage >= 30) {
      result.applicationsFlagged++;
      // Notify Bureau or RO on key milestones
      if (daysInStage === 30 || daysInStage === 60) {
        await notify({
          title: `Prolonged Application Pendency (${daysInStage} days)`,
          message: `Application ${app.applicationNumber} (${app.institutionName}) has been stagnant in stage "${app.currentStage}" for ${daysInStage} days.`,
          type: daysInStage >= 60 ? "ESCALATION" : "WARNING",
          targetRole: daysInStage >= 60 ? "ADMIN" : "BUREAU_OFFICER",
          targetRegion: app.region,
          link: `/applications/${app.id}`,
        });
      }
    }
  }

  return result;
}
