import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const verifiedToken = token && (await verifyAuth(token).catch(() => null));

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isHomePage = req.nextUrl.pathname === "/";

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (verifiedToken) {
      return NextResponse.redirect(new URL("/board", req.url));
    }
    return NextResponse.next();
  }

  if (isHomePage) {
    return NextResponse.next();
  }

  if (!verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
