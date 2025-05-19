"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { HiOutlineAdjustments } from 'react-icons/hi';
import { IoLocationOutline } from 'react-icons/io5';

export default function SearchComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Stay');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState('Feb 06 - Feb 23');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  const tabs = ['Stay', 'Experiences', 'Cars', 'Flights'];
  
  const popularDestinations = [
    'Australia',
    'Canada',
    'Germany',
    'United Kingdom',
    'United Arab Emirates'
  ];

  const handleOpenSearch = () => {
    setIsOpen(true);
    setStep(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
  };

  const handleSelectDestination = (dest) => {
    setDestination(dest);
    setStep(1);
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleSearch = () => {
    console.log('Searching for:', { destination, dateRange, adults, children, infants });
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setDestination('');
    setDateRange('');
    setAdults(0);
    setChildren(0);
    setInfants(0);
  };

  return (
    <div className="relative w-full  lg:hidden mx-auto ">
      {/* Search Input Trigger */}
      <div 
        onClick={handleOpenSearch}
        className="flex items-center mt-2 rounded-full bg-white border  border-[#00000025] shadow-md p-[3px] md:p-2 cursor-pointer"
      >
        <FiSearch className="ml-2 text-gray-600" />
        <div className="ml-4 text-left">
          <div className="font-medium text-black">Where to?</div>
          <div className="text-sm text-gray-500">Anywhere • Any week • Add guests</div>
        </div>
        <div className="ml-auto mr-2">
          <HiOutlineAdjustments className="text-gray-600" />
        </div>
      </div>

      {/* Fullscreen Search Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-white z-60 overflow-auto h-screen"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-4 flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex justify-end mb-4">
                <button onClick={handleClose} className="p-2">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              {/* <div className="flex justify-center mb-6 border-b overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 mx-2 whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-black font-medium' : 'text-gray-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div> */}

              {/* Content based on step */}
              <div className="bg-white rounded-lg p-4 flex-grow overflow-y-auto">
                {step === 0 && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Where to?</h2>
                    <div className="relative mb-6">
                      <FiSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search destinations"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                    <div className="mb-6">
                      <h3 className="font-bold mb-3">Popular destinations</h3>
                      {popularDestinations.map(dest => (
                        <div 
                          key={dest}
                          className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                          onClick={() => handleSelectDestination(dest)}
                        >
                          <IoLocationOutline className="text-gray-500 mr-3" />
                          <span>{dest}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="mb-4 bg-gray-100 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Where</div>
                      <div>{destination}</div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">When's your trip?</h2>
                    
                    {/* Calendar - Show single month on mobile, two months on larger screens */}
                    <div className={`${isMobile ? 'grid-cols-1' : 'grid-cols-2'} grid gap-4 mb-6`}>
                      <div className="p-3">
                        <h3 className="text-center mb-2">February 2023</h3>
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
                            <div key={day} className="text-xs text-gray-500">{day}</div>
                          ))}
                          {Array(28).fill(0).map((_, i) => (
                            <div 
                              key={i} 
                              className={`aspect-square flex items-center justify-center rounded-full text-sm
                                ${i === 7 || i === 24 ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 cursor-pointer'}`}
                            >
                              {i < 3 ? 29 + i : i - 2}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {!isMobile && (
                        <div className="p-3">
                          <h3 className="text-center mb-2">March 2023</h3>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
                              <div key={day} className="text-xs text-gray-500">{day}</div>
                            ))}
                            {Array(31).fill(0).map((_, i) => (
                              <div 
                                key={i} 
                                className="aspect-square flex items-center justify-center rounded-full text-sm hover:bg-gray-100 cursor-pointer"
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Month navigation buttons on mobile */}
                    {isMobile && (
                      <div className="flex justify-between mb-4">
                        <button className="p-2 text-gray-500">
                          &lt; Previous month
                        </button>
                        <button className="p-2 text-gray-500">
                          Next month &gt;
                        </button>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <button 
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mb-4 bg-gray-100 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Where</div>
                      <div>{destination}</div>
                    </div>
                    
                    <div className="mb-4 bg-gray-100 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">When</div>
                      <div>{dateRange}</div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">Who's coming?</h2>
                    
                    <div className="space-y-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-sm text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setAdults(Math.max(0, adults - 1))}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{adults}</span>
                          <button 
                            onClick={() => setAdults(adults + 1)}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-sm text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{children}</span>
                          <button 
                            onClick={() => setChildren(children + 1)}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Infants</div>
                          <div className="text-sm text-gray-500">Ages 0-2</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{infants}</span>
                          <button 
                            onClick={() => setInfants(infants + 1)}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer with Clear and Search buttons */}
              <div className="flex items-center justify-between p-4 border-t sticky bottom-0 bg-white mt-auto">
                <button 
                  onClick={handleClearAll}
                  className="text-sm underline"
                >
                  Clear all
                </button>
                <button 
                  onClick={handleSearch}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center font-medium"
                >
                  <FiSearch className="mr-2" />
                  Search
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}