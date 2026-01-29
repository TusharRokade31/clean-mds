"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BookingInvoice from '../onlinebooking/BookingInvoice';

export default function BookingCard({ booking }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const getDaysToGo = (checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradientColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'from-green-400 to-blue-500';
      case 'pending':
        return 'from-orange-400 to-yellow-500';
      case 'cancelled':
        return 'from-red-400 to-pink-500';
      case 'completed':
        return 'from-blue-400 to-purple-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

// Update the getPropertyImage function in your component
const getPropertyImage = () => {
  // Check for first image in images array
  if (booking.property.media?.images && booking.property.media.images.length > 0) {
    return `${booking.property.media.images[0].url}`;
  }
  
  return null;
};

console.log(booking.property.media)

  const propertyImage = getPropertyImage();
  const checkInFormatted = formatDate(booking.checkIn);
  const checkOutFormatted = formatDate(booking.checkOut);
  const daysToGo = getDaysToGo(booking.checkIn);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side - Property Image or Gradient fallback */}
        <div className="flex-2 md:w-64 w-full h-48 md:h-auto relative">
          {propertyImage && !imageError ? (
            <div className="relative w-full h-full">
              <Image
                src={propertyImage}
                alt={booking.property.placeName}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, 256px"
              />
              
              {/* Overlay with status and days to go */}
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} bg-white/90`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {daysToGo > 0 && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      {daysToGo} days to go
                    </span>
                  )}
                </div>

                {/* Property type icon overlay */}
                {/* <div className="flex justify-center items-center flex-1">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    {booking.property.propertyType.includes('Dharamshala') ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5L18.5 12H17v6H7v-6H5.5L12 5.5z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                      </svg>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
          ) : (
            // Fallback to gradient if no image or image failed to load
            <div className={`w-full h-full bg-linear-to-br ${getGradientColor(booking.status)} p-6 flex flex-col justify-between relative`}>
              {/* Status badge */}
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} bg-white/90`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                {daysToGo > 0 && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {daysToGo} days to go
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className="flex justify-center items-center flex-1">
                {booking.property.propertyType.includes('Dharamshala') ? (
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5L18.5 12H17v6H7v-6H5.5L12 5.5z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Booking details */}
        <div className="flex-3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {booking.property.placeName}
              </h3>
              <p className="text-gray-600 text-sm">
                {booking.property.location.houseName && `${booking.property.location.houseName}, `}
                {booking.property.location.city}, {booking.property.location.state}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Room for {booking.guestCount.adults} Adult{booking.guestCount.adults > 1 ? 's' : ''}
                {booking.guestCount.children > 0 && ` • ${booking.guestCount.children} Child${booking.guestCount.children > 1 ? 'ren' : ''}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₹{booking.pricing.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Paid</div>
            </div>
          </div>

          {/* Check-in and Check-out info */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-in:</div>
              <div className="font-semibold">
                {checkInFormatted.month} {checkInFormatted.date}, {checkInFormatted.year} ({checkInFormatted.day})
              </div>
              <div className="text-sm text-gray-500">12:00 PM onwards</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-out:</div>
              <div className="font-semibold">
                {checkOutFormatted.month} {checkOutFormatted.date}, {checkOutFormatted.year} ({checkOutFormatted.day})
              </div>
              <div className="text-sm text-gray-500">11:00 AM</div>
            </div>
          </div>

          {/* Booking ID */}
          <div className="mb-6">
            <span className="text-sm text-gray-500">Booking ID: </span>
            <span className="font-mono text-sm text-blue-600">{booking.bookingId}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <motion.button
             onClick={() => setShowInvoice(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              📄 View Invoice
            </motion.button>
            
            {booking.status === 'pending' || booking.status === 'confirmed' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cancel Booking
              </motion.button>
            ) : null}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              💬 Contact Support
            </motion.button>
          </div>

          {/* Toggle details button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show More Details'}
          </button>

          {/* Expandable details section */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <p><span className="text-gray-500">Primary Guest:</span> {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}</p>
                  <p><span className="text-gray-500">Email:</span> {booking.primaryGuest.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {booking.primaryGuest.phone}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <p><span className="text-gray-500">Method:</span> {booking.payment.method.toUpperCase()}</p>
                  <p><span className="text-gray-500">Status:</span> {booking.payment.status}</p>
                  <p><span className="text-gray-500">Paid Amount:</span> ₹{booking.payment.paidAmount}</p>
                  <p><span className="text-gray-500">Pending:</span> ₹{booking.payment.pendingAmount}</p>
                </div>
                {booking.specialRequests && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-gray-700">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
            {showInvoice && (
              <BookingInvoice 
                booking={booking} 
                onClose={() => setShowInvoice(false)} 
              />
            )}
    </motion.div>

    
  );
}