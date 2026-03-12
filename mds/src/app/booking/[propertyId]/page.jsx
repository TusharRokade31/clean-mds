// app/booking/[propertyId]/page.jsx
"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import BookingPage from "@/component/onlinebooking/BookingPage"

export default function BookingRoute() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const [property,      setProperty]      = useState(null)
  const [selectedRooms, setSelectedRooms] = useState(null)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const storedProperty = JSON.parse(localStorage.getItem("selectedProperty") || "null")

    // ── Multi-room path ──────────────────────────────────────────────────────
    const storedRooms = JSON.parse(localStorage.getItem("selectedRooms") || "null")

    if (storedProperty && storedRooms?.length) {
      // Each entry may have the same roomId (duplicate room) — enrich with roomObj
      const enriched = storedRooms.map((sr, idx) => {
        const roomObj = storedProperty.rooms?.find(r => r._id === sr.roomId) || null
        return {
          ...sr,
          // Ensure cartKey exists (fallback if coming from old format)
          cartKey: sr.cartKey || `${sr.roomId}_${idx}`,
          roomObj,
        }
      })
      setProperty(storedProperty)
      setSelectedRooms(enriched)
      setLoading(false)
      return
    }

    // ── Legacy single-room path ──────────────────────────────────────────────
    const storedRoom = JSON.parse(localStorage.getItem("selectedRoom") || "null")
    if (storedProperty && storedRoom) {
      setProperty(storedProperty)
      setSelectedRooms([{
        cartKey:    storedRoom._id,
        roomId:     storedRoom._id,
        roomName:   storedRoom.roomName,
        guestCount: { adults: 1, children: 0 },
        roomObj:    storedRoom,
      }])
    }

    setLoading(false)
  }, [params.propertyId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!property || !selectedRooms?.length) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No rooms selected</h2>
        <p className="text-gray-500 text-sm mb-5">Please go back and select rooms from the property page to continue.</p>
        <button onClick={() => window.history.back()}
          className="text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          style={{ background: "#1035ac" }}>
          ← Go Back
        </button>
      </div>
    </div>
  )

  return <BookingPage property={property} selectedRooms={selectedRooms} />
}