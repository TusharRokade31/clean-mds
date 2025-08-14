// middleware.js
import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request) {
  const path = request.nextUrl.pathname
  console.log('Middleware executing for path:', path)

  const publicPaths = ['/login', '/signup', '/admin-login']
  const protectedPaths = ['/account', '/account-billing', '/list-property', '/account-password', '/account-savelists']
  const isPublicPath = publicPaths.includes(path)
  const isProtectedPaths = protectedPaths.includes(path)
  
  // Check auth token
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value || 
                request.cookies.get('jwt')?.value || ''
  

  
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
  
  if (isPublicPath && token) {
    // Check if token is expired even for public paths
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      if (decoded.exp < currentTime) {
        return clearCookiesAndRedirect()
      }
    } catch (error) {
      return clearCookiesAndRedirect()
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  if (isProtectedPaths && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check token expiration for protected paths
  if ((isProtectedPaths || isHostPath || isDashboardPath) && token) {
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      // Check if token is expired
      if (decoded.exp < currentTime) {
        console.log('Token expired, clearing cookies and redirecting to login')
        return clearCookiesAndRedirect()
      }
      
      // Role-based checks
      if (isDashboardPath && (!decoded.role || decoded.role !== 'admin')) {
        console.log('User does not have admin role:', decoded.role)
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }
      
    } catch (error) {
      console.log('Token decode error:', error)
      return clearCookiesAndRedirect()
    }
  }

  if (isHostPath && !token) {
    console.log('No token for host path, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (isDashboardPath && !token) {
    console.log('No token for admin path, redirecting to login')
    return NextResponse.redirect(new URL('/admin-login', request.url))
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
    '/account', 
    '/account-billing', 
    '/account-password', 
    '/account-savelists',
    '/list-property',
  ]
}