"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, MapPin, Users, Search, X } from "lucide-react";
import { useDebounce } from '@/hooks/useDebounce';
import { fetchSuggestions, clearSuggestions, getPropertiesByQuery, setSearchQuery } from "@/redux/features/property/propertySlice";

export function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery, isSearchLoading, suggestions, isSuggestionsLoading } = useSelector((state) => state.property);
  
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkin: "",
    checkout: "",
    persons: "",
  });



  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  
  const suggestionsRef = useRef(null);
  const locationInputRef = useRef(null);

  
  // Debounce location search
  const debouncedLocationQuery = useDebounce(locationQuery, 500);

  // Update local state when Redux searchQuery changes
useEffect(() => {
  if (searchQuery && !isInitialized) {
    setSearchParams({
      location: searchQuery.location || "",
      checkin: searchQuery.checkin || "",
      checkout: searchQuery.checkout || "",
      persons: searchQuery.persons || "",
    });
    setLocationQuery(searchQuery.location || "");
    setSelectedLocation(searchQuery.locationData || null);
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

  const handleSuggestionClick = (suggestion) => {
    const displayText = `${suggestion.placeName}, ${suggestion.location.city}, ${suggestion.location.state}`;
    setLocationQuery(displayText);
    setSearchParams({ ...searchParams, location: displayText });
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
  };

 const handleSearch = () => {
  if (!locationQuery.trim()) {
    alert("Please enter a location");
    return;
  }
  
  const currentSearchParams = {
    location: searchParams.location,
    checkin: searchParams.checkin,
    checkout: searchParams.checkout,
    persons: searchParams.persons,
    locationData: selectedLocation
  };
  
  // Update Redux state first
  dispatch(setSearchQuery(currentSearchParams));
  
  // Then perform search
  dispatch(
    getPropertiesByQuery({
      ...currentSearchParams,
      skip: 1,
      limit: 10
    })
  );
};

  const inputBase =
    "w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:cursor-not-allowed";

  return (
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
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 mt-1"
            >
              <h4 className="text-sm font-medium text-gray-600 mb-2">Suggestions</h4>
              {isSuggestionsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <MapPin className="text-gray-400 mr-2 w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">{suggestion.placeName}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.location.city}, {suggestion.location.state}
                          </div>
                     </div>
                   </li>
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
         <input
           type="date"
           value={searchParams.checkin}
           onChange={(e) =>
             setSearchParams({ ...searchParams, checkin: e.target.value })
           }
           className={inputBase}
           disabled={isSearchLoading}
         />
       </div>

       {/* Check-out */}
       <div className="space-y-1">
         <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
           <Calendar className="w-5 h-5 text-blue-500" />
           Check-out
         </label>
         <input
           type="date"
           value={searchParams.checkout}
           onChange={(e) =>
             setSearchParams({ ...searchParams, checkout: e.target.value })
           }
           className={inputBase}
           disabled={isSearchLoading}
           min={searchParams.checkin} // Prevent checkout before checkin
         />
       </div>

       {/* Guests */}
       <div className="space-y-1">
         <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
           <Users className="w-5 h-5 text-purple-500" />
           Guests
         </label>
         <select
           value={searchParams.persons}
           onChange={(e) =>
             setSearchParams({ ...searchParams, persons: e.target.value })
           }
           className={inputBase}
           disabled={isSearchLoading}
         >
           {[...Array(10)].map((_, i) => (
             <option key={i + 1} value={i + 1}>
               {i + 1} Guest{i > 0 && "s"}
             </option>
           ))}
         </select>
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
     
   </div>
 );
}