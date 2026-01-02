// FeaturedStays2.jsx
"use client"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { getPropertiesByQuery } from '@/redux/features/property/propertySlice';
import { MapPin, ArrowRight } from 'lucide-react'; 
import commingSoon from "../../../public/assets/comming-soon.jpeg"; 

// Helper for dates
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FeaturedStays2 = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Gujarat');
  
  const { searchResults, isLoading } = useSelector((state) => state.property);

  const tabs = ['Gujarat'];

  useEffect(() => {
    const fetchProperties = async () => {
      const current = new Date();
      const today = new Date(current);
      today.setDate(current.getDate() + 1); 
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1); 

      const searchData = {
        location: "Gujarat",
        locationData: "Gujarat",
        checkin: formatDate(today),
        checkout: formatDate(nextDay),
        persons: "2"
      };

      try {
        await dispatch(getPropertiesByQuery(searchData)).unwrap();
      } catch (error) {
        console.error('Failed to fetch featured stays:', error);
      }
    };

    if (activeTab === 'Gujarat') {
      fetchProperties();
    }
  }, [dispatch, activeTab]);
  
  // 1. Handle Loading/Empty states
  // 2. Filter out index 6 specifically
  const displayProperties = (searchResults || [])
    .filter((_, index) => index !== 6); 

  // Helper to safely get location string
  const getLocationString = (property) => {
    // Try address city first
    if (property.address?.city) return property.address.city;
    // If location is a string, use it
    if (typeof property.location === 'string') return property.location;
    // Fallback
    return activeTab;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-2">Featured places to visit</h2>
          <p className="text-lg text-gray-600">Explore the Most Iconic and Breathtaking Destinations</p>
        </div>
        

      </div>

              {/* Tabs */}
        <div className="my-4 md:my-4 flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      
      {isLoading ? (
         <div className="h-72 w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading properties...</p>
            </div>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProperties.slice(0, 8).map((property) => (
            <Link 
              href={`/hotel-details/${property._id}`} 
              key={property._id}
              className="group relative block w-full h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image Layer */}
              <div className="absolute inset-0 bg-gray-200">
                <img 
                  src={property.media?.images?.[0]?.url || commingSoon.src} 
                  alt={property.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Content Layer */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-1 leading-tight line-clamp-1">
                  {property.name}
                </h3>
                
               

                {/* Hidden Details */}
                <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="flex items-center cursor-pointer gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium w-full justify-center transition-colors">
                    View Property <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedStays2;