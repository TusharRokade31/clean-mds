// FeaturedStays.jsx
"use client"
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import commingSoon from "../../public/assets/comming-soon.jpeg"

const FeaturedStays = () => {
  const [activeTab, setActiveTab] = useState('Uttar Pradesh');
  const [favorites, setFavorites] = useState([]);
  
  const tabs = ['Uttar Pradesh', 'Gujarat', 'Punjab', 'Uttarakhand'];
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(item => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  return (
    <section className="max-w-7xl mx-auto px-3 lg:px-6 py-8">
      <h2 className="text-3xl font-semibold md:text-4xl text-gray-900 mb-2">Featured places to stay</h2>
      <p className="text-lg text-gray-600 mb-6">Chosen with Care to Make Your Spiritual Stay Worry-Free</p>
      
      <div className="mb-6 flex flex-wrap">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="ml-auto mt-2 sm:mt-0">
          <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
            View all
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-lg overflow-hidden  bg-white">
          <div className="relative h-60 w-full bg-gray-200">
            <div className="absolute right-2 top-2 z-2">
              <button 
                onClick={() => toggleFavorite(index)}
                className="p-1.5 bg-white rounded-full shadow-md"
              >
                {favorites.includes(index) ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Replace this with your image */}
              <img src={commingSoon.src} alt="Featured Stay" className="object-cover w-full h-full" />
            </div>
          </div>
          <div className="p-2">
            <p className="text-gray-500 text-sm">Coming Soon...</p>
          </div>
        </div>
          // 
        ))}
      </div>
    </section>
  );
};

export default FeaturedStays;