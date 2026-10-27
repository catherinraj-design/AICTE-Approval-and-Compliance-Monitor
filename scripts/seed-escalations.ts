import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDummyEscalations() {
  console.log("🔔 Seeding rich dummy escalation notifications, email logs, and audit records...");

  const now = new Date();

  const dummyNotifications = [
    {
      id: `notif-esc-101`,
      title: "CRITICAL L3 ESCALATION: 35 Days Overdue Undertaking - Kalinga Advanced Poly",
      message: "Mandatory recruitment of qualified Workshop Superintendent for Kalinga Advanced Polytechnic is overdue by 35 days past statutory AICTE deadline. Senior Authority show-cause proceedings initiated.",
      type: "ESCALATION",
      targetRole: "ADMIN",
      targetRegion: "East",
      link: "/undertakings",
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: `notif-esc-102`,
      title: "L3 ESCALATION: Severe Stage Inactivity (68 days) - Doon Global Poly",
      message: "Application AICTE/2026-27/APP-1007 has remained dormant in Scrutiny stage for 68 days without regional movement. Automated high-level escalation to Member Secretary.",
      type: "ESCALATION",
      targetRole: "ADMIN",
      targetRegion: "North",
      link: "/applications",
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-103`,
      title: "L2 ESCALATION: Delayed EVC Inspection (18 days) - Vidya Jyoti College",
      message: "Expert Visiting Committee inspection report for Vidya Jyoti College of Engineering (Central Region) is delayed by 18 days beyond scheduled date. Bureau Advisor intervention requested.",
      type: "ESCALATION",
      targetRole: "BUREAU_OFFICER",
      targetRegion: "Central",
      link: "/evc",
      isRead: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-104`,
      title: "L2 ESCALATION: Undertaking Overdue (20 days) - Girnar Engineering Academy",
      message: "Submission of GTU Affiliation letter for Girnar Engineering Academy (West Region) is overdue by 20 days. Bureau escalation notice dispatched.",
      type: "ESCALATION",
      targetRole: "BUREAU_OFFICER",
      targetRegion: "West",
      link: "/undertakings",
      isRead: false,
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-105`,
      title: "L1 ESCALATION: Undertaking Overdue (5 days) - Apex Institute of Technology",
      message: "Conditional EoA requirement 'Submission of Building Completion Certificate (BCC)' is overdue by 5 days. Regional Officer compliance inquiry mandated.",
      type: "ESCALATION",
      targetRole: "REGIONAL_OFFICER",
      targetRegion: "Central",
      link: "/undertakings",
      isRead: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
    },
    {
      id: `notif-esc-106`,
      title: "L1 ESCALATION: Statutory Fire Safety NOC EXPIRED - Shivalik College",
      message: "Fire Safety Clearance for Shivalik College of Engineering expired on 20-10-2026 without renewal submission. Immediate regional notice required.",
      type: "ESCALATION",
      targetRole: "REGIONAL_OFFICER",
      targetRegion: "North",
      link: "/documents",
      isRead: false,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-107`,
      title: "EVC Visit Imminent: Scheduled Inspection in 2 Days - Apex Institute",
      message: "Physical EVC visit by Prof. Amitabh Sen committee scheduled for 29-10-2026 at Apex Institute of Technology, Bhopal.",
      type: "WARNING",
      targetRole: "REGIONAL_OFFICER",
      targetRegion: "Central",
      link: "/evc",
      isRead: false,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-108`,
      title: "URGENT COMPLIANCE NOTICE: Registered Land Lease Deed Expiry in 14 Days",
      message: "30-Year Registered Land Lease Deed (REG-DOC-CE-9820) expires on 10-11-2026. Please upload registered renewal deed to avoid EoA withholding.",
      type: "WARNING",
      targetRole: "INSTITUTION",
      targetRegion: "Central",
      link: "/documents",
      isRead: false,
      createdAt: new Date(now.getTime() - 20 * 60 * 1000), // 20 mins ago
    },
    {
      id: `notif-esc-109`,
      title: "DEFICIENCY REVERT: Application Returned for Rectification",
      message: "Application AICTE/2026-27/APP-1002 has been returned by Scrutiny Committee. Reason: [DEFICIENCY] Missing certified structural stability report from NIT/IIT.",
      type: "WARNING",
      targetRole: "INSTITUTION",
      targetRegion: "Central",
      link: "/applications",
      isRead: false,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      id: `notif-esc-110`,
      title: "EVC Inspection Docket Assigned: Apex Institute of Technology",
      message: "You have been appointed Chairman for the physical inspection of Apex Institute of Technology, Bhopal on 29-10-2026. Inspection dossier is ready for review.",
      type: "INFO",
      targetRole: "COMMITTEE_MEMBER",
      targetRegion: "Central",
      link: "/evc",
      isRead: false,
      createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    },
  ];

  // Insert or update notifications
  for (const notif of dummyNotifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: {
        title: notif.title,
        message: notif.message,
        type: notif.type,
        targetRole: notif.targetRole,
        targetRegion: notif.targetRegion,
        link: notif.link,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
      },
      create: notif,
    });
  }

  // Insert matching Mock Email Logs
  const mockEmails = [
    {
      id: `eml-esc-201`,
      recipientEmail: "ms@aicte-india.org",
      recipientRole: "ADMIN",
      subject: "AICTE CRITICAL L3 ESCALATION: 35 Days Overdue Undertaking [Kalinga Advanced Poly]",
      contentHtml: "<p>Dear Member Secretary,</p><p>Please note that Kalinga Advanced Polytechnic has not submitted compliance evidence for Workshop Superintendent recruitment within 35 days past statutory cutoff.</p>",
      sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      status: "DISPATCHED_SIMULATED",
    },
    {
      id: `eml-esc-202`,
      recipientEmail: "ad.approval@aicte-india.org",
      recipientRole: "BUREAU_OFFICER",
      subject: "AICTE L2 Escalation Notice: Delayed EVC Committee Report [Vidya Jyoti College]",
      contentHtml: "<p>Dear Advisor (Approval Bureau),</p><p>EVC physical inspection report is delayed by 18 days past scheduled date. Automatic bureau notice generated.</p>",
      sentAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: "DISPATCHED_SIMULATED",
    },
    {
      id: `eml-esc-203`,
      recipientEmail: "ro.central@aicte-india.org",
      recipientRole: "REGIONAL_OFFICER",
      subject: "AICTE L1 Escalation: Conditional Undertaking Overdue [Apex Institute of Technology]",
      contentHtml: "<p>Dear Regional Officer,</p><p>Apex Institute of Technology is overdue by 5 days for Building Completion Certificate submission.</p>",
      sentAt: new Date(now.getTime() - 30 * 60 * 1000),
      status: "DISPATCHED_SIMULATED",
    },
    {
      id: `eml-esc-204`,
      recipientEmail: "registrar@apextech.edu.in",
      recipientRole: "INSTITUTION",
      subject: "URGENT COMPLIANCE DIRECTIVE: 14 Days Remaining for Lease Deed Renewal",
      contentHtml: "<p>To the Authorized Signatory, Apex Institute of Technology,</p><p>Your 30-year registered land lease deed is expiring in 14 days. Failure to upload registered renewal may lead to EoA suspension.</p>",
      sentAt: new Date(now.getTime() - 20 * 60 * 1000),
      status: "DISPATCHED_SIMULATED",
    },
  ];

  for (const eml of mockEmails) {
    await prisma.emailLog.upsert({
      where: { id: eml.id },
      update: {
        recipientEmail: eml.recipientEmail,
        recipientRole: eml.recipientRole,
        subject: eml.subject,
        contentHtml: eml.contentHtml,
        sentAt: eml.sentAt,
        status: eml.status,
      },
      create: eml,
    });
  }

  // Insert matching Audit Log entries
  const auditEntries = [
    {
      id: `aud-esc-301`,
      performedBy: "Rule Engine (Automated)",
      userRole: "SYSTEM",
      action: "RULE_ESCALATION",
      entityType: "Undertaking",
      entityId: "und-115",
      beforeState: JSON.stringify({ status: "OVERDUE", escalationLevel: "BO_ALERT" }),
      afterState: JSON.stringify({ status: "ESCALATED", escalationLevel: "SENIOR_ALERT", diffDays: 35 }),
      reason: "Undertaking overdue by 35 days. Triggered L3 Escalation to Member Secretary / Senior Authority.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: `aud-esc-302`,
      performedBy: "Rule Engine (Automated)",
      userRole: "SYSTEM",
      action: "EVC_DELAYED",
      entityType: "EVC",
      entityId: "evc-1002",
      beforeState: JSON.stringify({ status: "UPCOMING" }),
      afterState: JSON.stringify({ status: "DELAYED", diffDays: 18 }),
      reason: "EVC visit overdue by 18 days past scheduled date. L2 Escalation issued to Bureau Officer.",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      id: `aud-esc-303`,
      performedBy: "Rule Engine (Automated)",
      userRole: "SYSTEM",
      action: "RULE_ESCALATION",
      entityType: "Undertaking",
      entityId: "und-101",
      beforeState: JSON.stringify({ status: "PENDING", escalationLevel: "NONE" }),
      afterState: JSON.stringify({ status: "OVERDUE", escalationLevel: "RO_ALERT", diffDays: 5 }),
      reason: "Building Completion Certificate condition overdue by 5 days. L1 Escalation issued to Regional Officer (Central).",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ];

  for (const aud of auditEntries) {
    await prisma.auditLog.upsert({
      where: { id: aud.id },
      update: {
        performedBy: aud.performedBy,
        userRole: aud.userRole,
        action: aud.action,
        entityType: aud.entityType,
        entityId: aud.entityId,
        beforeState: aud.beforeState,
        afterState: aud.afterState,
        reason: aud.reason,
        timestamp: aud.timestamp,
      },
      create: aud,
    });
  }

  console.log("✅ Successfully seeded 10 dummy escalation notifications, 4 email dispatches, and 3 audit logs!");
}

seedDummyEscalations()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
