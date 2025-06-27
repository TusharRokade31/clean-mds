"use client"
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className="">
      <nav className="border-b border-[#00000027] px-2 lg:px-36 sm:px-4 lg:container mx-auto pt-28">
        <div className="flex overflow-x-scroll lg:overflow-hidden text-nowrap space-x-8">
          <div className="relative">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/account') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/account"
                className="py-2 block"
              >
                Account
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/account/savelists') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/account/savelists"
                className="py-2 block"
              >
                Account Savelists
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/account/password') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/account/password"
                className="py-2 block"
              >
                Account Password
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pb-4 ${isActive('/account/billing') ? 'border-b-3 border-blue-500 -mb-[1px]' : ''}`}
            >
              <Link
                href="/account/billing"
                className="py-2 block"
              >
                Payment Methods
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="w-full min-h-screen px-2 bg-gray-50 lg:px-36 sm:px-4 lg:container mx-auto py-4">
        {children}
      </div>
    </div>
  );
}