"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, MapPin, Users, Search, X } from "lucide-react";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, Popover, Box, Typography, IconButton, Divider } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchSuggestions, clearSuggestions, getPropertiesByQuery, setSearchQuery } from "@/redux/features/property/propertySlice";

export function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery, isSearchLoading, suggestions, isSuggestionsLoading } = useSelector((state) => state.property);
  
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkin: null,
    checkout: null,
  });

  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [guestsAnchorEl, setGuestsAnchorEl] = useState(null);
  
  const suggestionsRef = useRef(null);
  const locationInputRef = useRef(null);
  const guestsButtonRef = useRef(null);

  
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
      if (searchQuery.adults !== undefined) {
        setGuests({
          adults: parseInt(searchQuery.adults) || 2,
          children: parseInt(searchQuery.children) || 0,
          infants: parseInt(searchQuery.infants) || 0
        });
      }
      
      setIsInitialized(true);
    }
  }, [searchQuery, isInitialized]);

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
    const newGuests = {...guests};
    if (action === 'increase') {
      newGuests[type]++;
    } else if (action === 'decrease' && newGuests[type] > 0) {
      newGuests[type]--;
      // Ensure adults never goes below 1
      if (type === 'adults' && newGuests[type] < 1) {
        newGuests[type] = 1;
      }
    }
    setGuests(newGuests);
  };

  const totalGuests = guests.adults + guests.children + guests.infants;

  const handleSearch = () => {
    if (!locationQuery.trim()) {
      alert("Please enter a location");
      return;
    }

    if (!searchParams.checkin || !searchParams.checkout) {
      alert("Please select check-in and check-out dates");
      return;
    }
    
    const currentSearchParams = {
      location: searchParams.location,
      checkin: searchParams.checkin?.toISOString().split('T')[0],
      checkout: searchParams.checkout?.toISOString().split('T')[0],
      persons: totalGuests.toString(),
      adults: guests.adults,
      children: guests.children,
      infants: guests.infants,
      locationData: selectedLocation
    };
    
    // Update Redux state first
    dispatch(setSearchQuery(currentSearchParams));
    
    // Then perform search
    dispatch(
      getPropertiesByQuery({
        ...currentSearchParams,
        skip: 0,
        limit: 10
      })
    );
  };

  const inputBase =
    "w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:cursor-not-allowed";

  const isGuestsPopoverOpen = Boolean(guestsAnchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Location */}
          <div className="space-y-1 relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <MapPin className="w-5 h-5 text-red-500" />
              Location
            </label>
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Where are you going?"
              value={locationQuery}
              onChange={handleLocationChange}
              onFocus={handleLocationFocus}
              className={inputBase}
              disabled={isSearchLoading}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-2 mt-1"
              >
                <h4 className="text-sm font-medium text-gray-600 mb-2">Suggestions</h4>
                {isSuggestionsLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="space-y-1">
                    {console.log(suggestions, "search suggestion")}
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index}>
                        <li 
                          className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion.city, 'city')}
                        >
                          <MapPin className="text-gray-400 mr-2 w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">{suggestion.city}</div>
                          </div>
                        </li>
                        
                        <li 
                          className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion.state, 'state')}
                        >
                          <MapPin className="text-gray-400 mr-2 w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">{suggestion.state}</div>
                          </div>
                        </li>
                        
                        {/* <li 
                          className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion.placeName, 'placeName', suggestion.location)}
                        >
                          <MapPin className="text-gray-400 mr-2 w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">{suggestion.placeName}</div>
                            <div className="text-xs text-gray-500">
                              {suggestion.location.city}, {suggestion.location.state}
                            </div>
                          </div>
                        </li> */}
                      </div>
                    ))}

                  </ul>
                ) : (
                  <div className="text-gray-500 text-center py-2 text-sm">
                    No suggestions found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check-in */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar className="w-5 h-5 text-blue-500" />
              Check-in
            </label>
            <DatePicker
              value={searchParams.checkin}
              onChange={(newValue) =>
                setSearchParams({ ...searchParams, checkin: newValue })
              }
              minDate={new Date()}
              disabled={isSearchLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className={inputBase}
                  placeholder="Select date"
                  size="small"
                />
              )}
              slotProps={{
                textField: {
                  className: inputBase,
                  placeholder: "Select date",
                  size: "small",
                }
              }}
            />
          </div>

          {/* Check-out */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar className="w-5 h-5 text-blue-500" />
              Check-out
            </label>
            <DatePicker
              value={searchParams.checkout}
              onChange={(newValue) =>
                setSearchParams({ ...searchParams, checkout: newValue })
              }
              minDate={searchParams.checkin ? new Date(searchParams.checkin.getTime() + 24 * 60 * 60 * 1000) : new Date()}
              disabled={isSearchLoading}
              slotProps={{
                textField: {
                  className: inputBase,
                  placeholder: "Select date",
                  size: "small",
                }
              }}
            />
          </div>

          {/* Guests */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Users className="w-5 h-5 text-purple-500" />
              Guests
            </label>
            <button
              ref={guestsButtonRef}
              onClick={handleGuestsClick}
              className={`${inputBase} text-left flex items-center justify-between`}
              disabled={isSearchLoading}
            >
              <span>
                {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
              </span>
              <Users className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isSearchLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1035ac] hover:bg-[#0e2f99] text-white rounded-lg px-6 py-3 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSearchLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Guests Popover */}
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
          <Box sx={{ p: 3, minWidth: 320 }}>
            {/* Adults */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Adults
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ages 13 or above
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton 
                  onClick={() => adjustGuests('adults', 'decrease')}
                  disabled={guests.adults <= 1}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                  {guests.adults}
                </Typography>
                <IconButton 
                  onClick={() => adjustGuests('adults', 'increase')}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Children */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Children
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ages 3-12
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton 
                  onClick={() => adjustGuests('children', 'decrease')}
                  disabled={guests.children <= 0}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                  {guests.children}
                </Typography>
                <IconButton 
                  onClick={() => adjustGuests('children', 'increase')}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Infants */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Infants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ages 0-2
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton 
                  onClick={() => adjustGuests('infants', 'decrease')}
                  disabled={guests.infants <= 0}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                  {guests.infants}
                </Typography>
                <IconButton 
                  onClick={() => adjustGuests('infants', 'increase')}
                  size="small"
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'grey.500' }
                  }}
                >
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