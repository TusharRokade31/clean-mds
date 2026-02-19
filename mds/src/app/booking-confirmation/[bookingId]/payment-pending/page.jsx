'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { checkPaymentStatus } from '@/redux/features/payments/paymentSlice';

const MAX_ATTEMPTS = 6;
const POLL_INTERVAL = 5000; // 5 seconds

export default function PaymentPendingPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { isVerifying, currentPayment } = useSelector((state) => state.payment);

  const merchantTransactionId = searchParams.get('merchantTransactionId');
  const [attempts, setAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Checking your payment status...');

  useEffect(() => {
    if (!merchantTransactionId || attempts >= MAX_ATTEMPTS) {
      if (attempts >= MAX_ATTEMPTS) {
        setStatusMessage('Payment verification timed out. Please check your booking.');
      }
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await dispatch(
          checkPaymentStatus(merchantTransactionId)
        ).unwrap();

        const code = result?.code;

        if (code === 'PAYMENT_SUCCESS') {
          router.replace(
            `/booking-confirmation/${bookingId}/payment-success?transactionId=${result?.data?.transactionId}`
          );
        } else if (code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED') {
          router.replace(
            `/booking-confirmation/${bookingId}/payment-failed?reason=${encodeURIComponent(result?.message || 'Payment failed')}`
          );
        } else {
          // Still pending, increment and try again
          setAttempts((prev) => prev + 1);
          setStatusMessage(`Still processing... (attempt ${attempts + 1}/${MAX_ATTEMPTS})`);
        }
      } catch (err) {
        setAttempts((prev) => prev + 1);
        setStatusMessage('Error checking status, retrying...');
      }
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [merchantTransactionId, attempts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {/* Pending Icon */}
        <div className="flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6">
          {isVerifying || attempts < MAX_ATTEMPTS ? (
            <svg className="w-10 h-10 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending</h1>
        <p className="text-gray-500 mb-4">{statusMessage}</p>

        {/* Progress dots */}
        {attempts < MAX_ATTEMPTS && (
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < attempts ? 'bg-yellow-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {attempts >= MAX_ATTEMPTS && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              We couldn't confirm your payment automatically. Please check your booking or contact support.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/booking-confirmation/${bookingId}`)}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
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