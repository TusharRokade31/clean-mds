"use client"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { getFeaturedByLocation } from '@/redux/features/property/propertySlice';
import { ArrowRight, MapPin } from 'lucide-react'; 
import commingSoon from "../../../public/assets/comming-soon.jpeg"; 

const FeaturedStaysDynamic = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux
  const { featuredByLocation, isLoading } = useSelector((state) => state.property);

  // States for selection
  const [activeState, setActiveState] = useState('');
  const [activeCity, setActiveCity] = useState('');

  useEffect(() => {
    // Fetch the featured data on mount
    dispatch(getFeaturedByLocation());
  }, [dispatch]);

  // Set default selections once data is loaded
  useEffect(() => {
    if (featuredByLocation?.length > 0 && !activeState) {
      setActiveState(featuredByLocation[0].state);
      setActiveCity(featuredByLocation[0].cities[0].cityName);
    }
  }, [featuredByLocation, activeState]);

  // Helper to get current cities based on selected state
  const currentCities = featuredByLocation?.find(s => s.state === activeState)?.cities || [];
  
  // Helper to get current stays based on selected city
  const currentStays = currentCities?.find(c => c.cityName === activeCity)?.stays || [];

  const handleStateChange = (stateName) => {
    setActiveState(stateName);
    const firstCity = featuredByLocation.find(s => s.state === stateName)?.cities[0];
    setActiveCity(firstCity?.cityName || '');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-2">Featured places to visit</h2>
        <p className="text-lg text-gray-600">Explore iconic destinations curated by location</p>
      </div>

      {/* State Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
        {featuredByLocation?.map((item) => (
          <button
            key={item.state}
            onClick={() => handleStateChange(item.state)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeState === item.state 
              ? 'bg-orange-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.state}
          </button>
        ))}
      </div>

      {/* City Chips (Sub-navigation) */}
      {currentCities.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-left-4">
          {currentCities.map((city) => (
            <button
              key={city.cityName}
              onClick={() => setActiveCity(city.cityName)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeCity === city.cityName
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {city.cityName}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 w-full bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentStays.map((stay) => (
            <Link 
              href={`/hotel-details/${stay.slug}`} 
              key={stay.id}
              className="group relative block w-full h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Layer - Using stay.coverImage if available */}
              <div className="absolute inset-0 bg-gray-200">
                <img 
                  src={stay.coverImage ? `https://your-api-url.com/images/${stay.coverImage}` : commingSoon.src} 
                  alt={stay.placeName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  onError={(e) => { e.target.src = commingSoon.src }}
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="flex items-center gap-1 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <MapPin className="w-3 h-3" />
                  {activeCity}
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight line-clamp-2">
                  {stay.placeName}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-medium text-white/0 group-hover:text-white/100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View details <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {currentStays.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
           <p className="text-gray-500">No featured stays found for this location.</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedStaysDynamic;