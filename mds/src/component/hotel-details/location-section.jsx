"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@mui/material"
import { 
  MapPin, 
  Star, 
  Bus, 
  Train, 
  Plane, 
  Map as MapIcon 
} from "lucide-react"
import GoogleMapWithPlaces from './GoogleMapWithPlaces'

// 1. Accept `children` in the props
export default function LocationSection({ location, children }) {
  const [nearbyPlaces, setNearbyPlaces] = useState({
    restaurants: [],
    attractions: [],
    "Bus station": [],
    "Railway station": [],
    "Airport near Dharamshala": []
  })

  const handleNearbyPlacesFound = (places) => {
    setNearbyPlaces(places)
  }

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes("bus")) return <Bus className="w-8 h-8 text-blue-500" />;
    if (cat.includes("railway") || cat.includes("train")) return <Train className="w-8 h-8 text-emerald-500" />;
    if (cat.includes("airport")) return <Plane className="w-8 h-8 text-purple-500" />;
    
    if (cat.includes("restaurant")) return <MapIcon className="w-8 h-8 text-amber-500" />;
    return <MapIcon className="w-8 h-8 text-gray-400" />;
  }

  return (
    <div className="space-y-6">
      {/* 2. Added items-start to allow columns to have independent heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Map + Rules) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5" />
                Property Location
              </h2>
            </CardHeader>
            <CardContent>
              <GoogleMapWithPlaces
                location={location}
                onNearbyPlacesFound={handleNearbyPlacesFound}
                className="aspect-video mb-4"
              />

              <div className=" mt-5 space-y-2">
                <h3 className="font-semibold">{location?.houseName}</h3>
                <p className="text-gray-600">
                  {location?.street}, {location?.city}, {location?.state}, {location?.country} {location?.postalCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Render children (PropertyRules) right below the Map */}
          {children}
        </div>

        {/* Right Column (Nearby Places Sidebar) */}
        {/* 4. Added sticky positioning, borders, and max-height so it scrolls internally */}
        <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100  self-start lg:sticky lg:top-24 max-h-[calc(100vh-100px)] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Nearby Places</h2>
          {Object.entries(nearbyPlaces).map(([category, places]) => (
            <div key={category} className="mb-6">
              <h3 className="text-md font-semibold mb-2 capitalize">{category}</h3>
              {places.length > 0 ? (
                places.map((place, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div className="w-16 h-16 mr-2 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded">
                      {place.photoUrl ? (
                        <img
                          src={place.photoUrl}
                          alt={place.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        getCategoryIcon(category)
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm leading-tight">{place.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{place.distance}</p>
                      {place.rating && (
                        <div className='flex items-center mt-1'>
                          <Star className="h-3 w-3 me-1 fill-yellow-400 text-yellow-400" /> 
                          <p className="text-xs text-gray-500">Rating: {place.rating}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No details available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}