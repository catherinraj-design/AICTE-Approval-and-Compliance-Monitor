/**
 * AICTE Approval & Compliance Monitor Formatters
 * Strict Indian Date Format (DD-MM-YYYY) as requested in requirements.
 */

export function formatDateIndian(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateTimeIndian(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes} IST`;
}

export function calculateDaysBetween(start: Date | string, end: Date | string): number {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getAgeingBucket(days: number): "0-15" | "16-30" | "31-60" | "60+" {
  if (days <= 15) return "0-15";
  if (days <= 30) return "16-30";
  if (days <= 60) return "31-60";
  return "60+";
}

export function getStatusColorClass(status: string): { bg: string; text: string; border: string } {
  switch (status.toUpperCase()) {
    case "APPROVED":
    case "VERIFIED":
    case "COMPLETED":
    case "VALID":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-300",
      };
    case "UPCOMING":
    case "IN_REVIEW":
    case "RENEWAL_SUBMITTED":
    case "SUBMITTED":
    case "PENDING":
    case "EXPIRING_SOON":
    case "DUE":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-300",
      };
    case "REJECTED":
    case "EXPIRED":
    case "OVERDUE":
    case "DEFICIENCY_REVERTED":
    case "DELAYED":
    case "ESCALATED":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-300",
      };
    case "READY_FOR_DECISION":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-300",
      };
    case "CONDITIONAL_APPROVAL":
    case "CONDITIONAL":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-300",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-300",
      };
  }
}
