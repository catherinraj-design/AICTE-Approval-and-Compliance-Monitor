import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { ReportsClient } from "@/components/ReportsClient";
import { formatDateIndian } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

  const whereApp: Record<string, unknown> = {};
  if (user.role === "INSTITUTION") {
    whereApp.institutionId = user.institutionId || "inst-101";
  } else if (user.role === "REGIONAL_OFFICER" && user.region && user.region !== "ALL") {
    whereApp.region = user.region;
  }

  const applications = await prisma.application.findMany({
    where: whereApp,
    orderBy: { submittedAt: "desc" },
  });

  const evcs = await prisma.eVCRecord.findMany({
    orderBy: { scheduledDate: "asc" },
  });

  const undertakings = await prisma.undertaking.findMany({
    orderBy: { dueDate: "asc" },
  });

  const documents = await prisma.documentValidity.findMany({
    orderBy: { validTo: "asc" },
  });

  return (
    <div className="space-y-6">
      <ReportsClient
        applications={applications.map((a) => ({
          ...a,
          submittedAt: a.submittedAt.toISOString(),
          stageStartedAt: a.stageStartedAt.toISOString(),
        }))}
        evcs={evcs.map((e) => ({
          ...e,
          scheduledDate: e.scheduledDate.toISOString(),
        }))}
        undertakings={undertakings.map((u) => ({
          ...u,
          grantedDate: u.grantedDate.toISOString(),
          dueDate: u.dueDate.toISOString(),
        }))}
        documents={documents.map((d) => ({
          ...d,
          validFrom: d.validFrom.toISOString(),
          validTo: d.validTo.toISOString(),
        }))}
        simulatedDate={formatDateIndian(simulatedDate)}
      />
    </div>
  );
}
