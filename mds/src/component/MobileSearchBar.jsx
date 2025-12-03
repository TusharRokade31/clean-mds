"use client"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineAdjustments } from 'react-icons/hi';
import { IoLocationOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { fetchSuggestions, clearSuggestions, getPropertiesByQuery } from '@/redux/features/property/propertySlice';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchComponent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { suggestions, isSuggestionsLoading } = useSelector(state => state.property);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Stay');
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [dateRange, setDateRange] = useState('Feb 06 - Feb 23');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  
  // Date selection states
  const [selectedDates, setSelectedDates] = useState({
    checkin: '',
    checkout: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const tabs = ['Stay', 'Experiences', 'Cars', 'Flights'];
  
  const popularDestinations = [

  ];

  // Helper functions from main SearchBar
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const formatDateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const createDateFromString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isPastDate = (date) => {
    const today = getTodayDate();
    return date < today;
  };

  // Load recent searches from cache
  const loadRecentSearches = () => {
    try {
      const localStorageSearches = localStorage.getItem('recentSearches');
      if (localStorageSearches) {
        const parsedSearches = JSON.parse(localStorageSearches);
        setRecentSearches(parsedSearches);
        return;
      }

      const sessionStorageSearches = sessionStorage.getItem('recentSearches');
      if (sessionStorageSearches) {
        const parsedSearches = JSON.parse(sessionStorageSearches);
        setRecentSearches(parsedSearches);
        return;
      }
    } catch (error) {
      console.error('Error loading recent searches from cache:', error);
      setRecentSearches([]);
    }
  };

  // Save search to cache
  const saveSearchToCache = (searchData) => {
    try {
      const updatedSearches = [searchData, ...recentSearches.filter(search => search.location !== searchData.location)];
      const limitedSearches = updatedSearches.slice(0, 10);
      
      localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
      sessionStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
      
      setRecentSearches(limitedSearches);
    } catch (error) {
      console.error('Error saving search to cache:', error);
    }
  };

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      dispatch(fetchSuggestions(debouncedSearchQuery.trim()));
      setShowSuggestions(true);
      setShowRecentSearches(false);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
      if (step === 0) {
        setShowRecentSearches(true);
      }
    }
  }, [debouncedSearchQuery, dispatch, step]);

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

  const handleOpenSearch = () => {
    setIsOpen(true);
    setStep(0);
    setShowRecentSearches(true);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
    setShowRecentSearches(false);
    setShowSuggestions(false);
    setSearchQuery('');
    setDestination('');
  };

  const handleSearchQueryChange = (value) => {
    setSearchQuery(value);
    setDestination(value);
    setSelectedLocation(null);
    
    if (value.trim().length < 2) {
      setShowSuggestions(false);
      setShowRecentSearches(true);
    }
  };

  const handleSelectDestination = (dest) => {
    if (typeof dest === 'string') {
      // Popular destination selected
      setDestination(dest);
      setSearchQuery(dest);
      setSelectedLocation({ placeName: dest, location: { city: dest, state: '' } });
    }
    setStep(1);
    setShowRecentSearches(false);
    setShowSuggestions(false);
  };

