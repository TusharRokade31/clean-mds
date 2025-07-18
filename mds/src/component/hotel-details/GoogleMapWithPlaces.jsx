"use client"

import { useEffect, useRef, useState } from 'react'
import { MapPin, Home, Star, Clock, Phone, Globe } from 'lucide-react'
import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export default function GoogleMapWithPlaces({ 
  location, 
  onNearbyPlacesFound, 
  className = "aspect-video" 
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState({ restaurants: [], attractions: [], transport: [] })
  const [selectedPlace, setSelectedPlace] = useState(null)
  const loaderRef = useRef(null)

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }

  // Create custom marker with different styles
  const createMarker = (position, title, type = 'default', place = null) => {
    const iconColors = {
      property: '#ef4444', // red
      restaurant: '#f59e0b', // amber
      attraction: '#3b82f6', // blue
      transport: '#10b981', // emerald
      default: '#6b7280' // gray
    }

    let marker;

    if (type === 'property') {
      // Special marker for main property
      marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: iconColors[type],
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 24)
        },
        zIndex: 1000 // Ensure property marker is always on top
      })
    } else {
      // Regular markers for other places
      marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: iconColors[type],
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      })
    }

    // Add click listener to show place details
    marker.addListener('click', () => {
      if (type === 'property') {
        setSelectedPlace({
          name: location.houseName || 'Property Location',
          type: 'Property',
          address: `${location.street}, ${location.city}, ${location.state} ${location.postalCode}`,
          isProperty: true,
          image: location.image || null
        })
      } else if (place) {
        setSelectedPlace({
          ...place,
          isProperty: false
        })
      }
    })

    return marker
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance.toFixed(1) + ' km'
  }

  // Get additional place details
  const getPlaceDetails = (placeId) => {
    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
      service.getDetails({
        placeId: placeId,
        fields: ['name', 'rating', 'formatted_phone_number', 'website', 'opening_hours', 'photos', 'formatted_address']
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place)
        } else {
          resolve(null)
        }
      })
    })
  }

  // Search for nearby places using Places API
  const searchNearbyPlaces = async (map, location) => {
    if (!window.google?.maps?.places) return

    const service = new window.google.maps.places.PlacesService(map)
    const results = {
      restaurants: [],
      attractions: [],
      transport: []
    }

    const searchPromises = [
      new Promise((resolve) => {
        service.nearbySearch({
          location: { lat: location.coordinates.lat, lng: location.coordinates.lng },
          radius: 5000,
          type: 'restaurant'
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results.slice(0, 3))
          } else {
            resolve([])
          }
        })
      }),
      new Promise((resolve) => {
        service.nearbySearch({
          location: { lat: location.coordinates.lat, lng: location.coordinates.lng },
          radius: 10000,
          type: 'tourist_attraction'
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results.slice(0, 4))
          } else {
            resolve([])
          }
        })
      }),
      new Promise((resolve) => {
        service.nearbySearch({
          location: { lat: location.coordinates.lat, lng: location.coordinates.lng },
          radius: 3000,
          type: 'transit_station'
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results.slice(0, 2))
          } else {
            resolve([])
          }
        })
      })
    ]

    try {
      const [restaurants, attractions, transport] = await Promise.all(searchPromises)
      
      results.restaurants = await Promise.all(restaurants.map(async (place) => {
        const placeData = {
          name: place.name,
          type: place.types?.[0]?.replace(/_/g, ' ') || 'Restaurant',
          distance: calculateDistance(
            location.coordinates.lat,
            location.coordinates.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
          ),
          rating: place.rating,
          place_id: place.place_id,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 200, maxHeight: 200 }) || null,
          address: place.vicinity
        }

        const marker = createMarker(
          place.geometry.location,
          place.name,
          'restaurant',
          placeData
        )
        markersRef.current.push(marker)
        
        return placeData
      }))

      results.attractions = await Promise.all(attractions.map(async (place) => {
        const placeData = {
          name: place.name,
          type: 'Tourist Attraction',
          distance: calculateDistance(
            location.coordinates.lat,
            location.coordinates.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
          ),
          rating: place.rating,
          place_id: place.place_id,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 200, maxHeight: 200 }) || null,
          address: place.vicinity
        }

        const marker = createMarker(
          place.geometry.location,
          place.name,
          'attraction',
          placeData
        )
        markersRef.current.push(marker)
        
        return placeData
      }))

      results.transport = await Promise.all(transport.map(async (place) => {
        const placeData = {
          name: place.name,
          type: place.types?.includes('bus_station') ? 'Bus Station' : 'Transit Station',
          distance: calculateDistance(
            location.coordinates.lat,
            location.coordinates.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
          ),
          place_id: place.place_id,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 200, maxHeight: 200 }) || null,
          address: place.vicinity
        }

        const marker = createMarker(
          place.geometry.location,
          place.name,
          'transport',
          placeData
        )
        markersRef.current.push(marker)
        
        return placeData
      }))

      Object.keys(results).forEach(key => {
        results[key].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      })

      setNearbyPlaces(results)
      onNearbyPlacesFound?.(results)
    } catch (error) {
      console.error('Error fetching nearby places:', error)
    }
  }

  // Initialize map
  const initializeMap = () => {
    if (!window.google || !location?.coordinates || !mapRef.current) {
      console.error('Missing requirements for map initialization')
      return
    }

    try {
      const mapOptions = {
        center: { 
          lat: location.coordinates.lat, 
          lng: location.coordinates.lng 
        },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
      
      // Add main property marker with special styling
      const propertyMarker = createMarker(
        { lat: location.coordinates.lat, lng: location.coordinates.lng },
        location.houseName || 'Property Location',
        'property'
      )
      markersRef.current.push(propertyMarker)

      // Search for nearby places
      searchNearbyPlaces(mapInstanceRef.current, location)
      
      console.log('Map initialized successfully')
      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map')
      setIsLoading(false)
    }
  }

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing')
      setIsLoading(false)
      return
    }

    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
      })
    }

    loaderRef.current.load()
      .then(() => {
        console.log('Google Maps API loaded successfully')
        setIsMapLoaded(true)
      })
      .catch(error => {
        console.error('Error loading Google Maps:', error)
        setError('Failed to load Google Maps API')
        setIsLoading(false)
      })
  }, [])

  // Initialize map when API is loaded and location is available
  useEffect(() => {
    if (isMapLoaded && location?.coordinates && mapRef.current) {
      setTimeout(() => {
        initializeMap()
      }, 100)
    }

    return () => {
      clearMarkers()
    }
  }, [isMapLoaded, location])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`${className} bg-red-50 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-red-600 font-medium">Google Maps API key is missing</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-red-600 font-medium">Error loading map</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!isMapLoaded) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full relative">
      <div ref={mapRef} style={{ minHeight: '400px' }} className="w-full h-full rounded-lg" />
      
      {/* Location Details Panel */}
      {selectedPlace && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          
          <div className="space-y-3">
            {/* Image */}
            {selectedPlace.photoUrl && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={selectedPlace.photoUrl}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-start space-x-2">
              {selectedPlace.isProperty ? (
                <Home className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
              ) : (
                <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedPlace.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPlace.type}
                </p>
              </div>
            </div>
            
            {/* Rating */}
            {selectedPlace.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {selectedPlace.rating} / 5
                </span>
              </div>
            )}
            
            {/* Address */}
            <div className="text-sm text-gray-600">
              <p>{selectedPlace.address}</p>
            </div>
            
            {/* Distance */}
            {selectedPlace.distance && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedPlace.distance} from property
                </span>
              </div>
            )}
            
            {/* Additional Details (if available) */}
            {selectedPlace.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedPlace.phone}
                </span>
              </div>
            )}
            
            {selectedPlace.website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-gray-400" />
                <a
                  href={selectedPlace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Your Property</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600">Restaurants</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Attractions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">Transport</span>
          </div>
        </div>
      </div>
    </div>
  )
}