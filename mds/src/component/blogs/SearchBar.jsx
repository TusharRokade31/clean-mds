"use client"

import { Search, X } from "lucide-react"
import { Input } from "@mui/material"

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  totalResults, 
  onSearchChange, 
  isSearching = false 
}) {
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    // Don't call onSearchChange immediately - let debounce handle it
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isSearching ? 'text-[#1035ac] animate-pulse' : 'text-gray-400'
          }`} />
          
          <Input
            type="text"
            placeholder="Search articles"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 w-full border-gray-200 focus:border-[#1035ac] focus:ring-[#1035ac]"
          />
          
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {isSearching && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1035ac] border-t-transparent"></div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          {isSearching ? (
            <span className="text-[#1035ac]">Searching...</span>
          ) : (
            <span>Showing {totalResults} articles</span>
          )}
        </div>
      </div>
      
      {searchQuery && !isSearching && (
        <div className="mt-3 text-sm text-gray-600">
          Search results for: <span className="font-medium">"{searchQuery}"</span>
        </div>
      )}
    </div>
  )
}