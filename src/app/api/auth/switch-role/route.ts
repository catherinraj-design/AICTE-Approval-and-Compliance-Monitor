import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, region } = body;

    const matchedUser = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS.find((u) => u.role === role);
    const targetRole = matchedUser ? matchedUser.role : role;
    const targetUserId = matchedUser ? matchedUser.id : userId;
    const targetRegion = region || (matchedUser ? matchedUser.region : "Central");

    const response = NextResponse.json({
      success: true,
      user: matchedUser,
      role: targetRole,
      userId: targetUserId,
      region: targetRegion,
    });

    response.cookies.set("aicte_role", targetRole, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set("aicte_user_id", targetUserId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    if (targetRegion) {
      response.cookies.set("aicte_region", targetRegion, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error switching role";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
