import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes are protected
const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // In a real app, you would check for a valid session or JWT token
    // For now, we'll check if there's a user in localStorage
    // Since middleware runs on the server, we can't access localStorage directly
    // We'll need to implement proper session management
    
    // For demonstration purposes, we'll allow access to the dashboard
    // In a real app, you would implement proper authentication checks here
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/dashboard/:path*"],
};