// pages/booking/[propertyId].jsx or app/booking/[propertyId]/page.jsx
"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import BookingPage from "@/component/onlinebooking/BookingPage"


export default function BookingRoute() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [property, setProperty] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get property and room from localStorage
    const storedProperty = JSON.parse(localStorage.getItem('selectedProperty') || '{}')
    const storedRoom = JSON.parse(localStorage.getItem('selectedRoom') || '{}')
    
    if (storedProperty && storedRoom) {
      setProperty(storedProperty)
      setSelectedRoom(storedRoom)
    }
    
    setLoading(false)
  }, [params.propertyId, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property || !selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Request</h2>
          <p className="text-gray-600 mb-4">Please select a room from the property page to continue.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <BookingPage property={property} selectedRoom={selectedRoom} />
}