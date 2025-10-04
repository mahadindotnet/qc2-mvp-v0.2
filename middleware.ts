import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Check for authentication in sessionStorage (client-side)
    // Since middleware runs on server, we'll handle this in the admin page component
    // This middleware will redirect to login if no auth cookie is present
    const authCookie = request.cookies.get('admin_authenticated')
    
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
