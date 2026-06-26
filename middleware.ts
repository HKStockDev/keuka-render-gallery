import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getAuthSecret,
  isAuthEnabled,
  verifySessionToken,
} from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/status"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (/\.(jpg|jpeg|png|webp|svg|ico|css|js|woff2?)$/i.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secret = getAuthSecret();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token, secret);

  if (valid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
