"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@mui/material"
import { MapPin, Navigation, Star } from "lucide-react"
import GoogleMapWithPlaces from './GoogleMapWithPlaces'

export default function LocationSection({ location }) {
  const [nearbyPlaces, setNearbyPlaces] = useState({
    restaurants: [],
    attractions: [],
    transport: []
  })

  const handleNearbyPlacesFound = (places) => {
    setNearbyPlaces(places)
  }

  const PlaceItem = ({ place, showRating = false }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <p className="font-medium text-sm">{place.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{place.type}</p>
          {showRating && place.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{place.rating}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <Navigation className="h-3 w-3 text-blue-500" />
        <span className="text-sm text-blue-500">{place.distance}</span>
      </div>
    </div>
  )

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
              <div className="space-y-2">
                <h3 className="font-semibold">{location?.houseName}</h3>
                <p className="text-gray-600">
                  {location?.street}, {location?.city}, {location?.state} {location?.postalCode}
                </p>
                <p className="text-gray-600">{location?.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Places */}
        <div className="w-full h-full bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Nearby Places</h2>
        {Object.entries(nearbyPlaces).map(([category, places]) => (
          <div key={category} className="mb-6">
            <h3 className="text-md font-semibold mb-2 capitalize">{category}</h3>
            {places.map((place, index) => (
              <div key={index} className="flex items-center mb-2">
                {place.photoUrl && (
                  <img
                    src={place.photoUrl}
                    alt={place.name}
                    className="w-16 h-16 object-cover mr-2 rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{place.name}</p>
                  <p className="text-sm text-gray-600">{place.distance}</p>
                  {place.rating && <div className='flex items-center'><Star className="h-3 w-3 me-2 fill-yellow-400 text-yellow-400" /> <p className="text-sm text-gray-500">Rating:  {place.rating} </p></div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      </div>

      {/* What Guests Said */}
      <Card>
        <CardHeader>
          <h2>What guests said</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Guests rave about the property's prime location near Varca beach, emphasizing its beautiful surroundings
              and ease of access to both the beach and local attractions. Many appreciate the serene and peaceful
              environment, making it ideal for relaxation. The accessibility to restaurants and shops is highlighted,
              enhancing the overall experience. Overall, the location significantly contributes to guest satisfaction,
              with numerous reviewers expressing an eagerness to return.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}