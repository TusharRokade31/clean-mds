"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Users, Search } from "lucide-react";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Popover, Box, Typography, IconButton, Divider } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchSuggestions, clearSuggestions, getPropertiesByQuery, setSearchQuery } from "@/redux/features/property/propertySlice";
import toast from "react-hot-toast";

export function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery, isSearchLoading, suggestions, isSuggestionsLoading } = useSelector((state) => state.property);
  
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkin: null,
    checkout: null,
  });

const [guests, setGuests] = useState(() => ({
  adults: parseInt(searchQuery?.persons) || 1,
  rooms:  parseInt(searchQuery?.rooms)  || 1,
}));

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [guestsAnchorEl, setGuestsAnchorEl] = useState(null);
  
  const suggestionsRef = useRef(null);
  const locationInputRef = useRef(null);
  const guestsButtonRef = useRef(null);
  const checkinRef = useRef(null);
  const checkoutRef = useRef(null);

  
  // Debounce location search
  const debouncedLocationQuery = useDebounce(locationQuery, 500);

  // Update local state when Redux searchQuery changes
  useEffect(() => {
    if (searchQuery && !isInitialized) {
      setSearchParams({
        location: searchQuery.location || "",
        checkin: searchQuery.checkin ? new Date(searchQuery.checkin) : null,
        checkout: searchQuery.checkout ? new Date(searchQuery.checkout) : null,
      });
      setLocationQuery(searchQuery.location || "");
      setSelectedLocation(searchQuery.locationData || null);
      
      // Set guests if available in searchQuery
      if (searchQuery.persons !== undefined) {
        setGuests({
          adults: parseInt(searchQuery.persons) || 1,
          rooms: parseInt(searchQuery.rooms) || 1,
        });
      }
      
      setIsInitialized(true);
    }
  }, [searchQuery, isInitialized]);

  // Auto-trigger search once initialized with existing searchQuery
  useEffect(() => {
    if (isInitialized && searchQuery?.location) {
      

      dispatch(
        getPropertiesByQuery({
          location: searchQuery.location,
          checkin: searchQuery.checkin,
          checkout: searchQuery.checkout,
          persons: (parseInt(searchQuery.persons) || 2).toString(),
          adults: parseInt(searchQuery.persons) || 2,
          rooms: parseInt(searchQuery.rooms) || 1,
          locationData: searchQuery.locationData || null,
          skip: 0,
          limit: 10,
        })
      );
    }
  }, [isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch suggestions when debounced location query changes
  useEffect(() => {
    if (debouncedLocationQuery.trim().length >= 2) {
      dispatch(fetchSuggestions(debouncedLocationQuery.trim()));
      setShowSuggestions(true);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  }, [debouncedLocationQuery, dispatch]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSearchParams({ ...searchParams, location: value });
    setSelectedLocation(null); // Reset selected location when typing
  };

  const handleLocationFocus = () => {
    if (locationQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

const handleSuggestionClick = (suggestion, type, location = null) => {
  // If placeName is clicked, include city and state
  const displayText = type === 'placeName' 
    ? `${suggestion}, ${location.city}, ${location.state}`
    : suggestion;
    
  setLocationQuery(displayText);
  setSearchParams({ ...searchParams, location: displayText });
  setSelectedLocation(suggestion);
  setShowSuggestions(false);
};

  const handleGuestsClick = (event) => {
    setGuestsAnchorEl(event.currentTarget);
  };

  const handleGuestsClose = () => {
    setGuestsAnchorEl(null);
  };

  const adjustGuests = (type, action) => {
    const newGuests = { ...guests };
    if (action === 'increase') {
      newGuests[type]++;
    } else if (action === 'decrease' && newGuests[type] > 1) {
      newGuests[type]--;
    }
    setGuests(newGuests);
  };

  const totalGuests = guests.adults;

  const handleSearch = () => {
    if (!locationQuery.trim()) {
      toast.error("Please enter a location");
      return;
    }
    if (!searchParams.checkin || !searchParams.checkout) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    const currentSearchParams = {
      location: searchParams.location,
      checkin: searchParams.checkin?.toISOString().split('T')[0],
      checkout: searchParams.checkout?.toISOString().split('T')[0],
      persons: totalGuests.toString(),
      adults: guests.adults,
      rooms: guests.rooms,
      locationData: selectedLocation,
    };
    dispatch(setSearchQuery(currentSearchParams));
    dispatch(getPropertiesByQuery({ ...currentSearchParams, skip: 0, limit: 10 }));
  };

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const isGuestsPopoverOpen = Boolean(guestsAnchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-stretch overflow-visible">

        {/* Location */}
        <div className="relative flex-1 min-w-0">
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-text"
            onClick={() => locationInputRef.current?.focus()}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              City, Area or Property
            </span>
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Enter a destination"
              value={locationQuery}
              onChange={handleLocationChange}
              onFocus={handleLocationFocus}
              className="text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400 w-full disabled:cursor-not-allowed"
              disabled={isSearchLoading}
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 mt-1 min-w-[280px]"
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Suggestions</h4>
              {isSuggestionsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index}>
                      <li
                        className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion.city, 'city')}
                      >
                        <MapPin className="text-gray-400 mr-2 w-4 h-4 shrink-0" />
                        <span className="font-medium text-sm">{suggestion.city}</span>
                      </li>
                      <li
                        className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion.state, 'state')}
                      >
                        <MapPin className="text-gray-400 mr-2 w-4 h-4 shrink-0" />
                        <span className="font-medium text-sm">{suggestion.state}</span>
                      </li>
                    </div>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-center py-2 text-sm">No suggestions found</div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* Check-in */}
        <div className="flex-shrink-0 relative" ref={checkinRef}>
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-pointer"
            onClick={() => !isSearchLoading && setCheckinOpen(true)}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Check-in</span>
            <span className={`text-sm font-semibold ${searchParams.checkin ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkin ? formatDate(searchParams.checkin) : 'Add date'}
            </span>
          </div>
          <DatePicker
            open={checkinOpen}
            onOpen={() => setCheckinOpen(true)}
            onClose={() => setCheckinOpen(false)}
            value={searchParams.checkin}
            onChange={(newValue) => {
              setSearchParams({ ...searchParams, checkin: newValue });
              setCheckinOpen(false);
            }}
            minDate={new Date()}
            disabled={isSearchLoading}
            slotProps={{
              textField: { sx: { display: 'none' } },
              popper: {
                anchorEl: () => checkinRef.current,
                placement: 'bottom-start',
                modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
              },
            }}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* Check-out */}
        <div className="flex-shrink-0 relative" ref={checkoutRef}>
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-pointer"
            onClick={() => !isSearchLoading && setCheckoutOpen(true)}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Check-out</span>
            <span className={`text-sm font-semibold ${searchParams.checkout ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkout ? formatDate(searchParams.checkout) : 'Add date'}
            </span>
          </div>
          <DatePicker
            open={checkoutOpen}
            onOpen={() => setCheckoutOpen(true)}
            onClose={() => setCheckoutOpen(false)}
            value={searchParams.checkout}
            onChange={(newValue) => {
              setSearchParams({ ...searchParams, checkout: newValue });
              setCheckoutOpen(false);
            }}
            minDate={searchParams.checkin ? new Date(searchParams.checkin.getTime() + 24 * 60 * 60 * 1000) : new Date()}
            disabled={isSearchLoading}
            slotProps={{
              textField: { sx: { display: 'none' } },
              popper: {
                anchorEl: () => checkoutRef.current,
                placement: 'bottom-start',
                modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
              },
            }}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* Rooms & Guests */}
        <div className="flex-shrink-0">
          <button
            ref={guestsButtonRef}
            onClick={handleGuestsClick}
            disabled={isSearchLoading}
            className="flex flex-col justify-center px-5 py-3 h-full text-left w-full disabled:cursor-not-allowed"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              Rooms &amp; Guests
            </span>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              {guests.rooms} Room{guests.rooms !== 1 ? 's' : ''}, {guests.adults} Adult{guests.adults !== 1 ? 's' : ''}
            </span>
          </button>
        </div>

        {/* Search Button */}
        <div className="flex items-stretch m-0">
          <button
            onClick={handleSearch}
            disabled={isSearchLoading}
            className="flex items-center justify-center gap-2 bg-[#1035ac] hover:bg-[#0e2f99] text-white font-bold uppercase tracking-widest text-sm px-8 rounded-none rounded-r-xl transition disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSearchLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

        {/* Guests Popover */}
        <div>
        <Popover
          open={isGuestsPopoverOpen}
          anchorEl={guestsAnchorEl}
          onClose={handleGuestsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 3, minWidth: 280 }}>
            {/* Adults */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
              <Box>
                <Typography fontWeight="600">Adults</Typography>
                <Typography variant="body2" color="text.secondary">Ages 13 or above</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => adjustGuests('adults', 'decrease')} disabled={guests.adults <= 1} size="small" sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}>
                  <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.adults}</Typography>
                <IconButton onClick={() => adjustGuests('adults', 'increase')} size="small" sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}>
                  <Add />
                </IconButton>
              </Box>
            </Box>

            <Divider />

            {/* Rooms */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
              <Box>
                <Typography  fontWeight="600">Rooms</Typography>
                <Typography variant="body2" color="text.secondary">Number of rooms</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => adjustGuests('rooms', 'decrease')} disabled={guests.rooms <= 1} size="small" sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}>
                  <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.rooms}</Typography>
                <IconButton onClick={() => adjustGuests('rooms', 'increase')} size="small" sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}>
                  <Add />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Popover>
      </div>
    </LocalizationProvider>
  );
}