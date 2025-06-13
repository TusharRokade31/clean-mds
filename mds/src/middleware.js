// Update your middleware.js
import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request) {
  const path = request.nextUrl.pathname
  console.log('Middleware executing for path:', path) // Debug log

  // Define public paths
  const publicPaths = ['/login', '/signup']
  const protectedPaths = ['/account', '/account-billing', '/list-property', '/account-password', '/account-savelists']
  const isPublicPath = publicPaths.includes(path)
  const isProtectedPaths = protectedPaths.includes(path)
  
  // Check auth token
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value || 
                request.cookies.get('jwt')?.value || ''
  
  console.log('Token found:', !!token) // Debug log
  
  // Check for dashboard paths
  const isDashboardPath = path.startsWith('/admin')
  const isHostPath = path.startsWith('/host')
  
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  if (isProtectedPaths && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isHostPath) {
    if (!token) {
      console.log('No token for host path, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Add role check for host paths if needed
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token for host:', decoded) // Debug log
      // Add any role checks here if needed
    } catch (error) {
      console.log('Token decode error for host:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Protect dashboard routes for admin only
  if (isDashboardPath) {
    if (!token) {
      console.log('No token for admin path, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verify if user has admin role
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token for admin:', decoded) // Debug log
      if (!decoded.role || decoded.role !== 'admin') {
        console.log('User does not have admin role:', decoded.role)
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.log('Token decode error for admin:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/admin/:path*',
    '/host/:path*',
    '/account', 
    '/account-billing', 
    '/account-password', 
    '/account-savelists',
    '/list-property',
  ]
}