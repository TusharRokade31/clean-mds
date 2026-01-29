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

export default function LocationSection({ location }) {
  // Categorized state including your specific transport types
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

  // Helper to pick the right icon for the category
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  // Match specific transport subcategories
  if (cat.includes("bus")) return <Bus className="w-8 h-8 text-blue-500" />;
  if (cat.includes("railway") || cat.includes("train")) return <Train className="w-8 h-8 text-emerald-500" />;
  if (cat.includes("airport")) return <Plane className="w-8 h-8 text-purple-500" />;
  
  // Default fallbacks for other categories
  if (cat.includes("restaurant")) return <MapIcon className="w-8 h-8 text-amber-500" />;
  return <MapIcon className="w-8 h-8 text-gray-400" />;
}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2">
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

              {/* Address Details */}
              <div className=" mt-5 space-y-2">
                <h3 className="font-semibold">{location?.houseName}</h3>
                <p className="text-gray-600">
                  {location?.street}, {location?.city}, {location?.state}, {location?.country} {location?.postalCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Places - Kept UI style same as your original */}
        <div className="w-full h-full bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Nearby Places</h2>
          {Object.entries(nearbyPlaces).map(([category, places]) => (
            <div key={category} className="mb-6">
              <h3 className="text-md font-semibold mb-2 capitalize">{category}</h3>
              {places.length > 0 ? (
                places.map((place, index) => (
                  <div key={index} className="flex items-center mb-2">
                    {/* Image with Icon Fallback */}
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
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-gray-600">{place.distance}</p>
                      {place.rating && (
                        <div className='flex items-center'>
                          <Star className="h-3 w-3 me-2 fill-yellow-400 text-yellow-400" /> 
                          <p className="text-sm text-gray-500">Rating: {place.rating}</p>
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