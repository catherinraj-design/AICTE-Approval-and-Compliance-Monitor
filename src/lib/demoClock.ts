import { cookies } from "next/headers";

// Base reference date for realistic demo data: 26 October 2026
export const BASE_DEMO_DATE = new Date("2026-10-26T10:00:00.000Z");

export async function getSimulatedDate(): Promise<Date> {
  try {
    const cookieStore = cookies();
    const offsetCookie = cookieStore.get("aicte_demo_offset_days");
    const offsetDays = offsetCookie ? parseInt(offsetCookie.value, 10) : 0;
    
    const simulated = new Date(BASE_DEMO_DATE.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return simulated;
  } catch {
    return BASE_DEMO_DATE;
  }
}

export function getSimulatedDateFromOffset(offsetDays: number): Date {
  return new Date(BASE_DEMO_DATE.getTime() + offsetDays * 24 * 60 * 60 * 1000);
}
