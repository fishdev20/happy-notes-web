import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const protectedPaths = ["/home", "/notes", "/calendar", "/archive", "/trash", "/settings"];
const authPaths = ["/login", "/register"];

function matchesPath(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = matchesPath(pathname, protectedPaths);
  const isAuthPath = matchesPath(pathname, authPaths);

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/home";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/notes/:path*",
    "/calendar/:path*",
    "/archive/:path*",
    "/trash/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
