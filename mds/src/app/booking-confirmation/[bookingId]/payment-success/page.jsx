'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { checkPaymentStatus, clearPaymentUrl } from '@/redux/features/payments/paymentSlice';

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { currentPayment, isVerifying } = useSelector((state) => state.payment);

  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Clear payment URL from redux since payment is done
    dispatch(clearPaymentUrl());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        
        {/* Success Icon */}
        <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your booking has been confirmed.</p>

        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-gray-700 break-all">{transactionId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/booking-confirmation/${bookingId}`)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            View Booking
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}