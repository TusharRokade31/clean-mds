"use client"
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function myBookingsLayout({ children }) {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className="">
      <nav className="border-b border-[#00000027] px-2 lg:px-36 sm:px-4 lg:container mx-auto pt-28">
        <div className="flex overflow-x-scroll lg:overflow-hidden text-nowrap space-x-8">
          <div className="relative">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/my-bookings/upcoming-bookings') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/my-bookings/upcoming-bookings"
                className="py-2 block"
              >
                Upcoming Bookings
              </Link>
            </motion.div>
          </div>

         

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/my-bookings/cancelled-bookings') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/my-bookings/cancelled-bookings"
                className="py-2 block"
              >
                Cancelled Bookings
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/my-bookings/completed-bookings') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/my-bookings/completed-bookings"
                className="py-2 block"
              >
                Completed Bookings
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="w-full min-h-screen px-2 bg-gray-50 lg:px-36 sm:px-4 lg:container mx-auto py-4">
        { children }
      </div>
    </div>
  );
}