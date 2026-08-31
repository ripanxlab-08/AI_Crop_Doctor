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
  const cookies = request.cookies;

  let hasSession = false;
  // Direct check for sb-access-token set by client store
  if (cookies.has("sb-access-token") && (cookies.get("sb-access-token")?.value.length ?? 0) > 10) {
    hasSession = true;
  } else {
    // Fallback search for any Supabase auth cookies
    for (const cookie of cookies.getAll()) {
      if (
        cookie.name.includes("sb-") ||
        cookie.name.includes("auth-token") ||
        cookie.name.includes("supabase")
      ) {
        if (cookie.value && cookie.value.length > 10) {
          hasSession = true;
          break;
        }
      }
    }
  }

  // If no Supabase session cookie found, redirect to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
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
