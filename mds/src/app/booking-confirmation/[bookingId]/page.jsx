"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import BookingConfirmation from "@/component/onlinebooking/BookingConfirmation"

export default function BookingConfirmationRoute() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [bookingExists, setBookingExists] = useState(false)

  useEffect(() => {
    // Check if booking data exists in localStorage
    const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || '{}')
    console.log(currentBooking)
    
    if (currentBooking && currentBooking._id === params.bookingId) {
      setBookingExists(true)
    } else if (currentBooking && currentBooking.bookingId === params.bookingId) {
      setBookingExists(true)
    }
    
    setLoading(false)
  }, [params.bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!bookingExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the booking confirmation you're looking for. This might happen if:
          </p>
          <ul className="text-sm text-gray-500 text-left mb-6 space-y-1">
            <li>• The booking session has expired</li>
            <li>• You navigated away from the booking process</li>
            <li>• The booking ID is invalid</li>
          </ul>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Search Again
            </button>
            <button 
              onClick={() => window.location.href = '/my-bookings'}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <BookingConfirmation bookingId={params.bookingId} />
}