const handleSuggestionClick = (suggestion, type, location = null) => {
  // If placeName is clicked, include city and state
  const displayText = type === 'placeName' 
    ? `${suggestion}, ${location.city}, ${location.state}`
    : suggestion;
    setSearchQuery(displayText);
    setDestination(displayText);
    setSelectedLocation(suggestion);
    setStep(1);
    setShowSuggestions(false);
    setShowRecentSearches(false);
  };

  const handleRecentSearchClick = (searchData) => {
    setSearchQuery(searchData.location);
    setDestination(searchData.location);
    setSelectedLocation(searchData.locationData);
    setSelectedDates({
      checkin: searchData.checkin,
      checkout: searchData.checkout
    });
    setAdults(searchData.adults);
    setChildren(searchData.children);
    setInfants(searchData.infants);
    setShowRecentSearches(false);
    setStep(1);
  };

  const handleDateSelect = (date) => {
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateString = formatDateToLocalString(selectedDate);
    
    if (isPastDate(selectedDate)) {
      return;
    }
    
    if (!selectedDates.checkin || (selectedDates.checkin && selectedDates.checkout)) {
      setSelectedDates({
        checkin: dateString,
        checkout: ''
      });
    } else if (selectedDates.checkin && !selectedDates.checkout) {
      const checkinDate = createDateFromString(selectedDates.checkin);
      if (selectedDate > checkinDate) {
        setSelectedDates({
          ...selectedDates,
          checkout: dateString
        });
      } else {
        setSelectedDates({
          checkin: dateString,
          checkout: ''
        });
      }
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    const today = getTodayDate();
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    
    if (prevMonthDate.getFullYear() < today.getFullYear() || 
        (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() < today.getMonth())) {
      return;
    }
    
    setCurrentMonth(prevMonthDate);
  };

  const renderCalendar = (monthDate) => {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getTodayDate();
    
    const daysFromPrevMonth = firstDay;
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const dayDate = new Date(year, month - 1, prevMonthDays - daysFromPrevMonth + i + 1);
      days.push({
        day: prevMonthDays - daysFromPrevMonth + i + 1,
        isCurrentMonth: false,
        date: dayDate,
        isPast: isPastDate(dayDate)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        day: i,
        isCurrentMonth: true,
        date: dayDate,
        isPast: isPastDate(dayDate)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        day: i,
        isCurrentMonth: false,
        date: dayDate,
        isPast: isPastDate(dayDate)
      });
    }
    
    return days;
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleSearch = () => {
    if (!selectedLocation) {
      alert('Please select a location from the suggestions');
      return;
    }

    if (!selectedDates.checkin || !selectedDates.checkout) {
      alert('Please select check-in and check-out dates');
      return;
    }

    const searchData = {
      location: searchQuery,
      locationData: selectedLocation,
      checkin: selectedDates.checkin,
      checkout: selectedDates.checkout,
      adults: adults,
      children: children,
      infants: infants,
      persons: (adults + children + infants).toString()
    };

    // Save to cache
    saveSearchToCache(searchData);

    // Dispatch search query with location data
    dispatch(getPropertiesByQuery({
      location: selectedLocation,
      checkin: selectedDates.checkin,
      checkout: selectedDates.checkout,
      persons: searchData.persons,
      skip: 0,
      limit: 10,
      locationData: selectedLocation
    }));

    // Navigate to hotel listing page
    router.push('/hotel-listing');
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setDestination('');
    setSearchQuery('');
    setSelectedLocation(null);
    setSelectedDates({ checkin: '', checkout: '' });
    setAdults(2);
    setChildren(1);
    setInfants(1);
  };

  const adjustGuests = (type, action) => {
    if (type === 'adults') {
      if (action === 'increase') {
        setAdults(adults + 1);
      } else if (action === 'decrease' && adults > 1) {
        setAdults(adults - 1);
      }
    } else if (type === 'children') {
      if (action === 'increase') {
        setChildren(children + 1);
      } else if (action === 'decrease' && children > 0) {
        setChildren(children - 1);
      }
    } else if (type === 'infants') {
      if (action === 'increase') {
        setInfants(infants + 1);
      } else if (action === 'decrease' && infants > 0) {
        setInfants(infants - 1);
      }
    }
  };

  const totalGuests = adults + children + infants;

  return (
    <div className="relative w-full lg:hidden mx-auto">
      {/* Search Input Trigger */}
      <div 
        onClick={handleOpenSearch}
        className="flex items-center mx-2 md:mx-4 rounded-full bg-white border border-[#00000025] shadow-md p-1 sm:p-2 cursor-pointer"
      >
        <FiSearch className="ml-2 text-gray-600" />
        <div className="ml-4 sm:py-0 py-2 text-left">
          <div className="font-medium text-black">Where to?</div>
          <div className="text-sm hidden sm:block text-gray-500">Anywhere • Any week • Add guests</div>
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
                        value={searchQuery}
                        onChange={(e) => handleSearchQueryChange(e.target.value)}
                      />
                    </div>

                    {/* Recent Searches */}
                    {showRecentSearches && !showSuggestions && (
                      <div className="mb-6">
                        <h3 className="font-bold mb-3">Recent searches</h3>
                        {recentSearches.length > 0 ? (
                          <div className="space-y-2">
                            {recentSearches.map((search, index) => (
                              <div 
                                key={index} 
                                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                                onClick={() => handleRecentSearchClick(search)}
                              >
                                <FiClock className="text-gray-400 mr-3" />
                                <div>
                                  <div className="font-medium">{search.location}</div>
                                  <div className="text-sm text-gray-500">
                                    {search.checkin} - {search.checkout} • {search.persons} guests
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-4">
                            No recent searches
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggestions */}
                    {showSuggestions && (
                      <div className="mb-6">
                        <h3 className="font-bold mb-3">Suggestions</h3>
                        {isSuggestionsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="space-y-2">
                            {suggestions.slice(0, 5).map((suggestion, index) => (
                              <div key={index}>
                              
                               <div 
                                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                                onClick={() => handleSuggestionClick(suggestion.city)}
                              >
                                <IoLocationOutline className="text-gray-500 mr-3" />
                                <div>
                                  <div className="font-medium">{suggestion.city}</div>
                                  <div className="text-sm text-gray-500">
                                    {suggestion.city}
                                  </div>
                                </div>
                              </div>
                              <div 
                                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                                onClick={() => handleSuggestionClick(suggestion.state)}
                              >
                                <IoLocationOutline className="text-gray-500 mr-3" />
                                <div>
                                  <div className="font-medium">{suggestion.state}</div>
                                  <div className="text-sm text-gray-500">
                                    {suggestion.state}
                                  </div>
                                </div>
                              </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-4">
                            No suggestions found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Popular Destinations */}
                    {!showSuggestions && (
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
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="mb-4 bg-gray-100 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Where</div>
                      <div>{destination}</div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">When's your trip?</h2>
                    
                    {/* Calendar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <button 
                          onClick={prevMonth} 
                          className="p-2 rounded-full hover:bg-gray-100"
                          disabled={currentMonth.getMonth() === getTodayDate().getMonth() && currentMonth.getFullYear() === getTodayDate().getFullYear()}
                        >
                          <FiChevronLeft className="text-gray-600" />
                        </button>
                        <div className="text-lg font-semibold">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                          <FiChevronRight className="text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-center text-sm text-gray-500 p-2">{day}</div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar(currentMonth).map((day, index) => {
                          const dateStr = formatDateToLocalString(day.date);
                          const isCheckin = selectedDates.checkin === dateStr;
                          const isCheckout = selectedDates.checkout === dateStr;
                          const isInRange = selectedDates.checkin && selectedDates.checkout && 
                            day.date > createDateFromString(selectedDates.checkin) && 
                            day.date < createDateFromString(selectedDates.checkout);
                          const isToday = formatDateToLocalString(day.date) === formatDateToLocalString(getTodayDate());
                          
                          return (
                            <div 
                              key={index} 
                              className={`aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer
                                ${day.isCurrentMonth && !day.isPast ? 'hover:bg-gray-100' : ''}
                                ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                                ${!day.isCurrentMonth && !day.isPast ? 'text-gray-400 hover:bg-gray-100' : ''}
                                ${!day.isCurrentMonth && day.isPast ? 'text-gray-200 cursor-not-allowed' : ''}
                                ${isCheckin || isCheckout ? 'bg-indigo-600 text-white' : ''}
                                ${isInRange ? 'bg-indigo-100' : ''}
                                ${isToday && !isCheckin && !isCheckout ? 'bg-gray-200 font-bold' : ''}
                              `}
                              onClick={() => !day.isPast && handleDateSelect(day.date)}
                            >
                              {day.day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Selected dates display */}
                    <div className="mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2 text-sm">
                        {selectedDates.checkin && selectedDates.checkout ? (
                          <span>
                            Check-in: {createDateFromString(selectedDates.checkin).toLocaleDateString()} - 
                            Check-out: {createDateFromString(selectedDates.checkout).toLocaleDateString()}
                          </span>
                        ) : selectedDates.checkin ? (
                          <span>Check-in: {createDateFromString(selectedDates.checkin).toLocaleDateString()} (Select check-out date)</span>
                        ) : (
                          <span>Select your dates</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <button 
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg font-medium disabled:opacity-50"
                        disabled={!selectedDates.checkin || !selectedDates.checkout}
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
                      <div>
                        {selectedDates.checkin && selectedDates.checkout 
                          ? `${createDateFromString(selectedDates.checkin).toLocaleDateString()} - ${createDateFromString(selectedDates.checkout).toLocaleDateString()}`
                          : dateRange
                        }
                      </div>
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
                            onClick={() => adjustGuests('adults', 'decrease')}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                            disabled={adults <= 1}
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{adults}</span>
                          <button 
                            onClick={() => adjustGuests('adults', 'increase')}
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
                            onClick={() => adjustGuests('children', 'decrease')}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                            disabled={children <= 0}
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{children}</span>
                          <button 
                            onClick={() => adjustGuests('children', 'increase')}
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
                            onClick={() => adjustGuests('infants', 'decrease')}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center"
                            disabled={infants <= 0}
                          >
                            -
                          </button>
                          <span className="w-5 text-center">{infants}</span>
                          <button 
                            onClick={() => adjustGuests('infants', 'increase')}
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
                  onClick={step === 2 ? handleSearch : () => {}}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center font-medium"
                >
                  <FiSearch className="mr-2" />
                  {step === 2 ? 'Search' : `${totalGuests} Guests`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}