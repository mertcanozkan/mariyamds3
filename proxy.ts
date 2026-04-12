import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async function middleware(req: NextRequest & { auth: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users away from the login page only.
  // /register is intentionally excluded: new OAuth users are redirected
  // there from /dashboard when they have no student profile yet.
  if (pathname === "/login" && session?.user) {
    const role = session.user.role;
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)",
  ],
};
