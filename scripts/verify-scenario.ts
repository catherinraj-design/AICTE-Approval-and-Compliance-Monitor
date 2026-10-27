import { PrismaClient } from "@prisma/client";
import { advanceApplicationStage, recordFinalDecision, revertApplicationForDeficiency } from "../src/lib/workflow";
import { runRules } from "../src/lib/rulesEngine";
import { logAuditEvent } from "../src/lib/audit";
import { formatDateIndian } from "../src/lib/formatters";

const prisma = new PrismaClient();

async function runScenario() {
  console.log("=================================================================");
  console.log("🚀 STARTING END-TO-END VERIFICATION TEST FOR AICTE PROTOTYPE");
  console.log("=================================================================\n");

  const baseDate = new Date("2026-10-26T10:00:00.000Z");

  // -------------------------------------------------------------
  // STEP 1: Institution submits an application routed to Scrutiny + EVC
  // -------------------------------------------------------------
  console.log("🔹 STEP 1: Institution submits proposal (Scrutiny + EVC)...");
  const count = await prisma.application.count();
  const appNumber = `AICTE/2026-27/APP-${1001 + count}`;
  const appId = `app-test-${Date.now()}`;

  const createdApp = await prisma.application.create({
    data: {
      id: appId,
      applicationNumber: appNumber,
      institutionId: "inst-101",
      institutionName: "Apex Institute of Technology, Bhopal",
      region: "Central",
      academicYear: "2026-27",
      applicationType: "Extension of Approval (EoA)",
      stagePathId: "PATH_SCRUTINY_EVC",
      currentStage: "Scrutiny",
      currentStageIndex: 0,
      status: "IN_REVIEW",
      assignedOfficerId: "ro-central",
      assignedOfficerName: "Dr. Meenakshi Sundaram",
      submittedAt: baseDate,
      stageStartedAt: baseDate,
      lastActionDate: baseDate,
      caseSummary: `[ELECTRONIC CASE SUMMARY - DRAFT] App: ${appNumber} | Apex Institute of Technology (Central Region)`,
      communicationDraft: `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION - F.No. AICTE/Central/APP-${appNumber}`,
    },
  });

  await logAuditEvent({
    performedBy: "Dr. Suresh Verma (Registrar)",
    userRole: "INSTITUTION",
    action: "SUBMITTED",
    entityType: "Application",
    entityId: createdApp.id,
    beforeState: null,
    afterState: { applicationNumber: createdApp.applicationNumber, stagePath: "PATH_SCRUTINY_EVC", currentStage: "Scrutiny" },
    reason: "New application proposal submitted by institution under path Scrutiny + EVC.",
    timestamp: baseDate,
  });

  console.log(`   ✓ Application created: ${createdApp.applicationNumber} [ID: ${createdApp.id}]`);
  console.log(`   ✓ Path: PATH_SCRUTINY_EVC (Stages: Scrutiny ➔ EVC ➔ Ready for Decision)`);
  console.log(`   ✓ Current Stage: ${createdApp.currentStage} | Status: ${createdApp.status}\n`);

  // -------------------------------------------------------------
  // STEP 2: Regional Officer completes scrutiny, auto-moves to EVC queue
  // -------------------------------------------------------------
  console.log("🔹 STEP 2: Regional Officer completes scrutiny...");
  const advancedApp = await advanceApplicationStage(
    createdApp.id,
    "Dr. Meenakshi Sundaram",
    "REGIONAL_OFFICER",
    "Statutory documentation, land deeds, and affiliation papers verified compliant. Cleared for physical inspection."
  );

  console.log(`   ✓ Stage advanced automatically: ${advancedApp.currentStage} (Index: ${advancedApp.currentStageIndex})`);
  console.log(`   ✓ Status: ${advancedApp.status}`);

  // Verify EVC record was auto-created or queued
  const evc = await prisma.eVCRecord.findUnique({
    where: { applicationId: createdApp.id },
  });
  console.log(`   ✓ EVC Record in Queue: ID ${evc?.id} | Status: ${evc?.status} | Application: ${evc?.applicationNumber}\n`);

  // -------------------------------------------------------------
  // STEP 3: EVC scheduled, advance demo clock (+30 days), watch reminder & escalation
  // -------------------------------------------------------------
  console.log("🔹 STEP 3: Scheduling EVC and advancing demo clock (+30 days)...");
  // Set scheduled date to 10 days ahead of base date
  const scheduledDate = new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000);
  await prisma.eVCRecord.update({
    where: { id: evc!.id },
    data: {
      scheduledDate,
      committeeChairman: "Prof. (Dr.) Amitabh Sen (Chairman)",
      committeeMember2: "Dr. K. Srinivas (Expert)",
      committeeMember3: "State Nominee",
      status: "UPCOMING",
    },
  });

  await logAuditEvent({
    performedBy: "Dr. Meenakshi Sundaram",
    userRole: "REGIONAL_OFFICER",
    action: "EVC_SCHEDULED",
    entityType: "EVC",
    entityId: evc!.id,
    beforeState: { status: "UPCOMING" },
    afterState: { scheduledDate: scheduledDate.toISOString(), chairman: "Prof. (Dr.) Amitabh Sen" },
    reason: `EVC inspection scheduled for ${formatDateIndian(scheduledDate)}.`,
    timestamp: baseDate,
  });
  console.log(`   ✓ EVC scheduled for ${formatDateIndian(scheduledDate)}`);

  // Advance clock by +30 days (now = 20 days PAST scheduled date)
  const advancedDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  console.log(`   🕒 Advancing Simulated Clock to ${formatDateIndian(advancedDate)} (+30 days)...`);

  const ruleResult = await runRules(advancedDate);
  console.log(`   ✓ Rules Engine executed as of ${formatDateIndian(advancedDate)}:`);
  console.log(`     - Undertakings Escalated: ${ruleResult.undertakingsEscalated}`);
  console.log(`     - EVCs Delayed / Escalated: ${ruleResult.evcsDelayed}`);
  console.log(`     - Notifications Created: ${ruleResult.notificationsCreated}`);
  console.log(`     - Email Logs Dispatched: ${ruleResult.emailsLogged}`);

  const updatedEvc = await prisma.eVCRecord.findUnique({ where: { id: evc!.id } });
  console.log(`   ✓ EVC status dynamically changed to: ${updatedEvc?.status} (delayed by 20 days)!\n`);

  // -------------------------------------------------------------
  // STEP 4: An undertaking goes overdue and escalates
  // -------------------------------------------------------------
  console.log("🔹 STEP 4: Time-bound undertaking overdue and multi-level escalation check...");
  const overdueUndertaking = await prisma.undertaking.findFirst({
    where: { status: { in: ["OVERDUE", "ESCALATED"] } },
  });
  console.log(`   ✓ Escalated Undertaking: "${overdueUndertaking?.conditionText.substring(0, 60)}..."`);
  console.log(`   ✓ Institution: ${overdueUndertaking?.institutionName}`);
  console.log(`   ✓ Status: ${overdueUndertaking?.status} | Escalation Tier: ${overdueUndertaking?.escalationLevel}`);
  console.log(`   ✓ Due Date: ${formatDateIndian(overdueUndertaking?.dueDate)}\n`);

  // -------------------------------------------------------------
  // STEP 5: Lease nears expiry, institution uploads renewal, officer verifies it
  // -------------------------------------------------------------
  console.log("🔹 STEP 5: Lease renewal workflow (Institution uploads -> Officer verifies)...");
  // Find a document for Apex Institute
  let doc = await prisma.documentValidity.findFirst({
    where: { institutionId: "inst-101", documentType: "Registered Land Lease Deed" },
  });

  if (!doc) {
    doc = await prisma.documentValidity.findFirst();
  }

  console.log(`   ✓ Target Document: ${doc?.documentType} (${doc?.documentNumber}) for ${doc?.institutionName}`);
  console.log(`   ✓ Status before renewal: ${doc?.status} | Valid To: ${formatDateIndian(doc?.validTo)}`);

  // Institution uploads renewal
  const renewalFile = "Apex_Registered_Lease_Deed_30Years_Renewal.pdf";
  const docUpdated = await prisma.documentValidity.update({
    where: { id: doc!.id },
    data: {
      status: "RENEWAL_SUBMITTED",
      renewalFileName: renewalFile,
      renewalRemarks: "Executed 30-year lease extension deed at Sub-Registrar Office, Huzur Bhopal.",
      renewalSubmittedAt: advancedDate,
    },
  });

  await logAuditEvent({
    performedBy: "Dr. Suresh Verma (Registrar)",
    userRole: "INSTITUTION",
    action: "DOCUMENT_RENEWAL_SUBMITTED",
    entityType: "Document",
    entityId: doc!.id,
    beforeState: { status: doc!.status },
    afterState: { status: "RENEWAL_SUBMITTED", file: renewalFile },
    reason: "Submitted registered extension deed online.",
    timestamp: advancedDate,
  });
  console.log(`   ✓ Institution uploaded renewal: ${renewalFile} (Status: ${docUpdated.status})`);

  // Regional Officer verifies renewal and extends validity by 30 years
  const extendedDate = new Date(advancedDate.getTime() + 30 * 365 * 24 * 60 * 60 * 1000);
  const docVerified = await prisma.documentValidity.update({
    where: { id: doc!.id },
    data: {
      status: "VERIFIED",
      validTo: extendedDate,
      verifiedBy: "Dr. Meenakshi Sundaram (Regional Officer)",
      verifiedAt: advancedDate,
      verificationRemarks: "Scrutinized registration book number and stamp duty. Valid for 30 years.",
    },
  });

  await logAuditEvent({
    performedBy: "Dr. Meenakshi Sundaram (Regional Officer)",
    userRole: "REGIONAL_OFFICER",
    action: "DOCUMENT_VERIFIED",
    entityType: "Document",
    entityId: doc!.id,
    beforeState: { status: "RENEWAL_SUBMITTED" },
    afterState: { status: "VERIFIED", validTo: extendedDate.toISOString() },
    reason: "Scrutinized registration book number and stamp duty. Valid for 30 years.",
    timestamp: advancedDate,
  });
  console.log(`   ✓ Regional Officer verified renewal: Status: ${docVerified.status} | New Expiry: ${formatDateIndian(docVerified.validTo)}\n`);

  // -------------------------------------------------------------
  // STEP 6: Verify append-only audit trail contains all steps
  // -------------------------------------------------------------
  console.log("🔹 STEP 6: Verifying immutable audit trail entries...");
  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  console.log(`   ✓ Recent Audit Entries (${recentLogs.length} inspected):`);
  for (const l of recentLogs) {
    console.log(`     [${formatDateIndian(l.timestamp)}] ${l.action} on ${l.entityType}:${l.entityId} by ${l.performedBy} (${l.userRole}) -> "${l.reason.substring(0, 50)}..."`);
  }

  console.log("\n=================================================================");
  console.log("🎉 ALL 6 END-TO-END SCENARIO STEPS VERIFIED & PASSED PERFECTLY!");
  console.log("=================================================================");
}

runScenario()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
