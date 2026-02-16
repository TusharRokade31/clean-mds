// src/app/payment/verify/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/redux/features/payments/paymentSlice';
import toast from 'react-hot-toast';

export default function PaymentVerifyPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get pending payment from localStorage
        const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}');
        const merchantTransactionId = pendingPayment.merchantTransactionId;

        if (!merchantTransactionId) {
          toast.error('No payment to verify');
          router.push('/');
          return;
        }

        // Check payment status
        const result = await dispatch(checkPaymentStatus(merchantTransactionId)).unwrap();
        
        // Clear pending payment
        localStorage.removeItem('pendingPayment');

        // Get current booking
        const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || '{}');

        if (result.code === 'PAYMENT_SUCCESS') {
          toast.success('Payment successful!');
          router.push(`/bookings/${currentBooking._id}/payment-success?transactionId=${result.data.transactionId}`);
        } else {
          toast.error('Payment failed');
          router.push(`/bookings/${currentBooking._id}/payment-failed?reason=${result.message}`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment');
        router.push('/');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Verifying Payment</h2>
        <p className="text-gray-600 mt-2">Please wait while we confirm your payment...</p>
      </div>
    </div>
  );
}