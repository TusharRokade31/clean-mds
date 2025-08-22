// src/app/my-bookings/upcoming-bookings/page.jsx
"use client"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSelfBookings } from '../../../redux/features/bookings/bookingSlice';
import BookingCard from '@/component/mybookings/BookingCard';


export default function UpcomingBookingsPage() {
  const dispatch = useDispatch();
  const { 
    selfFilters,
    selfBookings, 
    isSelfLoading, 
    selfError 
  } = useSelector(state => state.booking);

  useEffect(() => {
     dispatch(fetchSelfBookings({ 
      ...selfFilters, 
      status: 'confirmed' 
    }));
  }, [dispatch]);

  // Filter by status for upcoming bookings
  const upcomingBookings = selfBookings.filter(booking => 
    ['confirmed', 'pending', 'checked-in'].includes(booking.status)
  );

  if (isSelfLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selfError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading bookings: {selfError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcomingBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
          <p className="text-gray-500">You don't have any upcoming reservations.</p>
        </div>
      ) : (
        upcomingBookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))
      )}
    </div>
  );
}