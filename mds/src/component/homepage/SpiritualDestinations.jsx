// SpiritualDestinations.jsx
"use client";
import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeaturedCities,
  fetchFeaturedStates,
} from "@/redux/features/location/locationSlice";
import { useEffect } from "react";
import Link from "next/link";

const SpiritualDestinations = () => {
 

  const scrollRight = () => {
    const container = document.getElementById("spiritual-scroll-container");
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

    const scrollLeft = () => {
    const container = document.getElementById("spiritual-scroll-container");
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const dispatch = useDispatch();
  const { featuredCities, isLoading } =
    useSelector((state) => state.location);

  useEffect(() => {
    dispatch(fetchFeaturedCities(true));
  }, [dispatch]);

  return (
    <section className="max-w-8xl px-4 lg:px-8 py-8 bg-amber-50 rounded-4xl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold md:text-4xl text-center text-gray-900 mb-2">
          Discover Stays in Spiritual Destinations
        </h2>
        <p className="text-lg text-center text-gray-600 mb-8">
          Stay at Divine Destinations in India's Holiest Cities
        </p>

        <div className="relative">
        {isLoading ? (
          <div className="flex justify-center py-10">Loading destinations...</div>
        ) : featuredCities.length === 0 ? (
          <div className="flex justify-center py-10">No featured destinations found</div>
        ) : (<div
          id="spiritual-scroll-container"
          className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4"
        >
          
          {featuredCities.map((destination) => (
            <div
              key={destination._id}
              className="flex-none w-64 sm:w-72 snap-start px-2"
            >
              <div className="rounded-lg overflow-hidden bg-white">
                <div className="relative h-48 w-full">
                  {/* <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  /> */}
                  <Link href={'/coming-soon'}>
                   <Image 
          overrideSrc={`${destination.image || ''}`}
          className="h-full w-full rounded-2xl object-cover"
          alt={destination.name}
          fill
          sizes="(max-width: 400px) 100vw, 300px"
        />
        </Link>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{destination.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {/* {destination.count} */}
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>)}
      <div className="absolute -left-5 top-28 transform -translate-y-1/2">
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
      </div>
    </section>
  );
};

export default SpiritualDestinations;
