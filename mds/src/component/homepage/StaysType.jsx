// StaysType.jsx
"use client"
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { fetchAllStays } from '@/redux/features/location/locationSlice';
import { getPropertiesByQuery, setSearchQuery } from '@/redux/features/property/propertySlice';


const StaysType = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { stays, isLoading } = useSelector((state) => state.location);

  useEffect(() => {
    dispatch(fetchAllStays());
  }, [dispatch]);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStaticSearch = async () => {
    // 1. Calculate Dates
    const current = new Date();
    const today = new Date(current);
    today.setDate(current.getDate() + 1); // Add 1 day for checkin
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1); // Add 1 day for checkout

    // 2. Create the exact payload object you asked for
    const searchData = {
      location: "Gujarat",
      locationData: "Gujarat",
      checkin: formatDate(today),      // e.g. "2026-01-02"
      checkout: formatDate(nextDay),   // e.g. "2026-01-03"
      // adults: 2,
      // children: 0,
      // infants: 0,
      persons: "2"
    };

    console.log("Dispatching Static Search:", searchData);

    try {
          
          const currentSearchParams = {
              location: "Gujarat",
              locationData: "Gujarat",
              checkin: formatDate(today),      // e.g. "2026-01-02"
              checkout: formatDate(nextDay),   // e.g. "2026-01-03"
              adults: 2,
              children: 0,
              infants: 0,
              persons: "2"
          };
          
          // Update Redux state first
          dispatch(setSearchQuery(currentSearchParams));
      // 3. Dispatch the action
      await dispatch(getPropertiesByQuery(searchData)).unwrap();
      
      // 4. Navigate to listing
      router.push('/hotel-listing');
    } catch (error) {
      console.error('Static search failed:', error);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold md:text-4xl text-gray-900 mb-2">Explore by types of stays</h2>
      <p className="text-lg text-gray-600 mb-6">Explore houses based on 4 types of stays</p>
      
      <div className="relative">
      {isLoading ? (
          <div className="flex justify-center py-10">Loading destinations...</div>
        ) : stays.length === 0 ? (
          <div className="flex justify-center py-10">No featured destinations found</div>
        ) : (
          <div 
          id="stays-scroll-container"
          className="flex overflow-x-auto xl:overflow-visible scrollbar-none snap-x snap-mandatory scroll-smooth pb-4"
        >
          {stays.slice(0,1).map((destination) => (
            <div 
              key={destination._id} 
              className="flex-none w-64 sm:w-72 md:w-80 snap-start px-2"
            >
              <div className="rounded-lg overflow-hidden bg-white">
                {/* Clickable Container */}
                <div 
                  onClick={handleStaticSearch}
                  className="relative h-48 w-full cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <Image 
                    overrideSrc={`${destination.image || ''}`}
                    className="h-full w-full rounded-2xl object-cover"
                    alt={destination.name}
                    fill
                    sizes="(max-width: 400px) 100vw, 300px"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{destination.name}</h3>
                  {/* <button 
                    onClick={handleStaticSearch}
                    className="text-sm text-gray-500 hover:text-blue-600 text-left mt-1"
                  >
                    Click to search Gujarat
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default StaysType;