"use client"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // For navigation
import { getFeaturedByLocation, getPropertiesByQuery } from '@/redux/features/property/propertySlice';
import { ArrowRight } from 'lucide-react';

// Static Image Imports
import commingSoon from "../../../public/assets/comming-soon.jpeg";
import Ayodhya from "../../../public/featured-places/Ayodhya.png";
import Khatoo from "../../../public/featured-places/khatoo.jpg";
import Mumbai from "../../../public/featured-places/mumbai.webp";
import Junagadh from "../../../public/featured-places/junagadh.jpg";
import Dwarka from "../../../public/featured-places/dwarka.png";
import Palitana from "../../../public/featured-places/Palitana.png";
import Somnath from "../../../public/featured-places/Somnath.png";
import Varanasi from "../../../public/featured-places/Varanasi.png";

// Helper function to format dates as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FeaturedCityCards = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { featuredByLocation, isLoading } = useSelector((state) => state.property);
  
  // 1. Define allowed states (filtering out "Draft State")
  const allowedStates = ["Rajasthan", "Gujarat", "Maharashtra"];
  const [activeState, setActiveState] = useState('Gujarat');

  // 2. Map city names to your static imports
  const cityImageMap = {
    "Dwarka": Dwarka.src,
    "Junagadh": Junagadh.src,
    "Mumbai": Mumbai.src,
    "Palitana": Palitana.src,
    "Somnath": Somnath.src,
    "Varanasi": Varanasi.src,
    "Ayodhya": Ayodhya.src,
    "Khatoo": Khatoo.src,
  };

  useEffect(() => {
    dispatch(getFeaturedByLocation());
  }, [dispatch]);

  // 3. Navigation and Search Logic
  const handleSearchNavigation = async (locationName) => {
    const current = new Date();
    const today = new Date(current);
    today.setDate(current.getDate() + 1); // Check-in: Tomorrow
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1); // Check-out: Day after tomorrow

    const searchData = {
      location: locationName,
      locationData: locationName,
      checkin: formatDate(today),
      checkout: formatDate(nextDay),
      persons: "2"
    };

    try {
      // Fetch properties and wait for completion before navigating
      await dispatch(getPropertiesByQuery(searchData)).unwrap();
      router.push('/hotel-listing');
    } catch (error) {
      console.error('Search navigation failed:', error);
    }
  };

  // Get cities for the selected state from the dynamic Redux data
  const currentCities = featuredByLocation?.find(s => s.state === activeState)?.cities || [];

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Places to Visit</h2>
        <p className="text-lg text-gray-600">Explore iconic destinations curated by state</p>
      </div>

      {/* State Tabs: Only showing the 3 specified states */}
      <div className="flex space-x-2 overflow-x-auto pb-6 scrollbar-hide">
        {allowedStates.map((stateName) => (
          <button
            key={stateName}
            onClick={() => setActiveState(stateName)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeState === stateName 
              ? 'bg-gray-900 text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {stateName}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCities.map((city) => (
            <div 
              key={city.cityName} 
              className="group cursor-pointer relative h-72 w-full rounded-2xl overflow-hidden bg-gray-200 shadow-md transition-all duration-300 hover:shadow-xl"
              onClick={() => handleSearchNavigation(city.cityName)} // Triggers search and navigation
            >
              {/* City Card Image */}
              <img 
                src={cityImageMap[city.cityName] || commingSoon.src} 
                alt={city.cityName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-1">{activeState}</p>
                <h3 className="text-2xl font-bold mb-2">{city.cityName}</h3>
                
                <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Explore Stays <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedCityCards;