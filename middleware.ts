import { NextRequest, NextResponse } from "next/server";

/**
 * Optional single-password protection via HTTP Basic Auth.
 * Set GALLERY_PASSWORD in env — no login page, no roles, no sessions.
 * Leave unset to keep the gallery open (e.g. local demo).
 */
function getPassword(): string | undefined {
  const value = process.env.GALLERY_PASSWORD?.trim();
  return value || undefined;
}

function isAuthorized(request: NextRequest, password: string): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return false;
    // Username is ignored — one shared team password
    return decoded.slice(separator + 1) === password;
  } catch {
    return false;
  }
}

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Keuka Studios Gallery", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  const password = getPassword();
  if (!password) return NextResponse.next();

  if (isAuthorized(request, password)) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
