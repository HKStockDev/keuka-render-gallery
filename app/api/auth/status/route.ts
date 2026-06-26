import { NextRequest, NextResponse } from "next/server";
import {
  getAuthSecret,
  isAuthEnabled,
  verifySessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const enabled = isAuthEnabled();
  if (!enabled) {
    return NextResponse.json({ enabled: false, authenticated: true });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token, getAuthSecret());

  return NextResponse.json({ enabled: true, authenticated });
}
