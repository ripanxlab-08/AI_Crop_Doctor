import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes that require authentication.
 * Any path matching this list will redirect to /login
 * if the user does not have a valid Supabase session cookie.
 */
const PROTECTED_PREFIXES = [
  "/home",
  "/diagnose",
  "/result",
  "/history",
  "/profile",
  "/calendar",
  "/crops",
  "/assistant",
  "/architecture",
];

/** Public routes that are always accessible */
const PUBLIC_PATHS = ["/login", "/", "/_next", "/api", "/icon.png", "/favicon.ico"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith("/_next"));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Only enforce auth on protected routes
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Supabase auth session cookie
  // Supabase stores the session in a cookie named sb-<projectRef>-auth-token
  const cookies = request.cookies;

  // Check all cookie names for Supabase session tokens
  let hasSession = false;
  for (const [name] of cookies) {
    if (
      (name.includes("sb-") && name.includes("-auth-token")) ||
      name === "sb-access-token" ||
      name === "supabase-auth-token"
    ) {
      const cookieVal = cookies.get(name)?.value ?? "";
      if (cookieVal.length > 20) {
        hasSession = true;
        break;
      }
    }
  }

  // If no Supabase session cookie found, redirect to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
