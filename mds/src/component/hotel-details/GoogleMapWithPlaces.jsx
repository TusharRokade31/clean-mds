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
  const [selectedPlace, setSelectedPlace] = useState(null)
  const loaderRef = useRef(null)

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
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

  // Create custom marker with different styles
  const createMarker = (position, title, type = 'default', place = null) => {
    const iconColors = {
      property: '#ef4444',
      restaurant: '#f59e0b',
      attraction: '#3b82f6',
      transport: '#10b981',
      default: '#6b7280'
    }

    let marker;

    if (type === 'property') {
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
        zIndex: 1000
      })
    } else {
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
        setSelectedPlace({ ...place, isProperty: false })
      }
    })

    return marker
  }

  // FIX: formatPlaceData now receives `loc` explicitly instead of closing over `location`
  const formatPlaceData = (place, type, loc) => {
    const placeData = {
      name: place.name,
      type: place.types?.includes('airport') ? 'Airport' :
            place.types?.includes('train_station') ? 'Railway Station' :
            place.types?.includes('bus_station') ? 'Bus Station' :
            place.types?.[0]?.replace(/_/g, ' ') || 'Place',
      distance: calculateDistance(
        loc.coordinates.lat,
        loc.coordinates.lng,
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
      type,
      placeData
    )
    markersRef.current.push(marker)
    return placeData
  }

  const searchNearbyPlaces = async (map, loc) => {
    // importLibrary("places") returns the places namespace directly.
    // We use it here as a fallback in case the ref on window isn't populated yet.
    let PlacesService
    try {
      const placesLib = await window.google.maps.importLibrary("places")
      PlacesService = placesLib.PlacesService
    } catch (err) {
      console.error('[Places] Failed to import Places library:', err)
      return
    }

    if (!PlacesService) {
      console.error('[Places] PlacesService is not available after importLibrary. ' +
        'Check that the Places API is enabled in Google Cloud Console and billing is active.')
      return
    }

    const service = new PlacesService(map)

    const { PlacesServiceStatus } = await window.google.maps.importLibrary("places")

    const createSearchPromise = (type, radius) => {
      return new Promise((resolve) => {
        service.nearbySearch({
          location: { lat: loc.coordinates.lat, lng: loc.coordinates.lng },
          radius: radius,
          type: type
        }, (results, status) => {
          if (status === PlacesServiceStatus.OK) {
            console.log(`[Places] '${type}' returned ${results.length} results`)
            resolve(results)
          } else {
            // ZERO_RESULTS     → no places found in radius
            // REQUEST_DENIED   → Places API not enabled or billing inactive
            // OVER_QUERY_LIMIT → quota exceeded
            // INVALID_REQUEST  → bad parameters
            console.warn(`[Places] '${type}' search failed with status: ${status}`)
            resolve([])
          }
        })
      })
    }

    try {
      const [rawRestaurants, rawAttractions, busStations, trainStations, airports] = await Promise.all([
        createSearchPromise('restaurant', 5000),
        createSearchPromise('tourist_attraction', 10000),
        createSearchPromise('bus_station', 10000),
        createSearchPromise('train_station', 20000),
        createSearchPromise('airport', 100000)
      ])

      // FIX: Pass `loc` explicitly into formatPlaceData to avoid stale closure
      const results = {
        restaurants: rawRestaurants
          .filter(place => (place.rating || 0) >= 4)
          .slice(0, 5)
          .map(place => formatPlaceData(place, 'restaurant', loc)),

        attractions: rawAttractions
          .filter(place => (place.rating || 0) >= 4)
          .slice(0, 5)
          .map(place => formatPlaceData(place, 'attraction', loc)),

        "Bus station": busStations
          .slice(0, 3)
          .map(place => formatPlaceData(place, 'transport', loc)),

        "Railway station": trainStations
          .slice(0, 3)
          .map(place => formatPlaceData(place, 'transport', loc)),

        "Airport near Dharamshala": airports
          .slice(0, 2)
          .map(place => formatPlaceData(place, 'transport', loc))
      }

      console.log('[Places] Final results:', results)
      onNearbyPlacesFound?.(results)
    } catch (err) {
      console.error('[Places] Unexpected error during nearby search:', err)
    }
  }

  // Initialize map
  const initializeMap = () => {
    if (!window.google || !location?.coordinates || !mapRef.current) {
      console.error('[Map] Missing requirements:', {
        google: !!window.google,
        coordinates: !!location?.coordinates,
        mapRef: !!mapRef.current
      })
      return
    }

    try {
      const mapOptions = {
        center: { lat: location.coordinates.lat, lng: location.coordinates.lng },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      }

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

      // FIX: Wait for map to be idle before searching so the PlacesService is fully ready
      window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
        console.log('[Map] Map is idle, starting nearby places search...')
        searchNearbyPlaces(mapInstanceRef.current, location)
      })

      const propertyMarker = createMarker(
        { lat: location.coordinates.lat, lng: location.coordinates.lng },
        location.houseName || 'Property Location',
        'property'
      )
      markersRef.current.push(propertyMarker)

      console.log('[Map] Initialized successfully at', location.coordinates)
      setIsLoading(false)
    } catch (err) {
      console.error('[Map] Error initializing map:', err)
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

    const loadMapsAndPlaces = async () => {
      try {
        // The Loader is a global singleton keyed by API key.
        // If another part of the app already loaded Maps WITHOUT the "places"
        // library, the singleton reuses that cached script and places is missing.
        // Using importLibrary() explicitly guarantees places is always loaded,
        // regardless of what other Loader instances have requested.
        if (!loaderRef.current) {
          loaderRef.current = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: "weekly",
          })
        }

        // Load core Maps script first
        await loaderRef.current.load()
        console.log('[Map] Google Maps core loaded')

        // Explicitly import the Places library — this works even if the Loader
        // singleton was already resolved without it
        await window.google.maps.importLibrary("places")
        console.log('[Map] Places library loaded successfully')

        setIsMapLoaded(true)
      } catch (err) {
        console.error('[Map] Error loading Google Maps or Places:', err)
        setError('Failed to load Google Maps API')
        setIsLoading(false)
      }
    }

    loadMapsAndPlaces()
  }, [])

  // Initialize map when API is loaded and location is available
  useEffect(() => {
    if (isMapLoaded && location?.coordinates && mapRef.current) {
      // FIX: Removed arbitrary setTimeout — using map 'idle' event instead (in initializeMap)
      initializeMap()
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
      <div ref={mapRef} style={{ minHeight: '500px' }} className="w-full h-full rounded-lg" />

      {/* Location Details Panel */}
      {selectedPlace && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>

          <div className="space-y-3">
            {selectedPlace.photoUrl && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img src={selectedPlace.photoUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-start space-x-2">
              {selectedPlace.isProperty ? (
                <Home className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
              ) : (
                <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{selectedPlace.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedPlace.type}</p>
              </div>
            </div>

            {selectedPlace.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{selectedPlace.rating} / 5</span>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>{selectedPlace.address}</p>
            </div>

            {selectedPlace.distance && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedPlace.distance} from property</span>
              </div>
            )}

            {selectedPlace.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedPlace.phone}</span>
              </div>
            )}

            {selectedPlace.website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-gray-400" />
                <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-blue-600 hover:underline">
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
            <span className="text-gray-600">Transport (Bus/Train/Air)</span>
          </div>
        </div>
      </div>
    </div>
  )
}