import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_DATE = new Date("2026-10-26T10:00:00.000Z");

function daysAgo(days: number): Date {
  return new Date(BASE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
}

function daysAhead(days: number): Date {
  return new Date(BASE_DATE.getTime() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("🌱 Resetting and seeding AICTE Approval & Compliance Monitor database...");

  // Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.undertaking.deleteMany();
  await prisma.eVCRecord.deleteMany();
  await prisma.documentValidity.deleteMany();
  await prisma.application.deleteMany();
  await prisma.stagePathConfig.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ruleConfig.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 1. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "academic_year", value: "2026-27" },
      { key: "demo_clock_offset_days", value: "0" },
      { key: "base_date", value: BASE_DATE.toISOString() },
    ],
  });

  // 2. Users (Mock Authorities)
  await prisma.user.createMany({
    data: [
      {
        id: "inst-apex",
        name: "Dr. Suresh Verma",
        email: "registrar@apextech.edu.in",
        role: "INSTITUTION",
        region: "Central",
        institutionId: "inst-101",
        designation: "Registrar / Authorized Signatory",
      },
      {
        id: "ro-north",
        name: "Shri Rajeshwar Rao",
        email: "ro.north@aicte-india.org",
        role: "REGIONAL_OFFICER",
        region: "North",
        designation: "Regional Officer - Northern Regional Office",
      },
      {
        id: "ro-central",
        name: "Dr. Meenakshi Sundaram",
        email: "ro.central@aicte-india.org",
        role: "REGIONAL_OFFICER",
        region: "Central",
        designation: "Regional Officer - Central Regional Office",
      },
      {
        id: "ro-south",
        name: "Dr. K. Venkatraman",
        email: "ro.south@aicte-india.org",
        role: "REGIONAL_OFFICER",
        region: "South",
        designation: "Regional Officer - Southern Regional Office",
      },
      {
        id: "ro-west",
        name: "Dr. Pradeep Patil",
        email: "ro.west@aicte-india.org",
        role: "REGIONAL_OFFICER",
        region: "West",
        designation: "Regional Officer - Western Regional Office",
      },
      {
        id: "ro-east",
        name: "Dr. Debabrata Banerjee",
        email: "ro.east@aicte-india.org",
        role: "REGIONAL_OFFICER",
        region: "East",
        designation: "Regional Officer - Eastern Regional Office",
      },
      {
        id: "bureau-officer",
        name: "Dr. Sunita Deshmukh",
        email: "ad.approval@aicte-india.org",
        role: "BUREAU_OFFICER",
        region: "ALL",
        designation: "Advisor / Director - Approval Bureau, AICTE HQ",
      },
      {
        id: "comm-member-1",
        name: "Prof. (Dr.) Amitabh Sen",
        email: "prof.sen@evc-expert.ac.in",
        role: "COMMITTEE_MEMBER",
        region: "Central",
        designation: "Chairman - Expert Visiting Committee (EVC / SAC Panel)",
      },
      {
        id: "admin-1",
        name: "Member Secretary / System Admin",
        email: "ms@aicte-india.org",
        role: "ADMIN",
        region: "ALL",
        designation: "Senior Authority & System Administrator",
      },
    ],
  });

  // 3. Fictional Institutions (5 Regions)
  const institutions = [
    {
      id: "inst-101",
      pid: "1-4920191",
      name: "Apex Institute of Technology, Bhopal",
      region: "Central",
      state: "Madhya Pradesh",
      district: "Bhopal",
      address: "Sector 4, Kolar Road, Bhopal",
      type: "Private-Self Financing",
      contactEmail: "registrar@apextech.edu.in",
      contactPhone: "+91 755 2490191",
      isNewInstitution: false,
    },
    {
      id: "inst-102",
      pid: "1-4920192",
      name: "Vidya Jyoti College of Engineering, Raipur",
      region: "Central",
      state: "Chhattisgarh",
      district: "Raipur",
      address: "Naya Raipur Industrial Corridor",
      type: "Private-Self Financing",
      contactEmail: "info@vidyajyoti.ac.in",
      contactPhone: "+91 771 2894100",
      isNewInstitution: true,
    },
    {
      id: "inst-103",
      pid: "1-4920193",
      name: "Saraswati Institute of Management Studies, Jabalpur",
      region: "Central",
      state: "Madhya Pradesh",
      district: "Jabalpur",
      address: "Civil Lines, Jabalpur",
      type: "Govt Aided",
      contactEmail: "director@saraswatimba.ac.in",
      contactPhone: "+91 761 2400321",
      isNewInstitution: false,
    },
    {
      id: "inst-104",
      pid: "1-3829101",
      name: "Shivalik College of Engineering, Dehradun",
      region: "North",
      state: "Uttarakhand",
      district: "Dehradun",
      address: "Chakrata Road, Dehradun",
      type: "Private-Self Financing",
      contactEmail: "admin@shivalikengg.edu.in",
      contactPhone: "+91 135 2772001",
      isNewInstitution: false,
    },
    {
      id: "inst-105",
      pid: "1-3829102",
      name: "Haryana Institute of Technology & Research, Karnal",
      region: "North",
      state: "Haryana",
      district: "Karnal",
      address: "GT Road, Karnal Bypass",
      type: "Government",
      contactEmail: "principal@hitrkarnal.ac.in",
      contactPhone: "+91 184 2200192",
      isNewInstitution: false,
    },
    {
      id: "inst-106",
      pid: "1-3829103",
      name: "Himalaya Institute of Pharmacy, Solan",
      region: "North",
      state: "Himachal Pradesh",
      district: "Solan",
      address: "Kumarhatti, Solan",
      type: "Private-Self Financing",
      contactEmail: "office@himalayapharm.edu.in",
      contactPhone: "+91 1792 231400",
      isNewInstitution: true,
    },
    {
      id: "inst-107",
      pid: "1-3829104",
      name: "Doon Global Polytechnic Institute, Roorkee",
      region: "North",
      state: "Uttarakhand",
      district: "Haridwar",
      address: "NH-58, Roorkee",
      type: "Private-Self Financing",
      contactEmail: "principal@doonglobalpoly.in",
      contactPhone: "+91 1332 291044",
      isNewInstitution: false,
    },
    {
      id: "inst-108",
      pid: "1-5102941",
      name: "Deccan Institute of Advanced Engineering, Hyderabad",
      region: "South",
      state: "Telangana",
      district: "Hyderabad",
      address: "Gachibowli High-Tech City",
      type: "Private-Self Financing",
      contactEmail: "dean@deccanengg.ac.in",
      contactPhone: "+91 40 23119041",
      isNewInstitution: false,
    },
    {
      id: "inst-109",
      pid: "1-5102942",
      name: "Cauvery Institute of Technology, Mandya",
      region: "South",
      state: "Karnataka",
      district: "Mandya",
      address: "Bangalore-Mysore Expressway, Mandya",
      type: "Govt Aided",
      contactEmail: "contact@cauverytech.ac.in",
      contactPhone: "+91 8232 245011",
      isNewInstitution: false,
    },
    {
      id: "inst-110",
      pid: "1-5102943",
      name: "Malabar College of Engineering & Research, Thrissur",
      region: "South",
      state: "Kerala",
      district: "Thrissur",
      address: "Pallur Hills, Desamangalam, Thrissur",
      type: "Private-Self Financing",
      contactEmail: "principal@malabarcoe.ac.in",
      contactPhone: "+91 4884 282200",
      isNewInstitution: false,
    },
    {
      id: "inst-111",
      pid: "1-6284910",
      name: "Sahyadri Institute of Technology, Pune",
      region: "West",
      state: "Maharashtra",
      district: "Pune",
      address: "Hinjawadi Phase 3, Pune",
      type: "Deemed University",
      contactEmail: "registrar@sahyadripune.edu.in",
      contactPhone: "+91 20 27194000",
      isNewInstitution: false,
    },
    {
      id: "inst-112",
      pid: "1-6284911",
      name: "Girnar Engineering Academy, Rajkot",
      region: "West",
      state: "Gujarat",
      district: "Rajkot",
      address: "Kalawad Road, Rajkot",
      type: "Private-Self Financing",
      contactEmail: "director@girnarengg.org",
      contactPhone: "+91 281 2589001",
      isNewInstitution: true,
    },
    {
      id: "inst-113",
      pid: "1-6284912",
      name: "Konkan Technical University Campus, Ratnagiri",
      region: "West",
      state: "Maharashtra",
      district: "Ratnagiri",
      address: "Mirjole MIDC Area, Ratnagiri",
      type: "Government",
      contactEmail: "office@konkantech.ac.in",
      contactPhone: "+91 2352 229100",
      isNewInstitution: false,
    },
    {
      id: "inst-114",
      pid: "1-7392011",
      name: "Brahmaputra Institute of Technology, Guwahati",
      region: "East",
      state: "Assam",
      district: "Kamrup Metropolitan",
      address: "Jalukbari, Guwahati",
      type: "Government",
      contactEmail: "principal@brahmaputratech.ac.in",
      contactPhone: "+91 361 2570199",
      isNewInstitution: false,
    },
    {
      id: "inst-115",
      pid: "1-7392012",
      name: "Kalinga Advanced Polytechnic, Bhubaneswar",
      region: "East",
      state: "Odisha",
      district: "Khordha",
      address: "Chandaka Industrial Estate, Bhubaneswar",
      type: "Govt Aided",
      contactEmail: "info@kalingapoly.edu.in",
      contactPhone: "+91 674 2740991",
      isNewInstitution: false,
    },
    {
      id: "inst-116",
      pid: "1-7392013",
      name: "Nalanda Engineering & Research Foundation, Patna",
      region: "East",
      state: "Bihar",
      district: "Patna",
      address: "Bihta Knowledge City, Patna",
      type: "Private-Self Financing",
      contactEmail: "admin@nalandapnf.edu.in",
      contactPhone: "+91 612 2840112",
      isNewInstitution: true,
    },
  ];

  await prisma.institution.createMany({ data: institutions });

  // 4. Configurable Stage Paths
  await prisma.stagePathConfig.createMany({
    data: [
      {
        id: "PATH_ONLY_SCRUTINY",
        name: "Only Scrutiny",
        description: "Expedited single-stage verification for routine Extension of Approval (EoA) without changes.",
        stages: JSON.stringify(["Scrutiny"]),
        isActive: true,
      },
      {
        id: "PATH_SCRUTINY_EVC",
        name: "Scrutiny + EVC",
        description: "Standard dual-stage verification: Scrutiny followed by physical Expert Visiting Committee inspection.",
        stages: JSON.stringify(["Scrutiny", "EVC"]),
        isActive: true,
      },
      {
        id: "PATH_EVC_SAC_SHC",
        name: "EVC + SAC/SHC",
        description: "Direct inspection followed by Standing Appellate / Hearing Committee evaluation for appeals.",
        stages: JSON.stringify(["EVC", "SAC_SHC"]),
        isActive: true,
      },
      {
        id: "PATH_ONLY_EVC",
        name: "Only EVC",
        description: "Direct inspection track for re-inspections or surprise infrastructural audits.",
        stages: JSON.stringify(["EVC"]),
        isActive: true,
      },
      {
        id: "PATH_SCRUTINY_EVC_SAC_SHC",
        name: "Scrutiny + EVC + SAC/SHC",
        description: "Full three-stage pipeline required for New Institutions, Change of Site, and major disputes.",
        stages: JSON.stringify(["Scrutiny", "EVC", "SAC_SHC"]),
        isActive: true,
      },
    ],
  });

  // 5. Configurable Rule Engine Rules (Labelled as prototype rules)
  await prisma.ruleConfig.createMany({
    data: [
      {
        id: "RULE-UND-REM-30",
        name: "Undertaking Pre-Expiry 30-Day Reminder",
        module: "UNDERTAKING",
        triggerCondition: "BEFORE_DEADLINE",
        thresholdDays: 30,
        recipientRole: "INSTITUTION",
        escalationLevel: "INFO",
        actionMessage: "Send electronic reminder notice 30 days prior to compliance undertaking deadline.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-UND-REM-15",
        name: "Undertaking Pre-Expiry 15-Day Reminder",
        module: "UNDERTAKING",
        triggerCondition: "BEFORE_DEADLINE",
        thresholdDays: 15,
        recipientRole: "INSTITUTION",
        escalationLevel: "INFO",
        actionMessage: "Send second reminder notice 15 days before undertaking expiry.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-UND-REM-7",
        name: "Undertaking Pre-Expiry 7-Day Urgent Warning",
        module: "UNDERTAKING",
        triggerCondition: "BEFORE_DEADLINE",
        thresholdDays: 7,
        recipientRole: "INSTITUTION",
        escalationLevel: "WARNING",
        actionMessage: "Send critical 7-day countdown alert to Institution Registrar.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-UND-ESC-1",
        name: "Undertaking Overdue L1: Regional Officer Escalation",
        module: "UNDERTAKING",
        triggerCondition: "AFTER_DEADLINE_OVERDUE",
        thresholdDays: 1,
        recipientRole: "REGIONAL_OFFICER",
        escalationLevel: "WARNING",
        actionMessage: "Flag undertaking overdue by 1 day and alert Regional Officer for inquiry.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-UND-ESC-15",
        name: "Undertaking Overdue L2: Bureau Officer Escalation",
        module: "UNDERTAKING",
        triggerCondition: "AFTER_DEADLINE_OVERDUE",
        thresholdDays: 15,
        recipientRole: "BUREAU_OFFICER",
        escalationLevel: "ESCALATION_L1",
        actionMessage: "Escalate unfulfilled undertaking overdue by 15 days to Bureau Officer HQ.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-UND-ESC-30",
        name: "Undertaking Overdue L3: Senior Authority / Admin Escalation",
        module: "UNDERTAKING",
        triggerCondition: "AFTER_DEADLINE_OVERDUE",
        thresholdDays: 30,
        recipientRole: "ADMIN",
        escalationLevel: "ESCALATION_L2",
        actionMessage: "High-level escalation to Senior Authority / Member Secretary for show-cause notice.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-EVC-DUE-7",
        name: "EVC Visit Imminent Reminder",
        module: "EVC_SCHEDULE",
        triggerCondition: "BEFORE_DEADLINE",
        thresholdDays: 7,
        recipientRole: "COMMITTEE_MEMBER",
        escalationLevel: "INFO",
        actionMessage: "Notify committee members and institution 7 days before scheduled visit.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-EVC-DELAY-1",
        name: "EVC Delayed L1 Alert",
        module: "EVC_SCHEDULE",
        triggerCondition: "AFTER_DEADLINE_OVERDUE",
        thresholdDays: 1,
        recipientRole: "REGIONAL_OFFICER",
        escalationLevel: "WARNING",
        actionMessage: "Flag EVC inspection delayed past scheduled date to Regional Officer.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-EVC-DELAY-15",
        name: "EVC Delayed L2 Bureau Escalation",
        module: "EVC_SCHEDULE",
        triggerCondition: "AFTER_DEADLINE_OVERDUE",
        thresholdDays: 15,
        recipientRole: "BUREAU_OFFICER",
        escalationLevel: "ESCALATION_L1",
        actionMessage: "Escalate delayed committee report to Bureau Advisor.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
      {
        id: "RULE-DOC-EXP-30",
        name: "Document Expiry Advance Warning",
        module: "DOCUMENT_EXPIRY",
        triggerCondition: "BEFORE_DEADLINE",
        thresholdDays: 30,
        recipientRole: "INSTITUTION",
        escalationLevel: "WARNING",
        actionMessage: "Issue statutory renewal reminder 30 days before Lease / NOC expiration.",
        isActive: true,
        isOfficialNotice: "Configurable prototype rule - not official AICTE guidelines",
      },
    ],
  });

  // 6. Seed ~50 Applications Across Stages, Paths & Ageing Buckets
  const appTypes = [
    "Extension of Approval (EoA)",
    "Increase in Intake",
    "Introduction of New Course",
    "New Institution",
    "Change of Site",
  ];

  const pathKeys = [
    "PATH_SCRUTINY_EVC",
    "PATH_ONLY_SCRUTINY",
    "PATH_ONLY_EVC",
    "PATH_EVC_SAC_SHC",
    "PATH_SCRUTINY_EVC_SAC_SHC",
  ];

  const officerNames: Record<string, string> = {
    North: "Shri Rajeshwar Rao",
    South: "Dr. K. Venkatraman",
    West: "Dr. Pradeep Patil",
    East: "Dr. Debabrata Banerjee",
    Central: "Dr. Meenakshi Sundaram",
  };

  const applicationsData = [];
  let appCounter = 1000;

  // We will distribute 50 applications across the 16 institutions
  for (let i = 0; i < 50; i++) {
    appCounter++;
    const inst = institutions[i % institutions.length];
    const pathId = pathKeys[i % pathKeys.length];
    const appType = inst.isNewInstitution ? "New Institution" : appTypes[i % appTypes.length];
    const isNew = appType === "New Institution";

    // Stage distribution
    let currentStage = "Scrutiny";
    let currentStageIndex = 0;
    let status = "IN_REVIEW";
    let deficiencyReason = null;
    let finalDecisionRemarks = null;
    let finalDecisionBy = null;
    let finalDecisionDate = null;

    // Ageing: distribute age (0-15, 16-30, 31-60, 60+ days ago)
    let ageInDays = 5;
    if (i % 6 === 0) ageInDays = 8; // 0-15
    else if (i % 6 === 1) ageInDays = 22; // 16-30
    else if (i % 6 === 2) ageInDays = 42; // 31-60
    else if (i % 6 === 3) ageInDays = 75; // 60+
    else if (i % 6 === 4) ageInDays = 12; // 0-15
    else ageInDays = 35; // 31-60

    const submittedDate = daysAgo(ageInDays + 5);
    const stageStartDate = daysAgo(ageInDays);

    if (i % 9 === 0) {
      currentStage = "Submitted";
      currentStageIndex = 0;
      status = "PENDING";
    } else if (i % 9 === 1 || i % 9 === 2) {
      currentStage = "Scrutiny";
      currentStageIndex = 0;
      status = "IN_REVIEW";
    } else if (i % 9 === 3 || i % 9 === 4) {
      currentStage = "EVC";
      currentStageIndex = pathId.includes("SCRUTINY") ? 1 : 0;
      status = "IN_REVIEW";
    } else if (i % 9 === 5) {
      currentStage = "Ready for Decision";
      currentStageIndex = 2;
      status = "READY_FOR_DECISION";
    } else if (i % 9 === 6) {
      currentStage = "Scrutiny";
      currentStageIndex = 0;
      status = "DEFICIENCY_REVERTED";
      deficiencyReason = "[DEFICIENCY] Fire safety clearance certificate expired; updated certificate required within 15 days.";
    } else if (i % 9 === 7) {
      currentStage = "Approved";
      currentStageIndex = 2;
      status = "APPROVED";
      finalDecisionRemarks = "Full compliance with AICTE norms established. Approval granted for AY 2026-27.";
      finalDecisionBy = "Dr. Sunita Deshmukh (BUREAU_OFFICER)";
      finalDecisionDate = daysAgo(3);
    } else {
      currentStage = "Conditional Approval";
      currentStageIndex = 2;
      status = "CONDITIONAL_APPROVAL";
      finalDecisionRemarks = "Conditional approval granted subject to submission of land conversion order within 60 days.";
      finalDecisionBy = "Shri Rajeshwar Rao (REGIONAL_OFFICER)";
      finalDecisionDate = daysAgo(10);
    }

    const appNumber = `AICTE/2026-27/APP-${appCounter}`;
    const officer = officerNames[inst.region] || "Regional Scrutiny Desk";

    applicationsData.push({
      id: `app-${appCounter}`,
      applicationNumber: appNumber,
      institutionId: inst.id,
      institutionName: inst.name,
      region: inst.region,
      academicYear: "2026-27",
      applicationType: appType,
      stagePathId: pathId,
      currentStage,
      currentStageIndex,
      status,
      assignedOfficerId: `ro-${inst.region.toLowerCase()}`,
      assignedOfficerName: officer,
      submittedAt: submittedDate,
      stageStartedAt: stageStartDate,
      lastActionDate: stageStartDate,
      deficiencyReason,
      finalDecisionRemarks,
      finalDecisionBy,
      finalDecisionDate,
      caseSummary: `[ELECTRONIC CASE SUMMARY - DRAFT: requires officer review]\nApp: ${appNumber} | ${inst.name} (${inst.region} Region)\nCategory: ${appType} | Stage: ${currentStage} (${status})\nAge in stage: ${ageInDays} days. Verified preliminary infrastructure dossiers.`,
      communicationDraft: `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION\nF.No. AICTE/${inst.region}/APP-${appCounter}/2026-27\nDraft communication regarding ${currentStage}. Status: ${status}.\nNote: Draft: requires officer review before digital dispatch.`,
      isNewInstitution: isNew,
      proposedIntake: 60 * ((i % 4) + 1),
      courseLevel: i % 3 === 0 ? "Under Graduate (B.Tech)" : i % 3 === 1 ? "Post Graduate (M.Tech/MBA)" : "Diploma in Engineering",
    });
  }

  await prisma.application.createMany({ data: applicationsData });

  // 7. Seed ~10 EVC Records (some upcoming, some due, some delayed, some for new institutions)
  const evcApps = applicationsData.filter((a) => a.currentStage === "EVC" || a.currentStage === "Ready for Decision").slice(0, 10);
  const evcRecords = [];

  for (let idx = 0; idx < evcApps.length; idx++) {
    const a = evcApps[idx];
    let schedDate = daysAhead(10);
    let status = "UPCOMING";
    let reportSummary = null;
    let recommendation = null;

    if (idx === 0) {
      schedDate = daysAhead(3); // Due soon
      status = "DUE";
    } else if (idx === 1 || idx === 2) {
      schedDate = daysAgo(8); // Overdue / Delayed by 8 days!
      status = "DELAYED";
    } else if (idx === 3) {
      schedDate = daysAgo(20); // Severely delayed by 20 days!
      status = "DELAYED";
    } else if (idx === 4) {
      schedDate = daysAgo(14);
      status = "COMPLETED";
      reportSummary = "Physical inspection completed. Campus laboratories, computer center and library verified compliant.";
      recommendation = "Recommended";
    } else {
      schedDate = daysAhead(15 + idx * 3);
      status = "UPCOMING";
    }

    evcRecords.push({
      id: `evc-${1000 + idx}`,
      applicationId: a.id,
      applicationNumber: a.applicationNumber,
      institutionName: a.institutionName,
      region: a.region,
      isNewInstitution: a.isNewInstitution,
      visitType: idx % 2 === 0 ? "Physical" : "Hybrid",
      scheduledDate: schedDate,
      committeeChairman: "Prof. (Dr.) Amitabh Sen (IIT/NIT Eminent Senior Faculty)",
      committeeMember2: "Dr. K. Srinivas (Institutional Expert)",
      committeeMember3: "Er. Amit Chawla (State Directorate Nominee)",
      status,
      reportSummary,
      deficienciesNoted: status === "DELAYED" ? "Inspection team awaiting revised campus layout blueprints." : null,
      recommendation,
      conductedAt: status === "COMPLETED" ? schedDate : null,
      scheduledBy: "Approval Bureau (Automated Workflow Allocation)",
    });
  }

  await prisma.eVCRecord.createMany({ data: evcRecords });

  // 8. Seed ~15 Time-bound Undertakings (some due soon, some overdue, some verified)
  const undertakingData = [
    {
      id: "und-101",
      applicationId: "app-1002",
      institutionId: "inst-101",
      institutionName: "Apex Institute of Technology, Bhopal",
      conditionText: "Submission of Building Completion Certificate (BCC) from competent municipal authority.",
      approvalRef: "AICTE/Central/COND/1002/2026",
      grantedDate: daysAgo(45),
      dueDate: daysAhead(15), // Due soon (15 days)
      status: "PENDING",
      escalationLevel: "NONE",
    },
    {
      id: "und-102",
      applicationId: "app-1003",
      institutionId: "inst-102",
      institutionName: "Vidya Jyoti College of Engineering, Raipur",
      conditionText: "Establishment of specialized AI/Robotics laboratory with 60 high-performance workstations.",
      approvalRef: "AICTE/Central/COND/1003/2026",
      grantedDate: daysAgo(70),
      dueDate: daysAgo(10), // Overdue by 10 days! (RO Alert)
      status: "OVERDUE",
      escalationLevel: "RO_ALERT",
    },
    {
      id: "und-103",
      applicationId: "app-1004",
      institutionId: "inst-103",
      institutionName: "Saraswati Institute of Management Studies, Jabalpur",
      conditionText: "Appointment of 2 regular Professors in Financial Management with AICTE qualification norms.",
      approvalRef: "AICTE/Central/COND/1004/2026",
      grantedDate: daysAgo(90),
      dueDate: daysAgo(25), // Overdue by 25 days! (BO Alert)
      status: "ESCALATED",
      escalationLevel: "BO_ALERT",
    },
    {
      id: "und-104",
      applicationId: "app-1005",
      institutionId: "inst-104",
      institutionName: "Shivalik College of Engineering, Dehradun",
      conditionText: "Installation of 100 kVA dedicated Solar PV rooftop generating system.",
      approvalRef: "AICTE/North/COND/1005/2026",
      grantedDate: daysAgo(120),
      dueDate: daysAgo(40), // Overdue by 40 days! (Senior Authority Alert)
      status: "ESCALATED",
      escalationLevel: "SENIOR_ALERT",
    },
    {
      id: "und-105",
      applicationId: "app-1006",
      institutionId: "inst-105",
      institutionName: "Haryana Institute of Technology & Research, Karnal",
      conditionText: "Submission of updated Fire Safety Clearance Certificate.",
      approvalRef: "AICTE/North/COND/1006/2026",
      grantedDate: daysAgo(20),
      dueDate: daysAhead(5), // Due very soon (5 days)
      status: "PENDING",
      escalationLevel: "NONE",
    },
    {
      id: "und-106",
      applicationId: "app-1007",
      institutionId: "inst-106",
      institutionName: "Himalaya Institute of Pharmacy, Solan",
      conditionText: "Deposit of joint Fixed Deposit Receipt (FDR) in favour of Regional Officer, AICTE.",
      approvalRef: "AICTE/North/COND/1007/2026",
      grantedDate: daysAgo(35),
      dueDate: daysAgo(2), // Overdue by 2 days (RO Alert)
      status: "OVERDUE",
      escalationLevel: "RO_ALERT",
    },
    {
      id: "und-107",
      applicationId: "app-1008",
      institutionId: "inst-107",
      institutionName: "Doon Global Polytechnic Institute, Roorkee",
      conditionText: "Setup of Barrier-Free environment with tactile paths and disabled-friendly toilets.",
      approvalRef: "AICTE/North/COND/1008/2026",
      grantedDate: daysAgo(60),
      dueDate: daysAgo(1), // Overdue by 1 day
      status: "OVERDUE",
      escalationLevel: "RO_ALERT",
    },
    {
      id: "und-108",
      applicationId: "app-1009",
      institutionId: "inst-108",
      institutionName: "Deccan Institute of Advanced Engineering, Hyderabad",
      conditionText: "Payment of enhanced gratuity and 7th CPC arrears to faculty members.",
      approvalRef: "AICTE/South/COND/1009/2026",
      grantedDate: daysAgo(30),
      dueDate: daysAhead(30), // Due in 30 days
      status: "PENDING",
      escalationLevel: "NONE",
    },
    {
      id: "und-109",
      applicationId: "app-1010",
      institutionId: "inst-109",
      institutionName: "Cauvery Institute of Technology, Mandya",
      conditionText: "Submission of structural stability certificate from National Institute of Technology.",
      approvalRef: "AICTE/South/COND/1010/2026",
      grantedDate: daysAgo(50),
      dueDate: daysAhead(10),
      status: "SUBMITTED",
      escalationLevel: "NONE",
      evidenceFileName: "Structural_Stability_NITK_Report.pdf",
      evidenceUploadedAt: daysAgo(2),
      evidenceRemarks: "Enclosing certified report from Civil Dept, NIT Surathkal verifying 100% stability.",
    },
    {
      id: "und-110",
      applicationId: "app-1011",
      institutionId: "inst-110",
      institutionName: "Malabar College of Engineering & Research, Thrissur",
      conditionText: "Procurement of licensed CAD/CAM design software tools (30 user seats).",
      approvalRef: "AICTE/South/COND/1011/2026",
      grantedDate: daysAgo(80),
      dueDate: daysAgo(5),
      status: "VERIFIED",
      escalationLevel: "NONE",
      evidenceFileName: "Autodesk_Campus_Invoice_License.pdf",
      evidenceUploadedAt: daysAgo(10),
      evidenceRemarks: "Perpetual campus bundle license procured and installed.",
      verifiedBy: "Dr. K. Venkatraman (RO South)",
      verifiedAt: daysAgo(4),
      officerRemarks: "Verified tax invoices and active subscription serial keys. Condition satisfied.",
    },
    {
      id: "und-111",
      applicationId: "app-1012",
      institutionId: "inst-111",
      institutionName: "Sahyadri Institute of Technology, Pune",
      conditionText: "Establishment of Industry-Institute Partnership Cell (IIPC) with signed MOUs.",
      approvalRef: "AICTE/West/COND/1012/2026",
      grantedDate: daysAgo(40),
      dueDate: daysAhead(20),
      status: "PENDING",
      escalationLevel: "NONE",
    },
    {
      id: "und-112",
      applicationId: "app-1013",
      institutionId: "inst-112",
      institutionName: "Girnar Engineering Academy, Rajkot",
      conditionText: "Affiliation letter from Gujarat Technological University (GTU) for new courses.",
      approvalRef: "AICTE/West/COND/1013/2026",
      grantedDate: daysAgo(95),
      dueDate: daysAgo(18), // Overdue 18 days (BO Alert)
      status: "ESCALATED",
      escalationLevel: "BO_ALERT",
    },
    {
      id: "und-113",
      applicationId: "app-1014",
      institutionId: "inst-113",
      institutionName: "Konkan Technical University Campus, Ratnagiri",
      conditionText: "Submission of water test potable certification from Public Health Engineering Dept.",
      approvalRef: "AICTE/West/COND/1014/2026",
      grantedDate: daysAgo(15),
      dueDate: daysAhead(45),
      status: "PENDING",
      escalationLevel: "NONE",
    },
    {
      id: "und-114",
      applicationId: "app-1015",
      institutionId: "inst-114",
      institutionName: "Brahmaputra Institute of Technology, Guwahati",
      conditionText: "Implementation of AICTE Biometric Attendance System linked to National Portal.",
      approvalRef: "AICTE/East/COND/1015/2026",
      grantedDate: daysAgo(65),
      dueDate: daysAgo(3),
      status: "SUBMITTED",
      escalationLevel: "NONE",
      evidenceFileName: "BAS_Integration_Certificate_NIC.pdf",
      evidenceUploadedAt: daysAgo(1),
      evidenceRemarks: "API integration completed with AICTE national attendance server.",
    },
    {
      id: "und-115",
      applicationId: "app-1016",
      institutionId: "inst-115",
      institutionName: "Kalinga Advanced Polytechnic, Bhubaneswar",
      conditionText: "Recruitment of qualified Workshop Superintendent as per prescribed AICTE scale.",
      approvalRef: "AICTE/East/COND/1016/2026",
      grantedDate: daysAgo(110),
      dueDate: daysAgo(32), // Overdue 32 days (Senior Alert)
      status: "ESCALATED",
      escalationLevel: "SENIOR_ALERT",
    },
  ];

  await prisma.undertaking.createMany({ data: undertakingData });

  // 9. Seed ~20 Lease & Document Validity Records
  const docTypes = [
    "Registered Land Lease Deed",
    "Fire Safety NOC",
    "Building Safety Certificate",
    "AICTE Mandatory Disclosure",
    "Occupancy Certificate",
    "Environmental Clearance",
  ];

  const documentData = [];
  for (let d = 0; d < 20; d++) {
    const inst = institutions[d % institutions.length];
    const docType = docTypes[d % docTypes.length];
    let validFrom = daysAgo(365);
    let validTo = daysAhead(180);
    let status = "VALID";
    let renewalFileName = null;
    let renewalSubmittedAt = null;
    let renewalRemarks = null;
    let verifiedBy = null;
    let verifiedAt = null;
    let verificationRemarks = null;

    if (d === 0) {
      // Apex Institute - Lease deed expiring in 18 days!
      validTo = daysAhead(18);
      status = "EXPIRING_SOON";
    } else if (d === 1) {
      // Expired 5 days ago!
      validTo = daysAgo(5);
      status = "EXPIRED";
    } else if (d === 2) {
      // Expired 30 days ago!
      validTo = daysAgo(30);
      status = "EXPIRED";
    } else if (d === 3) {
      // Renewal submitted, awaiting officer verification
      validTo = daysAhead(10);
      status = "RENEWAL_SUBMITTED";
      renewalFileName = "Registered_Lease_Deed_30Years_Extension.pdf";
      renewalSubmittedAt = daysAgo(3);
      renewalRemarks = "Registered extension deed executed at Sub-Registrar office for further 30 years.";
    } else if (d === 4) {
      // Verified recently
      validTo = daysAhead(720);
      status = "VERIFIED";
      verifiedBy = "Dr. Meenakshi Sundaram (RO Central)";
      verifiedAt = daysAgo(5);
      verificationRemarks = "Original registered deed scrutinized and verified with state land records.";
    } else if (d === 5 || d === 6) {
      validTo = daysAhead(25);
      status = "EXPIRING_SOON";
    }

    documentData.push({
      id: `doc-${200 + d}`,
      institutionId: inst.id,
      institutionName: inst.name,
      region: inst.region,
      documentType: docType,
      documentNumber: `REG-DOC-${inst.region.toUpperCase().substring(0, 2)}-${9820 + d}`,
      validFrom,
      validTo,
      status,
      renewalFileName,
      renewalSubmittedAt,
      renewalRemarks,
      verifiedBy,
      verifiedAt,
      verificationRemarks,
    });
  }

  await prisma.documentValidity.createMany({ data: documentData });

  // 10. Seed Notifications & Mock Emails
  await prisma.notification.createMany({
    data: [
      {
        id: "notif-init-1",
        title: "AY 2026-27 Approval Cycle Commenced",
        message: "Approval Bureau has opened processing windows across Northern, Southern, Eastern, Western and Central Regional Offices.",
        type: "INFO",
        targetRole: "ALL",
        link: "/applications",
        createdAt: daysAgo(10),
      },
      {
        id: "notif-init-2",
        title: "Escalation: 3 Undertakings Overdue Past 15 Days",
        message: "Bureau Officer alert: Multiple institutions in Central and North regions have unresolved conditions.",
        type: "ESCALATION",
        targetRole: "BUREAU_OFFICER",
        link: "/undertakings",
        createdAt: daysAgo(2),
      },
      {
        id: "notif-init-3",
        title: "EVC Visit Imminent: Apex Institute of Technology",
        message: "EVC Committee inspection due in 3 days. Ensure laboratory and safety equipment readiness.",
        type: "WARNING",
        targetRole: "INSTITUTION",
        link: "/evc",
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.emailLog.createMany({
    data: [
      {
        id: "eml-init-1",
        recipientEmail: "ro.central@aicte-india.org",
        recipientRole: "REGIONAL_OFFICER",
        subject: "AICTE Urgent: Compliance Notice for Central Region Undertakings",
        contentHtml: "<p>Dear Officer,</p><p>Please note 2 institutions are overdue regarding AICTE conditional approvals.</p>",
        sentAt: daysAgo(2),
        status: "DISPATCHED_SIMULATED",
      },
      {
        id: "eml-init-2",
        recipientEmail: "ad.approval@aicte-india.org",
        recipientRole: "BUREAU_OFFICER",
        subject: "Summary Report: EVC Scheduling and Delayed Inspection Docket",
        contentHtml: "<p>Weekly automated docket for pending EVC committees.</p>",
        sentAt: daysAgo(1),
        status: "DISPATCHED_SIMULATED",
      },
    ],
  });

  // 11. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: "aud-init-1",
        performedBy: "System Administrator",
        userRole: "ADMIN",
        action: "SYSTEM_INITIALIZE",
        entityType: "System",
        entityId: "SYS-INIT",
        beforeState: null,
        afterState: JSON.stringify({ academicYear: "2026-27", regions: 5, applications: 50 }),
        reason: "Initial deployment and database seeding with standard workflow configurations.",
        timestamp: daysAgo(15),
      },
      {
        id: "aud-init-2",
        performedBy: "Shri Rajeshwar Rao",
        userRole: "REGIONAL_OFFICER",
        action: "STAGE_ADVANCED",
        entityType: "Application",
        entityId: "app-1002",
        beforeState: JSON.stringify({ currentStage: "Scrutiny" }),
        afterState: JSON.stringify({ currentStage: "EVC" }),
        reason: "Scrutiny parameters verified compliant. Scheduled for physical EVC visit.",
        timestamp: daysAgo(8),
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log(`- 16 Institutions across 5 Regions`);
  console.log(`- 5 Stage Path Configurations`);
  console.log(`- 10 Configurable Prototype Rules`);
  console.log(`- 50 Applications across all stages & paths`);
  console.log(`- 10 EVC Inspection Records`);
  console.log(`- 15 Time-bound Undertakings (with Overdue & Escalations)`);
  console.log(`- 20 Lease & Document Validity Records`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
