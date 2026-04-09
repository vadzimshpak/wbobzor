import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAdminAccessCookie } from "@/lib/admin-cookie";

export function middleware(request: NextRequest) {
  const hash = process.env.ADMIN_HASH;
  const cookieVal = request.cookies.get("admin_access")?.value;
  if (!isAdminAccessCookie(cookieVal, hash)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/posts/new"],
};
