// middleware.js
import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request) {
  const path = request.nextUrl.pathname
  console.log('Middleware executing for path:', path)

  const publicPaths = ['/login', '/signup', '/admin-login']
  const protectedPaths = ['/account', '/account-billing', '/list-property', '/account-password', '/account-savelists']
  
  const isPublicPath = publicPaths.includes(path)
  const isProtectedPath = protectedPaths.includes(path)
  
  // Check for booking paths (with or without query params/dynamic segments)
  const isBookingPath = path.startsWith('/booking')
  const isBookingConfirmationPath = path.startsWith('/booking-confirmation')
  
  // Check auth token - try all possible cookie names
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value || 
                request.cookies.get('jwt')?.value || ''
  
  console.log('Token found:', !!token, 'for path:', path)

  // Function to clear cookies and redirect to login
  const clearCookiesAndRedirect = () => {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    response.cookies.delete('authToken')
    response.cookies.delete('jwt')
    return response
  }
  
  // Check for dashboard paths
  const isDashboardPath = path.startsWith('/admin')
  const isHostPath = path.startsWith('/host')
  
  // All protected paths including booking routes
  const requiresAuth = isProtectedPath || isBookingPath || isBookingConfirmationPath || isHostPath || isDashboardPath
  
  if (isPublicPath && token) {
    // Check if token is expired even for public paths
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      if (decoded.exp < currentTime) {
        console.log('Token expired on public path')
        return clearCookiesAndRedirect()
      }
      // Token is valid, redirect to home
      console.log('Valid token on public path, redirecting to home')
      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
      console.log('Token decode error on public path:', error)
      return clearCookiesAndRedirect()
    }
  }
  
  // Redirect to login if no token for protected paths
  if (requiresAuth && !token) {
    console.log('No token for protected path, redirecting to login')
    
    // Special case: admin paths redirect to admin-login
    if (isDashboardPath) {
      console.log('No token for admin path, redirecting to admin-login')
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check token expiration and roles for protected paths
  if (requiresAuth && token) {
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      // Check if token is expired
      if (decoded.exp < currentTime) {
        console.log('Token expired, clearing cookies and redirecting to login')
        return clearCookiesAndRedirect()
      }
      
      // Role-based checks for admin paths
      if (isDashboardPath && (!decoded.role || decoded.role !== 'admin')) {
        console.log('User does not have admin role:', decoded.role)
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }
      
      console.log('Token valid for protected path')
      
    } catch (error) {
      console.log('Token decode error:', error)
      return clearCookiesAndRedirect()
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin-login',
    '/login',
    '/signup',
    '/admin/:path*',
    '/host/:path*',
    '/booking/:path*',
    '/booking-confirmation/:path*',
    '/account', 
    '/account-billing', 
    '/account-password', 
    '/account-savelists',
    '/list-property',
  ]
}