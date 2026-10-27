import { cookies } from "next/headers";
import { MOCK_USERS, MockUserSession, Role, Region } from "./types";

export function getCurrentUser(): MockUserSession {
  try {
    const cookieStore = cookies();
    const roleCookie = cookieStore.get("aicte_role")?.value as Role | undefined;
    const userIdCookie = cookieStore.get("aicte_user_id")?.value;
    const regionCookie = cookieStore.get("aicte_region")?.value as Region | undefined;

    if (userIdCookie) {
      const found = MOCK_USERS.find((u) => u.id === userIdCookie);
      if (found) {
        return {
          ...found,
          region: regionCookie || found.region,
        };
      }
    }

    if (roleCookie) {
      const foundRole = MOCK_USERS.find((u) => u.role === roleCookie);
      if (foundRole) {
        return {
          ...foundRole,
          region: regionCookie || foundRole.region,
        };
      }
    }
  } catch {
    // If running in context where cookies() is unavailable, fallback to RO or Admin
  }

  // Default to Regional Officer (North) for rich initial administrative view
  return MOCK_USERS[1]; // Shri Rajeshwar Rao, RO North
}
