// components/bookings/RoomGrid.jsx
"use client"

import { useState, useMemo } from 'react'
import { Calendar, Users, Bed, DollarSign, Eye, UserPlus } from 'lucide-react'

export default function RoomGrid({ property, bookings, onRoomClick, isLoading }) {
  const [filters, setFilters] = useState({
    status: 'all',
    roomType: 'all',
    bedSize: 'all'
  })

  
  // Get room booking status
  const getRoomStatus = (roomId) => {
    const today = new Date()
    const roomBookings = bookings.filter(booking => 
      booking.room === roomId && 
      booking.status !== 'cancelled' &&
      booking.status !== 'no-show'
    )

    // Check if room is currently occupied
    const currentBooking = roomBookings.find(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      return checkIn <= today && checkOut > today && booking.status === 'checked-in'
    })

    if (currentBooking) {
      return { status: 'occupied', booking: currentBooking }
    }

    // Check if room has booking for today (arriving)
    const todayBooking = roomBookings.find(booking => {
      const checkIn = new Date(booking.checkIn)
      return checkIn.toDateString() === today.toDateString() && booking.status === 'confirmed'
    })

    if (todayBooking) {
      return { status: 'arriving', booking: todayBooking }
    }

    // Check if room has checkout today
    const checkoutBooking = roomBookings.find(booking => {
      const checkOut = new Date(booking.checkOut)
      return checkOut.toDateString() === today.toDateString() && booking.status === 'checked-in'
    })

    if (checkoutBooking) {
      return { status: 'departing', booking: checkoutBooking }
    }

    return { status: 'available', booking: null }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200'
      case 'arriving': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'departing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied': return 'Occupied'
      case 'arriving': return 'Arriving Today'
      case 'departing': return 'Departing Today'
      case 'available': return 'Available'
      default: return 'Unknown'
    }
  }

  const filteredRooms = useMemo(() => {
    if (!property?.rooms) return []
    
    return property.rooms.filter(room => {
      if (filters.status !== 'all') {
        const roomStatus = getRoomStatus(room._id)
        if (roomStatus.status !== filters.status) return false
      }
      if (filters.roomType !== 'all' && room.type !== filters.roomType) return false
      if (filters.bedSize !== 'all' && room.bedType !== filters.bedSize) return false
      return true
    })
  }, [property?.rooms, bookings, filters])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="arriving">Arriving</option>
            <option value="departing">Departing</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Room Type:</label>
          <select
            value={filters.roomType}
            onChange={(e) => setFilters({...filters, roomType: e.target.value})}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Super Deluxe">Super Deluxe</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const roomStatus = getRoomStatus(room._id)
          
          return (
            <div
              key={room._id}
              className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${getStatusColor(roomStatus.status)}`}
            >
              {/* Room Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">Room {room.number}</h3>
                  <p className="text-sm opacity-75">{room.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(roomStatus.status)}`}>
                  {getStatusText(roomStatus.status)}
                </span>
              </div>

              {/* Room Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="h-4 w-4" />
                  <span>{room.bedType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{room.occupancy?.maximumOccupancy} guests max</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>₹{room.pricing?.baseAdultsCharge}/night</span>
                </div>
              </div>

              {/* Booking Info */}
              {roomStatus.booking && (
                <div className="bg-white bg-opacity-50 rounded p-2 mb-3 text-sm">
                  <p className="font-medium">{roomStatus.booking.primaryGuest.firstName} {roomStatus.booking.primaryGuest.lastName}</p>
                  <p className="text-xs opacity-75">
                    {new Date(roomStatus.booking.checkIn).toLocaleDateString()} - {new Date(roomStatus.booking.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-xs opacity-75">Booking: {roomStatus.booking.bookingId}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {roomStatus.status === 'available' && (
                  <button
                    onClick={() => onRoomClick(room, 'book')}
                    className="flex-1 bg-[#1035ac] text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Book
                  </button>
                )}
                
                {roomStatus.booking && (
                  <button
                    onClick={() => onRoomClick(room, 'view')}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rooms found matching the current filters.
        </div>
      )}
    </div>
  )
}