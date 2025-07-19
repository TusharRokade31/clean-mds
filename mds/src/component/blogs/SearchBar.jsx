"use client"

import { Search } from "lucide-react"
import { Input } from "@mui/material"


export default function SearchBar({ searchQuery, setSearchQuery, totalResults, onSearchChange }) {
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    onSearchChange()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search articles, places, tips..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-[#1035ac] focus:ring-[#1035ac]"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {totalResults} of {totalResults} articles
        </div>
      </div>
    </div>
  )
}
