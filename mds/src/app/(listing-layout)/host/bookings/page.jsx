// pages/host/bookings/page.jsx
"use client"
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllBookings, fetchBookingStats } from '@/redux/features/bookings/bookingSlice'
import BookingModal from '@/component/bookings/BookingModal'
import RoomGrid from '@/component/bookings/RoomGrid'
import BookingStats from '@/component/bookings/BookingStats'


export default function BookingsPage() {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const dispatch = useDispatch()
  const { bookings, bookingStats, isLoading } = useSelector(state => state.booking)
  console.log(bookings)

  useEffect(() => {
    // Load selected property from localStorage
    const saved = localStorage.getItem('selectedProperty')
    if (saved) {
      setSelectedProperty(JSON.parse(saved))
    }

    // Listen for property changes
    const handlePropertyChange = (event) => {
      setSelectedProperty(event.detail)
    } 

    window.addEventListener('propertyChanged', handlePropertyChange)
    return () => window.removeEventListener('propertyChanged', handlePropertyChange)
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      // Fetch bookings for selected property
      dispatch(fetchAllBookings({ propertyId: selectedProperty._id }))
      dispatch(fetchBookingStats({ propertyId: selectedProperty._id }))
    }
  }, [selectedProperty, dispatch])

  const handleRoomClick = (room, action) => {
    setSelectedRoom(room)
    if (action === 'book') {
      setShowBookingModal(true)
    }
    else{
      console.log(room, "handle view room ")
      setShowBookingModal(true)
    }
    // Handle other actions like view booking details
  }

  if (!selectedProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Property Selected</h2>
          <p className="text-gray-500">Please select a property from the sidebar to view bookings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">{selectedProperty.placeName}</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-[#1035ac] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Booking
        </button>
      </div>

      {/* Stats */}
      <BookingStats stats={bookingStats} />

      {/* Filters */}
      {/* <BookingFilters propertyId={selectedProperty._id} /> */}

      {/* Room Grid */}
      <RoomGrid 
        property={selectedProperty}
        bookings={bookings}
        onRoomClick={handleRoomClick}
        isLoading={isLoading}
      />

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          property={selectedProperty}
          room={selectedRoom}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedRoom(null)
          }}
        />
      )}
    </div>
  )
}