"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
// Import the cancel action from your slice

import BookingInvoice from '../onlinebooking/BookingInvoice';
import { cancelBooking } from '@/redux/features/bookings/bookingSlice';

export default function BookingCard({ booking }) {
  const dispatch = useDispatch();
  // Access the updating state from your booking slice
  const { isUpdating } = useSelector((state) => state.booking);
  
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  /**
   * Calculates the refund eligibility based on user requirements:
   * > 3 days: 90% | 3 days: 50% | < 24h: 0%
   */
  const getRefundPolicyInfo = (checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return { 
        percent: "90%", 
        text: "Cancelling more than 3 days before check-in: 90% refund." 
      };
    } else if (diffDays <= 3 && diffDays >= 1) {
      return { 
        percent: "50%", 
        text: "Cancelling 3 days before check-in: 50% refund." 
      };
    } else {
      return { 
        percent: "0%", 
        text: "Cancelling within 24 hours of check-in: 0% refund." 
      };
    }
  };

  const handleCancelAction = async () => {
    const policy = getRefundPolicyInfo(booking.checkIn);
    
    const cancellationData = {
      reason: "User initiated cancellation",
      refundPercentage: policy.percent,
      cancelledAt: new Date().toISOString()
    };

    try {
      // Calls the API through the Redux Thunk
      await dispatch(cancelBooking({ id: booking._id, cancellationData })).unwrap();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Cancellation failed:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradientColor = (status) => {
    switch (status) {
      case 'confirmed': return 'from-green-400 to-blue-500';
      case 'pending': return 'from-orange-400 to-yellow-500';
      case 'cancelled': return 'from-red-400 to-pink-500';
      case 'completed': return 'from-blue-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };
  
  console.log(booking)

  const getPropertyImage = () => {
    if (booking.property.media?.images && booking.property.media.images.length > 0) {
      return `${booking.property.media.images[0].url}`;
    }
    return null;
  };

  const propertyImage = getPropertyImage();
  const checkInFormatted = formatDate(booking.checkIn);
  const checkOutFormatted = formatDate(booking.checkOut);
  const daysToGo = getDaysToGo(booking.checkIn);
  const currentPolicy = getRefundPolicyInfo(booking.checkIn);

  if (!booking || !booking.property) {
    return (
      <div className="animate-pulse bg-gray-100 h-64 rounded-lg mb-6 flex items-center justify-center">
        <p className="text-gray-400">Loading booking details...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side - Property Image */}
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
              </div>
            </div>
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${getGradientColor(booking.status)} p-6 flex flex-col justify-between relative`}>
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} bg-white/90`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Booking details */}
        <div className="flex-3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{booking.property.placeName}</h3>
              <p className="text-gray-600 text-sm">
                {booking.property.location.city}, {booking.property.location.state}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹{booking.pricing.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Paid</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-in:</div>
              <div className="font-semibold">{checkInFormatted.month} {checkInFormatted.date}, {checkInFormatted.year}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-out:</div>
              <div className="font-semibold">{checkOutFormatted.month} {checkOutFormatted.date}, {checkOutFormatted.year}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
             {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <motion.button
              onClick={() => setShowInvoice(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              📄 View Invoice
            </motion.button>  )}
            
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <motion.button
                onClick={() => setShowCancelConfirm(!showCancelConfirm)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {showCancelConfirm ? 'Close' : 'Cancel Booking'}
              </motion.button>
            )}
            
            <motion.button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              💬 Contact Support
            </motion.button>
          </div>

          {/* Cancellation Terms & Confirmation Logic */}
          <AnimatePresence>
            {showCancelConfirm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg overflow-hidden"
              >
                <h4 className="font-bold text-red-800 mb-2">Cancellation Terms</h4>
                <ul className="text-sm text-red-700 space-y-1 mb-4">
                  <li>• Cancelling more than 3 days before check-in: <strong>90% refund</strong>.</li>
                  <li>• Cancelling 3 days before check-in: <strong>50% refund</strong>.</li>
                  <li>• Cancelling within 24 hours of check-in: <strong>0% refund</strong>.</li>
                </ul>
                <div className="p-3 bg-white rounded border border-red-100 mb-4">
                  <p className="text-sm font-medium text-gray-800">
                    Your Status: <span className="text-red-600 font-bold">{currentPolicy.percent} Refund</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{currentPolicy.text}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={isUpdating}
                    onClick={handleCancelAction}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold disabled:bg-gray-400"
                  >
                    {isUpdating ? "Processing..." : "Confirm Cancellation"}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium"
                  >
                    Go Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show More Details'}
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <p><span className="text-gray-500">Primary Guest:</span> {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <p><span className="text-gray-500">Status:</span> {booking.payment.status}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showInvoice && (
        <BookingInvoice 
          booking={booking} 
          onClose={() => setShowInvoice(false)} 
        />
      )}
    </motion.div>
  );
}