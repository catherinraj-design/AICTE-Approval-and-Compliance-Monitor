export type Role =
  | "INSTITUTION"
  | "REGIONAL_OFFICER"
  | "BUREAU_OFFICER"
  | "COMMITTEE_MEMBER"
  | "ADMIN";

export type Region = "North" | "South" | "West" | "East" | "Central" | "ALL";

export interface MockUserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  region?: Region;
  institutionId?: string;
  institutionName?: string;
  designation?: string;
}

export const MOCK_USERS: MockUserSession[] = [
  {
    id: "inst-apex",
    name: "Dr. Suresh Verma (Registrar)",
    email: "registrar@apextech.edu.in",
    role: "INSTITUTION",
    region: "Central",
    institutionId: "inst-101",
    institutionName: "Apex Institute of Technology, Bhopal",
    designation: "Head of Institution / Authorized Signatory",
  },
  {
    id: "ro-north",
    name: "Shri Rajeshwar Rao",
    email: "ro.north@aicte-india.org",
    role: "REGIONAL_OFFICER",
    region: "North",
    designation: "Regional Officer - Northern Regional Office (Kanpur/Delhi)",
  },
  {
    id: "ro-central",
    name: "Dr. Meenakshi Sundaram",
    email: "ro.central@aicte-india.org",
    role: "REGIONAL_OFFICER",
    region: "Central",
    designation: "Regional Officer - Central Regional Office (Bhopal)",
  },
  {
    id: "bureau-officer",
    name: "Dr. Sunita Deshmukh",
    email: "ad.approval@aicte-india.org",
    role: "BUREAU_OFFICER",
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
    designation: "Senior Authority & System Administrator",
  },
];

export const WORKFLOW_PATHS = [
  {
    id: "PATH_SCRUTINY_EVC",
    name: "Scrutiny + EVC",
    description: "Standard path for Extension of Approval with variations and New Programs.",
    stages: ["Scrutiny", "EVC"],
  },
  {
    id: "PATH_ONLY_SCRUTINY",
    name: "Only Scrutiny",
    description: "Fast-track path for routine Extension of Approval without changes.",
    stages: ["Scrutiny"],
  },
  {
    id: "PATH_ONLY_EVC",
    name: "Only EVC",
    description: "Inspection-focused track for physical infrastructure re-verification.",
    stages: ["EVC"],
  },
  {
    id: "PATH_EVC_SAC_SHC",
    name: "EVC + SAC/SHC",
    description: "Inspection followed by Standing Appellate / Hearing Committee review.",
    stages: ["EVC", "SAC_SHC"],
  },
  {
    id: "PATH_SCRUTINY_EVC_SAC_SHC",
    name: "Scrutiny + EVC + SAC/SHC",
    description: "Comprehensive path for New Institutions or complex disputed approvals.",
    stages: ["Scrutiny", "EVC", "SAC_SHC"],
  },
];
