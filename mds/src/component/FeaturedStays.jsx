// FeaturedStays.jsx
"use client"
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import commingSoon from "../../public/assets/comming-soon.jpeg"
import Ayodhya from "../../public/featured-places/Ayodhya.png"
import Chitrakoot from "../../public/featured-places/Chitrakoot.png"
import Gorakhpur from "../../public/featured-places/Gorakhpur.png"
import Kushinagar from "../../public/featured-places/Kushinagar.png"
import Kutch from "../../public/featured-places/Kutch.png"
import Mathura from "../../public/featured-places/Mathura.png"
import Prayagraj from "../../public/featured-places/Prayagraj.png"
import Trimbakeshwar from "../../public/featured-places/Trimbakeshwar.png"
import Varanasi from "../../public/featured-places/Varanasi.png"
import Vrindavan from "../../public/featured-places/Vrindavan.png"
import Link from 'next/link';

const FeaturedStays = () => {
  const [activeTab, setActiveTab] = useState('Uttar Pradesh');
  const [favorites, setFavorites] = useState([]);
  
  const tabs = ['Uttar Pradesh', 'Gujarat', 'Punjab', 'Uttarakhand'];
  
  // Define images for each tab
  const tabImages = {
    'Uttar Pradesh': [
      // Add your Uttar Pradesh images here
      Ayodhya.src,
      Chitrakoot.src,
      Gorakhpur.src,
      Kushinagar.src,
      Kutch.src,
      Mathura.src,
      Prayagraj.src,
      Trimbakeshwar.src,
      Varanasi.src,
      Vrindavan.src,
    ],
    'Gujarat': [
      // Add your Gujarat images here
      '/assets/gujarat-1.jpg',
      '/assets/gujarat-2.jpg',
      '/assets/gujarat-3.jpg',
      '/assets/gujarat-4.jpg',
      '/assets/gujarat-5.jpg',
      '/assets/gujarat-6.jpg',
      '/assets/gujarat-7.jpg',
      '/assets/gujarat-8.jpg',
    ],
    'Punjab': [
      // Add your Punjab images here
      '/assets/punjab-1.jpg',
      '/assets/punjab-2.jpg',
      '/assets/punjab-3.jpg',
      '/assets/punjab-4.jpg',
      '/assets/punjab-5.jpg',
      '/assets/punjab-6.jpg',
      '/assets/punjab-7.jpg',
      '/assets/punjab-8.jpg',
    ],
    'Uttarakhand': [
      // Add your Uttarakhand images here
      '/assets/uttarakhand-1.jpg',
      '/assets/uttarakhand-2.jpg',
      '/assets/uttarakhand-3.jpg',
      '/assets/uttarakhand-4.jpg',
      '/assets/uttarakhand-5.jpg',
      '/assets/uttarakhand-6.jpg',
      '/assets/uttarakhand-7.jpg',
      '/assets/uttarakhand-8.jpg',
    ],
  };

  // Define titles/names for each location
  const tabTitles = {
    'Uttar Pradesh': [
      'Ayodhya',
      'Chitrakoot',
'Gorakhpur',
'Kushinagar',
'Kutch',
'Mathura',
'Prayagraj',
'Trimbakeshwar',
'Varanasi',
'Vrindavan',
      
    ],
    'Gujarat': [
      'Rann of Kutch',
      'Somnath Temple',
      'Gir National Park',
      'Dwarka',
      'Statue of Unity',
      'Ahmedabad',
      'Palitana',
      'Saputara',
    ],
    'Punjab': [
      'Golden Temple',
      'Jallianwala Bagh',
      'Wagah Border',
      'Anandpur Sahib',
      'Chandigarh',
      'Patiala',
      'Ludhiana',
      'Bathinda',
    ],
    'Uttarakhand': [
      'Kedarnath',
      'Badrinath',
      'Rishikesh',
      'Haridwar',
      'Nainital',
      'Mussoorie',
      'Jim Corbett',
      'Valley of Flowers',
    ],
  };
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(item => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  return (
    <section className="max-w-7xl mx-auto px-3 lg:px-6 py-8">
      <h2 className="text-3xl font-semibold md:text-4xl text-gray-900 mb-2">Featured places to visit</h2>
      <p className="text-lg text-gray-600 mb-6">Explore the Most Iconic and Breathtaking Destinations Across the Country</p>
      
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
          <div key={`${activeTab}-${index}`} className="rounded-lg overflow-hidden bg-white">
            <div className="relative h-60 w-full bg-gray-200">
              <div className="absolute right-2 top-2 z-10">
                <button 
                  onClick={() => toggleFavorite(`${activeTab}-${index}`)}
                  className="p-1.5 bg-white rounded-full shadow-md"
                >
                  {favorites.includes(`${activeTab}-${index}`) ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href={'/coming-soon'}>
                  <img 
                    src={tabImages[activeTab][index] || commingSoon.src} 
                    alt={tabTitles[activeTab][index] || "Featured Stay"} 
                    className="object-cover w-full h-full  transition-transform duration-300" 
                  />
                </Link>
              </div>
            </div>
            <div className="py-10">
              <h3 className="font-medium text-gray-900 mb-1">
                {tabTitles[activeTab][index] || "Coming Soon..."}
              </h3>
              {/* <p className="text-gray-500 text-sm">{activeTab}</p> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedStays;