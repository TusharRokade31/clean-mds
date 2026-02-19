// payment-failed/page.jsx
'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function PaymentFailedPage() {
  const { bookingId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { error } = useSelector((state) => state.payment);
  const reason = searchParams.get('reason') || error || 'Payment was not completed.';

  const handleTryAgain = () => {
    // ✅ Read original search params stored before booking was created
    const lastSearchQuery = JSON.parse(localStorage.getItem('lastSearchQuery') || '{}')
    const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || '{}')

    if (currentBooking?.property && currentBooking?.room && lastSearchQuery?.checkin) {
      // ✅ Go back to fresh booking page — old draft booking is cancelled on backend
      router.push(
        `/booking/${currentBooking.property}` +
        `?room=${currentBooking.room}` +
        `&checkIn=${lastSearchQuery.checkin}` +
        `&checkOut=${lastSearchQuery.checkout}` +
        `&adults=${currentBooking.guestCount?.adults ?? 2}` +
        `&children=${currentBooking.guestCount?.children ?? 0}`
      )
    } else {
      router.push('/') // fallback
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Don't worry, no amount has been deducted.</p>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reason</p>
          <p className="text-sm text-red-600">{decodeURIComponent(reason)}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Try Again
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
