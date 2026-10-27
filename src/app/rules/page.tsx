import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSimulatedDate } from "@/lib/demoClock";
import { RulesEngineClient } from "@/components/RulesEngineClient";
import { formatDateIndian } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const user = getCurrentUser();
  const simulatedDate = await getSimulatedDate();

  const rules = await prisma.ruleConfig.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      <RulesEngineClient
        rules={rules.map((r) => ({
          id: r.id,
          name: r.name,
          module: r.module,
          triggerCondition: r.triggerCondition,
          thresholdDays: r.thresholdDays,
          recipientRole: r.recipientRole,
          escalationLevel: r.escalationLevel,
          actionMessage: r.actionMessage,
          isActive: r.isActive,
          isOfficialNotice: r.isOfficialNotice,
        }))}
        currentUserRole={user.role}
        simulatedDate={formatDateIndian(simulatedDate)}
      />
    </div>
  );
}
