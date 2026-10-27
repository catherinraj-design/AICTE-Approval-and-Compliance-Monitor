import React from "react";
import { getStatusColorClass } from "@/lib/formatters";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colors = getStatusColorClass(status);
  
  // Format readable text
  let label = status.replace(/_/g, " ");
  if (status === "READY_FOR_DECISION") label = "Ready for Decision";
  if (status === "DEFICIENCY_REVERTED") label = "Returned for Deficiency";
  if (status === "CONDITIONAL_APPROVAL") label = "Conditional Approval";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
      {label}
    </span>
  );
}
