"use client"

import {
  Wifi,
  Car,
  Wind,
  Shirt,
  Newspaper,
  Phone,
  Shield,
  Camera,
  Utensils,
  FireExtinguisher,
  Luggage,
  CheckCircle,
} from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@mui/material" 

export default function AmenitiesSection({ amenities }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getAmenityIcon = (amenityName) => {
    const name = amenityName.toLowerCase()
    const iconClass = "h-5 w-5 text-gray-600" 
    
    switch (name) {
      case "wifi": return <Wifi className={iconClass} />
      case "parking": return <Car className={iconClass} />
      case "airconditioning": return <Wind className={iconClass} />
      case "laundry": return <Shirt className={iconClass} />
      case "newspaper": return <Newspaper className={iconClass} />
      case "roomservice": return <Phone className={iconClass} />
      case "smokedetector": return <Shield className={iconClass} />
      case "cctv": return <Camera className={iconClass} />
      case "restaurantbhojnalay": return <Utensils className={iconClass} />
      case "fireextinguishers": return <FireExtinguisher className={iconClass} />
      case "luggageassistance": return <Luggage className={iconClass} />
      default: return <CheckCircle className={iconClass} />
    }
  }

  const formatAmenityName = (name) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  // 1. Get all available amenities from both mandatory and basicFacilities
  const mandatoryAmenities = Object.entries(amenities?.mandatory || {})
    .filter(([_, amenity]) => amenity.available)

  const basicFacilities = Object.entries(amenities?.basicFacilities || {})
    .filter(([_, facility]) => facility.available)

  // 2. Combine both arrays
  const allAmenities = [...mandatoryAmenities, ...basicFacilities]

  // 3. Determine how many to show
  const VISIBLE_COUNT = 3
  
  // 4. Slice the array based on state
  const visibleAmenities = isExpanded ? allAmenities : allAmenities.slice(0, VISIBLE_COUNT)
  const remainingCount = allAmenities.length - VISIBLE_COUNT

  return (
    <Card elevation={0} className="border-none shadow-none"> 
      <CardContent className="p-0">
        {/* Header */}
        <h2 className="text-xl font-bold mb-4 text-black">Amenities</h2>

        {/* Horizontal List Container */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            
          {/* Render Visible Amenities */}
          {visibleAmenities.map(([name]) => (
            <div key={name} className="flex items-center gap-2 text-gray-700">
              {getAmenityIcon(name)}
              <span className="text-sm font-medium">
                {formatAmenityName(name)}
              </span>
            </div>
          ))}

          {/* "+ More" Link */}
          {!isExpanded && remainingCount > 0 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              + {remainingCount} More Amenities
            </button>
          )}
          
          {/* Optional: "Show Less" button if expanded */}
          {isExpanded && (
             <button
             onClick={() => setIsExpanded(false)}
             className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline ml-2"
           >
             Show Less
           </button>
          )}

        </div>
      </CardContent>
    </Card>
  )
}