import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // The dashboard performs the authoritative database/session validation.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
