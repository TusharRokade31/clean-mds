// Congratulations.jsx
"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Congratulations = ({ propertyData }) => {
  const router = useRouter();
  
  // Navigate to property management/dashboard
  const goToDashboard = () => {
    router.push('/host/properties');
  };
  
  // Navigate to edit this property
  const editProperty = () => {
    router.push(`/host/properties/${propertyData._id}/edit`);
  };
  
  // Format price
  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Congratulations <span className="text-2xl">🎉</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Excellent, congratulations on completing the listing, it is waiting to be reviewed for publication
          </p>
        </div>
        
        <hr className="my-6" />
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">This is your listing</h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              {/* Property Image with carousel indicators */}
              <div className="relative aspect-[4/3] bg-gray-200">
                {propertyData.images?.cover ? (
                  <img 
                    // src={typeof propertyData.images.cover === 'string' ? propertyData.images.cover : URL.createObjectURL(propertyData.images.cover)}
                    src={`http://localhost:5000/${propertyData.images?.cover || ''}`}

                    alt={propertyData.placeName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                
                {/* Discount badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    -10% today
                  </span>
                </div>
                
                {/* Favorite button */}
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md">
                  <FaHeart className="text-gray-400 hover:text-red-500" />
                </button>
                
                {/* Carousel indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                  <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
                  <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
                  <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
                </div>
              </div>
              
              {/* Property details */}
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-1">
                  {propertyData.rentalForm} · {propertyData.size?.beds || 0} beds
                </div>
                
                <h3 className="font-semibold text-lg">{propertyData.placeName}</h3>
                
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>
                    {propertyData.location?.street || '1 Anzinger Court'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <span className="font-bold text-lg">{formatPrice(propertyData.pricing?.weekdayPrice || 26)}</span>
                  <span className="text-gray-600">/night</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={goToDashboard}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
          >
            Go to My Properties
          </button>
          
          <button
            onClick={editProperty}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center"
          >
            Edit Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;