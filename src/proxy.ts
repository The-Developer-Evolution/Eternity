import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";

const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/admin": [Role.SUPER],
  "/admin/talkshow": [Role.SUPER, Role.TALKSHOW],
  "/admin/trading/blackmarket": [Role.SUPER, Role.BLACKMARKET],
  "/admin/trading/convert": [Role.SUPER, Role.CURRENCY],
  "/admin/trading/pitching": [Role.SUPER, Role.PITCHING, Role.PITCHINGGUARD],
  "/admin/trading/pressure": [Role.SUPER, Role.PRESSURE],
  "/admin/trading/treasure": [Role.SUPER, Role.THUNT],
};

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token?.role) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(token.role as Role)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      }
    }

    if (pathname.startsWith("/peserta")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
