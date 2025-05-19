"use client"
import { useState } from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';

export default function SearchBar() {
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState({
    adults: 2,
    children: 1,
    infants: 1
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4)); // May 2025
  
  const recentSearches = [
    'Hamptons, Suffolk County, NY',
    'Las Vegas, NV, United States',
    'Ueno, Taito, Tokyo',
    'Ikebukuro, Toshima, Tokyo'
  ];

  const handleLocationFocus = () => {
    setShowRecentSearches(true);
    setShowCalendar(false);
    setShowGuests(false);
  };

  const handleDatesFocus = () => {
    setShowRecentSearches(false);
    setShowCalendar(true);
    setShowGuests(false);
  };

  const handleGuestsFocus = () => {
    setShowRecentSearches(false);
    setShowCalendar(false);
    setShowGuests(true);
  };

  const handleClose = () => {
    setShowRecentSearches(false);
    setShowCalendar(false);
    setShowGuests(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const renderCalendar = () => {
    const currentDate = new Date(currentMonth);
    const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    
    const renderMonthCalendar = (date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Get last few days of previous month
      const daysFromPrevMonth = firstDay;
      const prevMonthDays = new Date(year, month, 0).getDate();
      
      const days = [];
      
      // Previous month days
      for (let i = 0; i < daysFromPrevMonth; i++) {
        days.push({
          day: prevMonthDays - daysFromPrevMonth + i + 1,
          isCurrentMonth: false
        });
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          isCurrentMonth: true
        });
      }
      
      // Next month days to complete the calendar
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false
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
      <div className="absolute top-22  max-w-5xl left-20 right-0 bg-white rounded-2xl shadow-lg p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
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
          {/* May 2025 Calendar */}
          <div className="flex-1">
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-lg text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {currentMonthData.days.map((day, index) => (
                <div 
                  key={`current-${index}`} 
                  className={`h-9 w-9 flex items-center justify-center rounded-full 
                    ${day.isCurrentMonth ? 'hover:bg-gray-100 cursor-pointer' : 'text-gray-300'}`}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
          
          {/* June 2025 Calendar */}
          <div className="flex-1">
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-lg text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {nextMonthData.days.map((day, index) => (
                <div 
                  key={`next-${index}`} 
                  className={`h-9 w-9 flex items-center justify-center rounded-full 
                    ${day.isCurrentMonth ? 'hover:bg-gray-100 cursor-pointer' : 'text-gray-300'}`}
                >
                  {day.day}
                </div>
              ))}
            </div>
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
    <div className="max-w-5xl hidden lg:block px-14 lg:px-32 sm:px-6 x-4 relative">
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
                type="text" 
                placeholder="Where are you going?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <span className="text-gray-500">Check In - Check Out</span>
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
              <span className="text-gray-500">Guests</span>
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3.5 ml-2">
          <FiSearch className="text-xl" />
        </button>
        
        {/* Close Button (conditional) */}
        {(showRecentSearches || showCalendar || showGuests) && (
          <button 
            className="absolute top-4 right-16 text-gray-500 hover:text-gray-700" 
            onClick={handleClose}
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>
      
      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <div className="absolute top-22 left-20 bg-white rounded-2xl shadow-lg p-6 w-96 z-10">
          <h3 className="text-lg font-semibold mb-4">Recent searches</h3>
          <ul className="space-y-4">
            {recentSearches.map((search, index) => (
              <li 
                key={index} 
                className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                onClick={() => setSearchQuery(search)}
              >
                <FiClock className="text-gray-400 mr-3" />
                {search}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Calendar Dropdown */}
      {showCalendar && renderCalendar()}
      
      {/* Guests Dropdown */}
      {showGuests && (
        <div className="absolute top-22 right-20 bg-white rounded-2xl shadow-lg p-6 w-96 z-10">
          {/* Adults */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-semibold">Adults</h4>
              <p className="text-lg text-gray-500">Ages 13 or above</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => adjustGuests('adults', 'decrease')}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500"
                disabled={guests.adults <= 0}
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
          
          {/* Children */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div>
              <h4 className="font-semibold">Children</h4>
              <p className="text-lg text-gray-500">Ages 2-12</p>
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
          
          {/* Infants */}
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