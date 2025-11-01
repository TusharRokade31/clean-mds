"use client"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMapPin, FiCalendar, FiUsers, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';


import { fetchSuggestions, clearSuggestions, getPropertiesByQuery } from '@/redux/features/property/propertySlice';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { suggestions, isSuggestionsLoading } = useSelector(state => state.property);
  
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 1,
    infants: 1
  });
  const [selectedDates, setSelectedDates] = useState({
    checkin: '',
    checkout: ''
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const calendarRef = useRef(null);  // Add this
  const guestsRef = useRef(null);     // Add this
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Helper function to get today's date in local timezone
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Helper function to format date to YYYY-MM-DD string in local timezone
  const formatDateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date from YYYY-MM-DD string in local timezone
  const createDateFromString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Check if a date is in the past
  const isPastDate = (date) => {
    const today = getTodayDate();
    return date < today;
  };

  // Load recent searches from cache on component mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Function to load recent searches from cache
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

  // Function to save a search to cache
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

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      dispatch(fetchSuggestions(debouncedSearchQuery.trim()));
      setShowSuggestions(true);
      setShowRecentSearches(false);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  }, [debouncedSearchQuery, dispatch]);

  // Handle click outside to close suggestions
  useEffect(() => {
  const handleClickOutside = (event) => {
    const isClickInsideAnyDropdown = 
      (suggestionsRef.current && suggestionsRef.current.contains(event.target)) ||
      (calendarRef.current && calendarRef.current.contains(event.target)) ||
      (guestsRef.current && guestsRef.current.contains(event.target)) ||
      (searchInputRef.current && searchInputRef.current.contains(event.target));
    
    if (!isClickInsideAnyDropdown) {
      setShowSuggestions(false);
      setShowRecentSearches(false);
      setShowCalendar(false);
      setShowGuests(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handleLocationFocus = () => {
    setShowCalendar(false);
    setShowGuests(false);
    
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
      setShowRecentSearches(false);
    } else {
      setShowRecentSearches(true);
      setShowSuggestions(false);
    }
  };

  const handleDatesFocus = () => {
    setShowRecentSearches(false);
    setShowCalendar(true);
    setShowGuests(false);
    setShowSuggestions(false);
  };

  const handleGuestsFocus = () => {
    setShowRecentSearches(false);
    setShowCalendar(false);
    setShowGuests(true);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    setShowRecentSearches(false);
    setShowCalendar(false);
    setShowGuests(false);
    setShowSuggestions(false);
  };

const handleSuggestionClick = (suggestion, type, location = null) => {
  // If placeName is clicked, include city and state
  const displayText = type === 'placeName' 
    ? `${suggestion}, ${location.city}, ${location.state}`
    : suggestion;
    setSearchQuery(displayText);
    setSelectedLocation(suggestion);
    
    setShowSuggestions(false);
    setShowRecentSearches(false);
  };

  const handleRecentSearchClick = (searchData) => {
    setSearchQuery(searchData.location);
    setSelectedLocation(searchData.locationData);
    setSelectedDates({
      checkin: searchData.checkin,
      checkout: searchData.checkout
    });
    setGuests({
      adults: searchData.adults,
      children: searchData.children,
      infants: searchData.infants
    });
    setShowRecentSearches(false);
  };

  const handleSearchQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedLocation(null);
    
    if (value.trim().length < 2) {
      setShowSuggestions(false);
      setShowRecentSearches(true);
    }
  };

  const handleDateSelect = (date) => {
    // Create date object from the selected date to avoid timezone issues
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateString = formatDateToLocalString(selectedDate);
    
    // Don't allow selection of past dates
    if (isPastDate(selectedDate)) {
      return;
    }
    
    if (!selectedDates.checkin || (selectedDates.checkin && selectedDates.checkout)) {
      // Set check-in date
      setSelectedDates({
        checkin: dateString,
        checkout: ''
      });
    } else if (selectedDates.checkin && !selectedDates.checkout) {
      // Set check-out date
      const checkinDate = createDateFromString(selectedDates.checkin);
      if (selectedDate > checkinDate) {
        setSelectedDates({
          ...selectedDates,
          checkout: dateString
        });
      } else {
        // If selected date is before check-in, reset and set as new check-in
        setSelectedDates({
          checkin: dateString,
          checkout: ''
        });
      }
    }
  };

  // Handle search button click
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
      adults: guests.adults,
      children: guests.children,
      infants: guests.infants,
      persons: (guests.adults + guests.children + guests.infants).toString()
    };

    // Save to cache
    saveSearchToCache(searchData);

    
console.log(selectedLocation?.placeName, "selected location ")

    // Dispatch search query with location data
    dispatch(getPropertiesByQuery({
      location: selectedLocation,
      checkin: selectedDates.checkin,
      checkout: selectedDates.checkout,
      persons: searchData.persons,
      skip: 1,
      limit: 10,
      locationData: selectedLocation
    }));

    // Navigate to hotel listing page
    router.push('/hotel-listing');
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    const today = getTodayDate();
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    
    // Don't allow going to previous months if it would show only past dates
    if (prevMonthDate.getFullYear() < today.getFullYear() || 
        (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() < today.getMonth())) {
      return;
    }
    
    setCurrentMonth(prevMonthDate);
  };

  const renderCalendar = () => {
    const currentDate = new Date(currentMonth);
    const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    const today = getTodayDate();
    
    const renderMonthCalendar = (date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
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
      
      return {
        monthName: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        days: days
      };
    };
    
    const currentMonthData = renderMonthCalendar(currentDate);
    const nextMonthData = renderMonthCalendar(nextMonthDate);
    
    return (
      <div ref={calendarRef} className="absolute top-22 max-w-5xl left-20 right-0 bg-white rounded-2xl shadow-lg p-6 z-2">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={prevMonth} 
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
          >
            <FiChevronLeft className="text-gray-600" />
          </button>
          <div className="flex-1 flex justify-center text-xl font-semibold">
            {currentMonthData.monthName} {currentMonthData.year}
          </div>
          <div className="flex-1 flex justify-center text-xl font-semibold">
            {nextMonthData.monthName} {nextMonthData.year}
          </div>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <FiChevronRight className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex gap-8">
          {[currentMonthData, nextMonthData].map((monthData, monthIndex) => (
            <div key={monthIndex} className="flex-1">
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-lg text-gray-500">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthData.days.map((day, index) => {
                  const dateStr = formatDateToLocalString(day.date);
                  const isCheckin = selectedDates.checkin === dateStr;
                  const isCheckout = selectedDates.checkout === dateStr;
                  const isInRange = selectedDates.checkin && selectedDates.checkout && 
                    day.date > createDateFromString(selectedDates.checkin) && 
                    day.date < createDateFromString(selectedDates.checkout);
                  const isToday = formatDateToLocalString(day.date) === formatDateToLocalString(today);
                  
                  return (
                    <div 
                      key={`${monthIndex}-${index}`} 
                      className={`h-9 w-9 flex items-center justify-center rounded-full cursor-pointer
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
          ))}
        </div>
        
        <div className="mt-4 flex justify-center">
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
      </div>
    );
  };

  const adjustGuests = (type, action) => {
    const newGuests = {...guests};
    if (action === 'increase') {
      newGuests[type]++;
    } else if (action === 'decrease' && newGuests[type] > 0) {
      newGuests[type]--;
    }
    setGuests(newGuests);
  };

  const totalGuests = guests.adults + guests.children + guests.infants;

  return (
    <div className="max-w-4xl hidden lg:block px-14 sm:px-6 relative">
      <div className="relative bg-white rounded-full shadow-xl flex items-center p-2">
        <div className="flex flex-1 items-center divide-x divide-gray-200">
          {/* Location Input */}
          <div 
            className="flex items-center px-4 py-2 flex-1 cursor-pointer"
            onClick={handleLocationFocus}
          >
            <FiMapPin className="text-gray-500 text-xl mr-3" />
            <div className="flex flex-col">
              <label className="text-lg font-semibold">Location</label>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Where are you going?" 
                value={searchQuery}
                onChange={handleSearchQueryChange}
                onFocus={handleLocationFocus}
                className="border-none outline-none text-gray-700 placeholder-gray-400 w-full"
              />
            </div>
          </div>
          {/* Dates Input */}
          <div 
            className="flex items-center px-4 py-2 flex-1 cursor-pointer"
            onClick={handleDatesFocus}
          >
            <FiCalendar className="text-gray-500 text-xl mr-3" />
            <div className="flex flex-col">
              <label className="text-lg font-semibold">Add dates</label>
              <span className="text-gray-500">
                {selectedDates.checkin && selectedDates.checkout 
                  ? `${createDateFromString(selectedDates.checkin).toLocaleDateString()} - ${createDateFromString(selectedDates.checkout).toLocaleDateString()}`
                  : 'Check In - Check Out'
                }
              </span>
            </div>
          </div>
          
          {/* Guests Input */}
          <div 
            className="flex items-center px-4 py-2 flex-1 cursor-pointer"
            onClick={handleGuestsFocus}
          >
            <FiUsers className="text-gray-500 text-xl mr-3" />
            <div className="flex flex-col">
              <label className="text-lg font-semibold">{totalGuests} Guests</label>
              <span className="text-gray-500">
                {guests.adults} Adults, {guests.children} Children
              </span>
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3.5 ml-2"
          onClick={handleSearch}
        >
          <FiSearch className="text-xl" />
        </button>
        
        {/* Close Button */}
        {(showRecentSearches || showCalendar || showGuests || showSuggestions) && (
          <button 
            className="absolute top-4 right-16 text-gray-500 hover:text-gray-700" 
            onClick={handleClose}
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>
      
      {/* Recent Searches Dropdown */}
      {showRecentSearches && !showSuggestions && (
        <div ref={suggestionsRef} className="absolute top-22 left-20 bg-white rounded-2xl shadow-lg p-6 w-96 z-2">
          <h3 className="text-lg font-semibold mb-4">Recent searches</h3>
          {recentSearches.length > 0 ? (
            <ul className="space-y-4">
              {recentSearches.map((search, index) => (
                <li 
                  key={index} 
                  className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <FiClock className="text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">{search.location}</div>
                    <div className="text-sm text-gray-500">
                      {search.checkin} - {search.checkout} • {search.persons} guests
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No recent searches
            </div>
          )}
        </div>
      )}

    {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-22 left-20 bg-white rounded-2xl shadow-lg p-6 w-96 z-2"
        >
          <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
          {isSuggestionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="space-y-2">
               {suggestions.map((suggestion, index) => (
                      <div key={index}>
                      <li 
                        className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion?.location?.city)}
                      >
                        <FiMapPin className="text-gray-400 mr-2 w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{suggestion.location.city}</div>
                        </div>
                      </li>
                       <li 
                        
                        className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion?.location?.state)}
                      >
                        <FiMapPin className="text-gray-400 mr-2 w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{suggestion.location.state}</div>
                        </div>
                      </li>
                      <li 
                        className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion.placeName, 'placeName', suggestion.location)}
                      >
                        <FiMapPin className="text-gray-400 mr-2 w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{suggestion.placeName}</div>
                          <div className="text-xs text-gray-500">
                            {suggestion.location.city}, {suggestion.location.state}
                          </div>
                        </div>
                      </li>
                      </div>
                    ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No suggestions found
            </div>
          )}
        </div>
      )}
      
      {/* Calendar Dropdown */}
      {showCalendar && renderCalendar()}
                   
      {/* Guests Dropdown */}
      {showGuests && (
        <div  ref={guestsRef} className="absolute top-22 right-20 bg-white rounded-2xl shadow-lg p-6 w-96 z-2">
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-semibold">Adults</h4>
              <p className="text-lg text-gray-500">Ages 13 or above</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => adjustGuests('adults', 'decrease')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
                disabled={guests.adults <= 1}
              >
                -
              </button>
              <span className="w-5 text-center">{guests.adults}</span>
              <button 
                onClick={() => adjustGuests('adults', 'increase')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div>
              <h4 className="font-semibold">Children</h4>
              <p className="text-lg text-gray-500">Ages 3-12</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => adjustGuests('children', 'decrease')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
                disabled={guests.children <= 0}
              >
                -
              </button>
              <span className="w-5 text-center">{guests.children}</span>
              <button 
                onClick={() => adjustGuests('children', 'increase')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div>
              <h4 className="font-semibold">Infants</h4>
              <p className="text-lg text-gray-500">Ages 0-2</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => adjustGuests('infants', 'decrease')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
                disabled={guests.infants <= 0}
              >
                -
              </button>
              <span className="w-5 text-center">{guests.infants}</span>
              <button 
                onClick={() => adjustGuests('infants', 'increase')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}