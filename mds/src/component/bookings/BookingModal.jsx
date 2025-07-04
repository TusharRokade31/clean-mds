// components/bookings/BookingModal.jsx
"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { createBooking } from '@/redux/features/bookings/bookingSlice'

export default function BookingModal({ property, room, onClose }) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    primaryGuest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idType: 'aadhar',
      idNumber: '1234-5678-9012'
    },
    guestCount: {
      adults: 1,
      children: 0
    },
    paymentMethod: 'cash',
    paidAmount: 0
  })
  
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const bookingData = {
      propertyId: property._id,
      roomId: room._id,
      ...formData
    }

    try {
      await dispatch(createBooking(bookingData)).unwrap()
      onClose()
      // Refresh bookings
    } catch (error) {
      console.error('Booking creation failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {room && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">Room {room.number} - {room.type}</p>
            <p className="text-sm text-gray-600">₹{room.pricing?.baseAdultsCharge}/night</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check-in/Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in</label>
              <input
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out</label>
              <input
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Guest Details */}
          <div className="space-y-3">
            <h3 className="font-medium">Guest Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.primaryGuest.firstName}
                onChange={(e) => setFormData({
                  ...formData,
                  primaryGuest: {...formData.primaryGuest, firstName: e.target.value}
                })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.primaryGuest.lastName}
                onChange={(e) => setFormData({
                  ...formData,
                  primaryGuest: {...formData.primaryGuest, lastName: e.target.value}
                })}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.primaryGuest.email}
              onChange={(e) => setFormData({
                ...formData,
                primaryGuest: {...formData.primaryGuest, email: e.target.value}
              })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="tel"
              placeholder="Phone"
              required
              value={formData.primaryGuest.phone}
              onChange={(e) => setFormData({
                ...formData,
                primaryGuest: {...formData.primaryGuest, phone: e.target.value}
              })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Guest Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Adults</label>
              <input
                type="number"
                min="1"
                value={formData.guestCount.adults}
                onChange={(e) => setFormData({
                  ...formData,
                  guestCount: {...formData.guestCount, adults: parseInt(e.target.value)}
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Children</label>
              <input
                type="number"
                min="0"
                value={formData.guestCount.children}
                onChange={(e) => setFormData({
                  ...formData,
                  guestCount: {...formData.guestCount, children: parseInt(e.target.value)}
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium mb-1">Advance Payment</label>
            <input
              type="number"
              min="0"
              value={formData.paidAmount}
              onChange={(e) => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1035ac] text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}