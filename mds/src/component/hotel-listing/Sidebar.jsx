"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { Button, Checkbox, Slider } from "@mui/material"


export function Sidebar() {
  const [priceRange, setPriceRange] = useState([2000])
  const [activeFilters, setActiveFilters] = useState(["Near Temple", "WiFi"])

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-md h-fit">
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0">
          Clear All
        </Button>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activeFilters.map((filter) => (
          <div
            key={filter}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {filter}
            <button onClick={() => removeFilter(filter)} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">💰</span>
          <h4 className="font-medium">Price Range (per night)</h4>
        </div>
        <div className="space-y-4">
          <Slider value={priceRange} max={5000} min={500} step={100} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹500</span>
            <span>₹5,000</span>
          </div>
          <div className="text-center text-sm font-medium">Up to ₹{priceRange[0].toLocaleString()}</div>
        </div>
      </div>

      {/* Distance from Temple */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">🏛️</span>
          <h4 className="font-medium">Distance from Temple</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox    id="500m" defaultChecked />
            <label htmlFor="500m" className="text-sm">
              Within 500m (12)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="1km" />
            <label htmlFor="1km" className="text-sm">
              500m - 1km (8)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="2km" />
            <label htmlFor="2km" className="text-sm">
              1km - 2km (4)
            </label>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500">🏨</span>
          <h4 className="font-medium">Amenities</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="wifi" defaultChecked />
            <label htmlFor="wifi" className="text-sm">
              WiFi
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ac" />
            <label htmlFor="ac" className="text-sm">
              AC
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="meals" />
            <label htmlFor="meals" className="text-sm">
              Meals
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="parking" />
            <label htmlFor="parking" className="text-sm">
              Parking
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="lift" />
            <label htmlFor="lift" className="text-sm">
              Lift
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="hot-water" />
            <label htmlFor="hot-water" className="text-sm">
              Hot Water
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="prayer-room" />
            <label htmlFor="prayer-room" className="text-sm">
              Prayer Room
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="security" />
            <label htmlFor="security" className="text-sm">
              Security
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
