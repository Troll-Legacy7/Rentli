import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/auth", "/invite", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;
  const isLoggedIn = !!user;
  const role = user?.role;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && pathname.startsWith("/auth")) {
      const dest = role === "LANDLORD" ? "/landlord" : "/tenant";
      return NextResponse.redirect(new URL(dest, req.nextUrl));
    }
    return NextResponse.next();
  }

  // Landing page: redirect logged-in users to their dashboard
  if (pathname === "/") {
    if (isLoggedIn) {
      const dest = role === "LANDLORD" ? "/landlord" : "/tenant";
      return NextResponse.redirect(new URL(dest, req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected routes: require auth
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  // Role-based access
  if (pathname.startsWith("/landlord") && role !== "LANDLORD") {
    return NextResponse.redirect(new URL("/tenant", req.nextUrl));
  }
  if (pathname.startsWith("/tenant") && role !== "TENANT") {
    return NextResponse.redirect(new URL("/landlord", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
