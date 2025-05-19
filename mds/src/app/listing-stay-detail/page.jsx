// pages/index.js
"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

export default function page() {
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Beach House in Collingwood</title>
        <meta name="description" content="Vacation rental listing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="relative mt-20 mb-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:col-span-3 h-72 md:h-96 bg-gray-200 relative">
              <motion.div 
                className="w-full h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Image
				  src={`http://localhost:5000/uploads/cities/city-new-1746440840214.jpg`}
                  alt="Main view" 
                  layout="fill" 
                  objectFit="cover"
                  className="rounded-tl-xl rounded-bl-xl md:rounded-bl-none"
                />
              </motion.div>
            </div>
            <div className="hidden md:grid grid-rows-2 gap-2">
              {/* <div className="grid grid-cols-2 gap-2">
                <motion.div 
                  className="h-44 bg-gray-200 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image 
				  src={`http://localhost:5000/uploads\cities\city-new-1746440840214.jpg`}
                    alt="Tent interior" 
                    layout="fill" 
                    objectFit="cover"
                    className="rounded-tr-xl"
                  />
                </motion.div>
                <motion.div 
                  className="h-44 bg-gray-200 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image 
				  src={`http://localhost:5000/uploads\cities\city-new-1746440840214.jpg`}
                    alt="Bedroom" 
                    layout="fill" 
                    objectFit="cover"
                  />
                </motion.div>
              </div> */}
              {/* <div className="grid grid-cols-2 gap-2">
                <motion.div 
                  className="h-44 bg-gray-200 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image 
				  src={`http://localhost:5000/uploads\cities\city-new-1746440840214.jpg`}
                    alt="Living room" 
                    layout="fill" 
                    objectFit="cover"
                  />
                </motion.div>
                <motion.div 
                  className="h-44 bg-gray-200 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image 
				  src={`http://localhost:5000/uploads\cities\city-new-1746440840214.jpg`}
                    alt="Bathroom" 
                    layout="fill" 
                    objectFit="cover"
                    className="rounded-br-xl"
                  />
                </motion.div>
              </div> */}
            </div>
            <motion.button 
              className="absolute bottom-8 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md hover:bg-opacity-100 "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPhotoGalleryOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Show all photos
            </motion.button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Listing info */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-4">
                Wooden house
              </div>
              
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Beach House in Collingwood</h1>
                <div className="flex space-x-3">
                  <motion.button 
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="ml-1">Share</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="ml-1">Save</span>
                  </motion.button>
                </div>
              </div>
              
              <div className="flex items-center mt-1 mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium">4.5 (112)</span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="ml-1 text-sm">Tokyo, Jappan</span>
                </div>
              </div>
              
              <div className="flex items-center pt-4 border-t border-gray-200">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
                  {/* <Image 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Host" 
                    layout="fill" 
                    objectFit="cover"
                  /> */}
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Hosted by</p>
                  <p className="font-medium">Kevin Francis</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>6 guests</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <span>6 beds</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>3 baths</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>2 bedrooms</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Stay information</h2>
              <div className="border-t border-gray-200 pt-4">
                {/* Additional content would go here */}
              </div>
            </motion.div>
          </div>
          
          {/* Right column: Booking widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold">$119</span>
                  <span className="text-gray-500">/night</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm">4.5 (112)</span>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Check In - Check Out</p>
                    <p className="font-medium">Feb 06 - Feb 23</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Guests</p>
                    <p className="font-medium">4 Guests</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>$119 x 3 night</span>
                  <span>$357</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Service charge</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between font-bold pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>$199</span>
                </div>
              </div>
              
              <motion.button 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reserve
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Photo Gallery Modal */}
      {isPhotoGalleryOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 p-4 md:p-10 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-medium">All photos</h2>
            <motion.button 
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPhotoGalleryOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {/* Gallery images would go here */}
            {Array(9).fill(0).map((_, i) => (
              <motion.div 
                key={i} 
                className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Image 
				  src={`http://localhost:5000/uploads/cities/city-new-1746440840214.jpg`}
                  alt={`Gallery image ${i+1}`} 
                  layout="fill" 
                  objectFit="cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}