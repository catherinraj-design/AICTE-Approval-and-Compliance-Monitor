import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { generateElectronicCaseSummary, generateCommunicationDraft } from "@/lib/workflow";
import { getSimulatedDateFromOffset } from "@/lib/demoClock";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");
    const institutionId = searchParams.get("institutionId");

    const whereClause: Record<string, unknown> = {};

    if (region && region !== "ALL") whereClause.region = region;
    if (stage && stage !== "ALL") whereClause.currentStage = stage;
    if (status && status !== "ALL") whereClause.status = status;
    if (institutionId) whereClause.institutionId = institutionId;

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, applications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      institutionId,
      institutionName,
      region,
      applicationType,
      stagePathId,
      courseLevel,
      proposedIntake,
    } = body;

    const offsetDays = parseInt(req.cookies.get("aicte_demo_offset_days")?.value || "0", 10);
    const simulatedNow = getSimulatedDateFromOffset(offsetDays);

    const count = await prisma.application.count();
    const appNumber = `AICTE/2026-27/APP-${1001 + count}`;
    const id = `app-${1001 + count}`;

    const pathId = stagePathId || "PATH_SCRUTINY_EVC";
    const initialStage = "Scrutiny"; // When submitted, advances to first stage (Scrutiny)

    const isNew = applicationType === "New Institution";

    const caseSummary = generateElectronicCaseSummary({
      applicationNumber: appNumber,
      institutionName,
      region,
      applicationType,
      academicYear: "2026-27",
      currentStage: initialStage,
      status: "IN_REVIEW",
      proposedIntake: proposedIntake ? parseInt(proposedIntake, 10) : 60,
    });

    const communicationDraft = generateCommunicationDraft({
      applicationNumber: appNumber,
      institutionName,
      region,
      decisionOrStage: `Submitted - Routed to ${initialStage} under path ${pathId}`,
      decisionRemarks: "Application received and routed automatically to Scrutiny Committee for document verification.",
    });

    const application = await prisma.application.create({
      data: {
        id,
        applicationNumber: appNumber,
        institutionId: institutionId || "inst-101",
        institutionName: institutionName || "Apex Institute of Technology, Bhopal",
        region: region || "Central",
        academicYear: "2026-27",
        applicationType: applicationType || "Extension of Approval (EoA)",
        stagePathId: pathId,
        currentStage: initialStage,
        currentStageIndex: 0,
        status: "IN_REVIEW",
        assignedOfficerId: `ro-${(region || "Central").toLowerCase()}`,
        assignedOfficerName: `Regional Officer (${region || "Central"})`,
        submittedAt: simulatedNow,
        stageStartedAt: simulatedNow,
        lastActionDate: simulatedNow,
        isNewInstitution: isNew,
        courseLevel: courseLevel || "Under Graduate (B.Tech)",
        proposedIntake: proposedIntake ? parseInt(proposedIntake, 10) : 60,
        caseSummary,
        communicationDraft,
      },
    });

    // Write append-only audit trail
    await logAuditEvent({
      performedBy: body.applicantName || "Institution Registrar",
      userRole: "INSTITUTION",
      action: "SUBMITTED",
      entityType: "Application",
      entityId: application.id,
      beforeState: null,
      afterState: {
        applicationNumber: application.applicationNumber,
        stagePathId: application.stagePathId,
        currentStage: application.currentStage,
      },
      reason: `Application submitted online. Auto-routed to stage path ${pathId}.`,
      timestamp: simulatedNow,
    });

    // Add In-app notification for Regional Officer
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `New Application Submitted: ${appNumber}`,
        message: `${institutionName} (${region} Region) submitted a proposal for ${applicationType}. Assigned to Scrutiny Desk.`,
        type: "INFO",
        targetRole: "REGIONAL_OFFICER",
        targetRegion: region,
        link: `/applications/${application.id}`,
        createdAt: simulatedNow,
      },
    });

    // Add Mock Email Log
    await prisma.emailLog.create({
      data: {
        id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        recipientEmail: `ro.${(region || "central").toLowerCase()}@aicte-india.org`,
        recipientRole: "REGIONAL_OFFICER",
        subject: `New Application Dossier Received: ${appNumber}`,
        contentHtml: `<p>New application ${appNumber} submitted by ${institutionName}. Stage path: ${pathId}.</p>`,
        sentAt: simulatedNow,
        status: "DISPATCHED_SIMULATED",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error submitting application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
