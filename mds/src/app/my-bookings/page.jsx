"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyBookingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to upcoming bookings by default
    router.replace('/my-bookings/upcoming-bookings');
  }, [router]);

  return <div>Loading...</div>;
}