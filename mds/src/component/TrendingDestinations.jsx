// TrendingDestinations.jsx
"use client"
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedCities } from '@/redux/features/location/locationSlice';
import { useEffect } from 'react';
import Link from 'next/link';

const TrendingDestinations = () => {


  const scrollRight = () => {
    const container = document.getElementById("trending-scroll-container");
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

    const scrollLeft = () => {
    const container = document.getElementById("trending-scroll-container");
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };


  
  const dispatch = useDispatch();
  const { nonFeaturedCities, isLoading } = useSelector((state) => state.location);

  useEffect(() => {
    dispatch(fetchFeaturedCities(false));
  }, [dispatch]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold md:text-4xl text-gray-900 mb-2">Trending Destinations</h2>
      <p className="text-lg text-gray-600 mb-6">Top Sacred Destinations Loved by Devotees</p>
      
      <div className="relative">
      {isLoading ? (
          <div className="flex justify-center py-10">Loading destinations...</div>
        ) : nonFeaturedCities.length === 0 ? (
          <div className="flex justify-center py-10">No featured destinations found</div>
        ) : (
          <div 
          id="trending-scroll-container"
          className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4"
        >
          {nonFeaturedCities.map((destination) => (
            <div 
              key={destination._id} 
              className="flex-none w-64 sm:w-72 md:w-80 snap-start px-2"
            >
              <div className="rounded-lg overflow-hidden bg-white">
                <div className="relative h-48 w-full">
                  {/* <Image 
                    src={`http://localhost:5000/${destination.image || ''}`}
                    alt={destination.name}
                    fill
                    // className="object-cover"
                    className="h-full w-full rounded-2xl object-cover"
                  /> */}
                  {/* {console.log(`http://localhost:5000/${destination.image}`)} */}
                      <Link href={'/coming-soon'}>
                        <Image 
                            overrideSrc={`https://mds-backend-bweu.onrender.com//${destination.image || ''}`}
                            className="h-full w-full rounded-2xl object-cover"
                            alt={destination.name}
                            fill
                            sizes="(max-width: 400px) 100vw, 300px"
                          />
                      </Link>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{destination.name}</h3>
                  {/* <p className="text-gray-500 text-sm">{destination.status}</p> */}
                  coming soon
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        
        <div className="absolute -left-3 top-26 transform -translate-y-1/2">
          <button
              onClick={scrollLeft}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          
          <div className="absolute -right-5 top-28 transform -translate-y-1/2">
            <button
              onClick={scrollRight}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations;