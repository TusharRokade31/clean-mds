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
import Varanasi from "../../public/featured-places/Varanasi.png"
import Vrindavan from "../../public/featured-places/Vrindavan.png"
import Somnath from "../../public/featured-places/Somnath.png"
import Dwarka from "../../public/featured-places/dwarka.png"
import Akshardham from "../../public/featured-places/Akshardham.png"
import Girnar from "../../public/featured-places/Girnar.png"
import Ambaji from "../../public/featured-places/Ambaji.png"
import Palitana from "../../public/featured-places/Palitana.png"
import Patan from "../../public/featured-places/Patan.png"
import Shirdi from "../../public/featured-places/shirdi.png"
import ElloraCaves from "../../public/featured-places/ellora-caves.png"
import Trimbakeshwar from "../../public/featured-places/Trimbakeshwar.png"
import Pandharpur from "../../public/featured-places/Pandharpur.png"
import Shanishingnapur from "../../public/featured-places/Shanishingnapur.png"
import Mahabaleshwar from "../../public/featured-places/Mahabaleshwar.png"
import Ganpatipule from "../../public/featured-places/Ganpatipule.png"
import Bhimashankar from "../../public/featured-places/Bhimashankar.png"
import Haridwar from "../../public/featured-places/Haridwar.png"
import Rishikesh from "../../public/featured-places/Rishikesh.png"
import Badrinath from "../../public/featured-places/Badrinath.png"
import Kedarnath from "../../public/featured-places/Kedarnath.png"
import Yamunotri from "../../public/featured-places/Yamunotri.png"
import Gangotri from "../../public/featured-places/Gangotri.png"
import NainaDeviTemple from "../../public/featured-places/naina-devi-temple.png"
import Rudranath from "../../public/featured-places/Rudranath.png"

import Link from 'next/link';

const FeaturedStays = () => {
  const [activeTab, setActiveTab] = useState('Uttar Pradesh');
  const [favorites, setFavorites] = useState([]);
  
  const tabs = ['Uttar Pradesh', 'Gujarat', 'Maharashtra', 'Uttarakhand'];
  
  // Define images for each tab
  const tabImages = {
    'Uttar Pradesh': [
      Ayodhya.src,
      Chitrakoot.src,
      Gorakhpur.src,
      Kushinagar.src,
      Mathura.src,
      Prayagraj.src,
      Varanasi.src,
      Vrindavan.src,
    ],
    'Gujarat': [
      Somnath.src,
      Dwarka.src,
      Akshardham.src,
      Girnar.src,
      Ambaji.src,
      Palitana.src,
      Kutch.src,
      Patan.src,
    ],
    'Maharashtra': [
      Shirdi.src,
      ElloraCaves.src,
      Trimbakeshwar.src,
      Pandharpur.src,
      Shanishingnapur.src,
      Mahabaleshwar.src,
      Ganpatipule.src,
      Bhimashankar.src,
    ],
    'Uttarakhand': [
        Haridwar.src,
        Rishikesh.src,
        Badrinath.src,
        Kedarnath.src,
        Yamunotri.src,
        Gangotri.src,
        NainaDeviTemple.src,
        Rudranath.src,
    ],
  };

  // Define titles/names for each location
  const tabTitles = {
    'Uttar Pradesh': [
      'Ayodhya',
      'Chitrakoot',
      'Gorakhpur',
      'Kushinagar',
      'Mathura',
      'Prayagraj',
      'Varanasi',
      'Vrindavan',
    ],
    'Gujarat': [
      'Somnath',
      'Dwarka',
      'Akshardham',
      'Girnar',
      'Ambaji',
      'Palitana',
      'Kutch',
      'Patan',
    ],
    'Maharashtra': [
      'Shirdi',
      'Ellora Caves (Aurangabad)',
      'Trimbakeshwar',
      'Pandharpur',
      'Shanishingnapur',
      'Mahabaleshwar',
      'Ganpatipule',
      'Bhimashankar',
    ],
    'Uttarakhand': [
      'Haridwar',
      'Rishikesh',
      'Badrinath',
      'Kedarnath',
      'Yamunotri',
      'Gangotri',
      'Naina Devi Temple',
      'Rudranath'
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
      </div>
      
      {/* Mobile Slider - 1 image per view */}
      <div className="sm:hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`${activeTab}-${index}`} className="flex-none w-[calc(100vw-2rem)] max-w-sm">
                <div className="rounded-lg overflow-hidden bg-white">
                  <div className="relative h-72 w-full bg-gray-200">
                    {/* <div className="absolute right-2 top-2 z-10">
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
                    </div> */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link href={'/coming-soon'}>
                        <img 
                          src={tabImages[activeTab][index] || commingSoon.src} 
                          alt={tabTitles[activeTab][index] || "Featured Stay"} 
                          className="object-cover w-full h-full transition-transform duration-300" 
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="pt-12 text-center px-2">
                    <h3 className="font-medium text-xl text-gray-900 mb-1">
                      {tabTitles[activeTab][index] || "Coming Soon..."}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet Slider - 2 images per view */}
      <div className="hidden sm:block lg:hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`${activeTab}-${index}`} className="flex-none w-[calc(50%-0.5rem)] min-w-[280px]">
                <div className="rounded-lg overflow-hidden bg-white">
                  <div className="relative h-72 w-full bg-gray-200">
                    {/* <div className="absolute right-2 top-2 z-10">
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
                    </div> */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link href={'/coming-soon'}>
                        <img 
                          src={tabImages[activeTab][index] || commingSoon.src} 
                          alt={tabTitles[activeTab][index] || "Featured Stay"} 
                          className="object-cover w-full h-full transition-transform duration-300" 
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="pt-12  text-center px-2">
                    <h3 className="font-medium text-xl text-gray-900 mb-1">
                      {tabTitles[activeTab][index] || "Coming Soon..."}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`${activeTab}-${index}`} className="rounded-lg overflow-hidden bg-white">
            <div className="relative h-72 w-full bg-gray-200">
              {/* <div className="absolute right-2 top-2 z-10">
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
              </div> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href={'/coming-soon'}>
                  <img 
                    src={tabImages[activeTab][index] || commingSoon.src} 
                    alt={tabTitles[activeTab][index] || "Featured Stay"} 
                    className="object-cover w-full h-full transition-transform duration-300" 
                  />
                </Link>
              </div>
            </div>
            <div className="py-4 text-center">
              <h3 className="font-medium text-xl text-gray-900 mb-1">
                {tabTitles[activeTab][index] || "Coming Soon..."}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedStays;