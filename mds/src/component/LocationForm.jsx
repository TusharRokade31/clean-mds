import { 
  TextField, Button, Grid, Typography, 
  FormHelperText, Autocomplete 
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function LocationForm({ formData, onChange, errors, onSave }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Add caching states
  const [geocodeCache, setGeocodeCache] = useState(new Map());
  const [reverseGeocodeCache, setReverseGeocodeCache] = useState(new Map());
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState('');
  
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Helper function to create cache key for coordinates
  const createCoordKey = (lat, lng) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

  // Helper function to create cache key for address
  const createAddressKey = (address) => address.toLowerCase().trim();

  const initializeMap = (lat = 19.238068, lng = 72.852251) => {
    if (mapRef.current && window.google && isMapLoaded) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
      });

      // Add marker drag listener
      markerInstance.addListener('dragend', (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        reverseGeocode(newLat, newLng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    
    const coordKey = createCoordKey(lat, lng);
    
    // Check cache first
    if (reverseGeocodeCache.has(coordKey)) {
      console.log('Using cached reverse geocode result for:', coordKey);
      const cachedResult = reverseGeocodeCache.get(coordKey);
      
      // Update form with cached data
      onChange('street', cachedResult.street);
      onChange('city', cachedResult.city);
      onChange('state', cachedResult.state);
      onChange('country', cachedResult.country);
      onChange('postalCode', cachedResult.postalCode);
      onChange('coordinates', { lat, lng });
      return;
    }
    
    console.log('Making reverse geocode API call for:', coordKey);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        let streetNumber = '';
        let route = '';
        let locality = '';
        let administrativeAreaLevel1 = '';
        let country = '';
        let postalCode = '';

        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('locality') || types.includes('sublocality_level_1')) {
            locality = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            administrativeAreaLevel1 = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });

        const street = `${streetNumber} ${route}`.trim();
        
        // Cache the result
        const cacheData = {
          street: street || locality,
          city: locality,
          state: administrativeAreaLevel1,
          country: country,
          postalCode: postalCode
        };
        
        setReverseGeocodeCache(prev => new Map(prev.set(coordKey, cacheData)));
        
        // Update form
        onChange('street', cacheData.street);
        onChange('city', cacheData.city);
        onChange('state', cacheData.state);
        onChange('country', cacheData.country);
        onChange('postalCode', cacheData.postalCode);
        onChange('coordinates', { lat, lng });
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);

    // Use high accuracy options for better location precision
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got location:', latitude, longitude);
        
        // Update map center and marker if they exist
        if (map && marker && window.google) {
          const newPosition = new window.google.maps.LatLng(latitude, longitude);
          map.setCenter(newPosition);
          map.setZoom(18); // Zoom in for better accuracy
          marker.setPosition(newPosition);
        } else {
          // If map isn't ready, initialize with current location
          initializeMap(latitude, longitude);
        }
        
        // Reverse geocode to get address
        reverseGeocode(latitude, longitude);
        onChange('coordinates', { lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'Unable to get your current location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please ensure location services are enabled.';
            break;
        }
        alert(errorMessage);
      },
      options
    );
  };

  // Load Google Maps API
  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => {
      console.log('Google Maps API loaded');
      setIsMapLoaded(true);
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
    });
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (isMapLoaded && window.google) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [isMapLoaded]);

  // Initialize autocomplete when map is loaded
  useEffect(() => {
    if (isMapLoaded && searchInputRef.current && !autocompleteRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ['establishment', 'geocode'],
          fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
        }
      );

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  }, [isMapLoaded]);

  // Enhanced geocoding with caching
  useEffect(() => {
    // Function to geocode address and update map
    const geocodeAndUpdateMap = () => {
      if (!window.google || !map || !marker) return;
      
      // Build address string from form data
      const addressParts = [
        formData?.houseName,
        formData?.street,
        formData?.city,
        formData?.state,
        formData?.postalCode,
        formData?.country
      ].filter(part => part && part.trim() !== '');
      
      if (addressParts.length === 0) return;
      
      const fullAddress = addressParts.join(', ');
      const addressKey = createAddressKey(fullAddress);
      
      // Check if this is the same address we just geocoded
      if (lastGeocodedAddress === addressKey) {
        console.log('Skipping geocoding - same address as last request');
        return;
      }
      
      // Check cache first
      if (geocodeCache.has(addressKey)) {
        console.log('Using cached geocode result for:', fullAddress);
        const cachedCoords = geocodeCache.get(addressKey);
        
        // Update map center and marker position
        map.setCenter({ lat: cachedCoords.lat, lng: cachedCoords.lng });
        map.setZoom(16);
        marker.setPosition({ lat: cachedCoords.lat, lng: cachedCoords.lng });
        
        // Update coordinates in form data
        onChange('coordinates', { lat: cachedCoords.lat, lng: cachedCoords.lng });
        
        setLastGeocodedAddress(addressKey);
        return;
      }
      
      console.log('Making geocode API call for:', fullAddress);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          // Cache the result
          setGeocodeCache(prev => new Map(prev.set(addressKey, { lat, lng })));
          setLastGeocodedAddress(addressKey);
          
          // Update map center and marker position
          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });
          
          // Update coordinates in form data
          onChange('coordinates', { lat, lng });
          
          console.log('Map updated to:', lat, lng, 'for address:', fullAddress);
        } else {
          console.log('Geocoding failed:', status);
        }
      });
    };

    // Debounce the geocoding to avoid too many API calls
    const timeoutId = setTimeout(() => {
      geocodeAndUpdateMap();
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData?.houseName, formData?.street, formData?.city, formData?.state, formData?.postalCode, formData?.country, map, marker, geocodeCache, lastGeocodedAddress]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place.address_components) {
      console.log('No address components found');
      return;
    }

    let lat = null;
    let lng = null;

    // Update map if geometry is available
    if (place.geometry && map && marker) {
      const location = place.geometry.location;
      lat = location.lat();
      lng = location.lng();
      
      // Update map center and marker position
      map.setCenter({ lat, lng });
      map.setZoom(16); // Good zoom level for location details
      marker.setPosition({ lat, lng });
      
      console.log('Updated map to:', lat, lng);
    }

    // Extract address components
    const addressComponents = place.address_components;
    let streetNumber = '';
    let route = '';
    let locality = '';
    let administrativeAreaLevel1 = '';
    let country = '';
    let postalCode = '';

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality') || types.includes('sublocality_level_1')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        administrativeAreaLevel1 = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });

    // Auto-fill the form fields
    const street = `${streetNumber} ${route}`.trim();
    
    // Update form data
    onChange('street', street || locality);
    onChange('city', locality);
    onChange('state', administrativeAreaLevel1);
    onChange('country', country);
    onChange('postalCode', postalCode);

    if (lat !== null && lng !== null) {
      onChange('coordinates', { lat, lng });
      
      // Cache the place selection result
      const fullAddress = place.formatted_address || [street, locality, administrativeAreaLevel1, country, postalCode].filter(Boolean).join(', ');
      const addressKey = createAddressKey(fullAddress);
      setGeocodeCache(prev => new Map(prev.set(addressKey, { lat, lng })));
      setLastGeocodedAddress(addressKey);
    }
    
    // Clear the search input
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // Mock states data (keeping for fallback)
  useEffect(() => {
    setStates(['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan']);
  }, []);
  
  // Fetch cities when state changes (keeping for fallback)
  useEffect(() => {
    if (formData?.state) {
      const stateCities = {
        'Delhi': ['New Delhi', 'Gurgaon'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
        'Karnataka': ['Bangalore', 'Mysore'],
        'Tamil Nadu': ['Chennai', 'Coimbatore'],
        'Rajasthan': ['Jaipur', 'Jodhour', 'Udaipur']
      };
      
      setCities(stateCities[formData?.state] || []);
    } else {
      setCities([]);
    }
  }, [formData?.state]);

  return (
    <div>
      <p className='text-2xl font-bold'>
        Property Location Details
      </p>
      <p>
        Please fill in the location details of your property.
      </p>
      
      {/* Google Maps Search */}
      <Grid sx={{mt: 3}} container spacing={2}>
        <Grid item size={{xs:6}}>
          <div style={{ marginBottom: '16px' }}>
            <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
              Search for your location:
            </Typography>
            <TextField
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e2e2e",
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "#2e2e2e",
                    "&.Mui-focused": {
                      color: "secondary.main",
                    },
                  },
                },
              }}
              fullWidth
              inputRef={searchInputRef}
              placeholder="Search here"
              variant="outlined"
              disabled={!isMapLoaded}
              helperText={!isMapLoaded ? "Loading Google Maps..." : "Start typing to search for your location"}
            />
          </div>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ 
              cursor: isGettingLocation ? 'wait' : 'pointer',
              opacity: isGettingLocation ? 0.6 : 1
            }}
            onClick={!isGettingLocation ? getCurrentLocation : undefined}
          >
            {isGettingLocation ? 'Getting Location...' : 'Or Use My Current Location'}
          </Typography>
          
          <Grid sx={{mt: 3}} container spacing={3}>
            {/* Your existing form fields */}
            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="House/Building/Apartment No."
                value={formData?.houseName || ''}
                onChange={(e) => onChange('houseName', e.target.value)}
                error={!!errors?.houseName}
                helperText={errors?.houseName}
              />
            </Grid>
            
            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="Locality/Area/Street/Sector"
                value={formData?.street || ''}
                onChange={(e) => onChange('street', e.target.value)}
                error={!!errors?.street}
                helperText={errors?.street}
                InputProps={{
                  readOnly: false,
                }}
              />
            </Grid>
            
            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="Pincode"
                value={formData?.postalCode || ''}
                onChange={(e) => onChange('postalCode', e.target.value)}
                error={!!errors?.postalCode}
                helperText={errors?.postalCode}
              />
            </Grid>
            
            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="Country"
                value={formData?.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                error={!!errors?.country}
                helperText={errors?.country}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="State"
                value={formData?.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                error={!!errors?.state}
                helperText={errors?.state}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            
            <Grid item size={{xs:6}}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",
                      },
                    },
                  },
                }}
                fullWidth
                label="City"
                value={formData?.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                error={!!errors?.city}
                helperText={errors?.city}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item size={{xs:6}}>
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '400px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '16px'
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}