import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request) {
  const path = request.nextUrl.pathname

  // Define public paths
  const publicPaths = ['/login', '/signup']
  const protectedPaths = ['/account', '/account-billing', '/list-property', '/account-password', '/account-savelists']
  const isPublicPath = publicPaths.includes(path)
  const isProtectedPaths = protectedPaths.includes(path)
  
  // Check auth token
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value || 
                request.cookies.get('jwt')?.value || ''
  
  // Check for dashboard paths
  const isDashboardPath = path.startsWith('/admin')
  
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (isProtectedPaths && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Protect dashboard routes for admin only
  if (isDashboardPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verify if user has admin role
    try {
      const decoded = jwtDecode(token);
      if (!decoded.role || decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// Define more precise matchers
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/admin/:path*',
    '/account', 
    '/account-billing', 
    '/account-password', 
    '/account-savelists',
    '/list-property',
  ]
}