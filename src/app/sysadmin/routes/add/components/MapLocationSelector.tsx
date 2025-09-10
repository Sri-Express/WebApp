// src/app/sysadmin/routes/add/components/MapLocationSelector.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface LocationData {
  name: string;
  coordinates: [number, number];
  address: string;
}

interface MapLocationSelectorProps {
  title: string;
  onLocationSelect: (location: LocationData) => void;
  selectedLocation?: LocationData;
  theme: 'light' | 'dark';
}

declare global {
  interface Window {
    google: any;
  }
}

export default function MapLocationSelector({ 
  title, 
  onLocationSelect, 
  selectedLocation, 
  theme 
}: MapLocationSelectorProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placesService, setPlacesService] = useState<any>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const lightTheme = {
    inputBg: 'rgba(255, 255, 255, 0.8)',
    inputBorder: '1px solid rgba(209, 213, 219, 0.6)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
  };

  const darkTheme = {
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '1px solid rgba(75, 85, 99, 0.5)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
  };

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      // Remove any existing scripts first
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      styles: theme === 'dark' ? [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ] : [],
    });

    setMap(mapInstance);

    // Initialize Places Service for autocomplete
    const service = new window.google.maps.places.PlacesService(mapInstance);
    setPlacesService(service);

    // Add click listener to map
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location: LocationData = {
            name: results[0].address_components[0]?.long_name || 'Selected Location',
            coordinates: [lng, lat],
            address: results[0].formatted_address
          };
          
          setSearchValue(location.address);
          onLocationSelect(location);
          updateMarker(lat, lng, mapInstance);
          setShowSuggestions(false);
        }
      });
    });

    // Set initial location if provided
    if (selectedLocation && selectedLocation.coordinates[0] !== 0 && selectedLocation.coordinates[1] !== 0) {
      const [lng, lat] = selectedLocation.coordinates;
      mapInstance.setCenter({ lat, lng });
      updateMarker(lat, lng, mapInstance);
      setSearchValue(selectedLocation.address);
    }
  }, [isLoaded, theme]);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !searchInputRef.current || !map) return;

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      {
        componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        types: ['establishment', 'geocode']
      }
    );

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      const location: LocationData = {
        name: place.name || 'Selected Location',
        coordinates: [lng, lat],
        address: place.formatted_address || ''
      };

      setSearchValue(location.address);
      onLocationSelect(location);
      updateMarker(lat, lng, map);
      map.setCenter({ lat, lng });
      map.setZoom(15);
    });

    setAutocomplete(autocompleteInstance);
  }, [isLoaded, map]);

  const updateMarker = (lat: number, lng: number, mapInstance: any) => {
    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      title: title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    });

    setMarker(newMarker);
  };

  const searchForSuggestions = (query: string) => {
    if (!query.trim() || !isLoaded || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    
    service.getPlacePredictions({
      input: query,
      componentRestrictions: { country: 'lk' },
      types: ['establishment', 'geocode']
    }, (predictions: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (!placesService) return;

    const request = {
      placeId: suggestion.place_id,
      fields: ['name', 'formatted_address', 'geometry']
    };

    placesService.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        const location: LocationData = {
          name: place.name || suggestion.structured_formatting?.main_text || 'Selected Location',
          coordinates: [lng, lat],
          address: place.formatted_address
        };
        
        setSearchValue(place.formatted_address);
        onLocationSelect(location);
        updateMarker(lat, lng, map);
        map.setCenter({ lat, lng });
        map.setZoom(15);
        setShowSuggestions(false);
      }
    });
  };

  const handleManualSearch = () => {
    if (!searchValue.trim() || !map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ 
      address: searchValue,
      componentRestrictions: { country: 'LK' }
    }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        
        const location: LocationData = {
          name: results[0].address_components[0]?.long_name || 'Selected Location',
          coordinates: [lng, lat],
          address: results[0].formatted_address
        };
        
        onLocationSelect(location);
        updateMarker(lat, lng, map);
        map.setCenter({ lat, lng });
        map.setZoom(15);
        setShowSuggestions(false);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  };

  if (!isLoaded) {
    return (
      <div style={{
        backgroundColor: currentTheme.glassPanelBg,
        padding: '2rem',
        borderRadius: '0.75rem',
        border: currentTheme.glassPanelBorder,
        backdropFilter: 'blur(12px)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #3b82f6',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: currentTheme.textSecondary }}>Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: currentTheme.glassPanelBg,
      padding: '2rem',
      borderRadius: '0.75rem',
      border: currentTheme.glassPanelBorder,
      backdropFilter: 'blur(12px)',
    }}>
      <h2 style={{
        color: currentTheme.textPrimary,
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <MapPinIcon width={24} height={24} color="#3b82f6" />
        {title}
      </h2>

      {/* Search Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          color: currentTheme.textPrimary, 
          fontWeight: '500', 
          marginBottom: '0.5rem', 
          display: 'block' 
        }}>
          Search for location
        </label>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MagnifyingGlassIcon 
              width={20} 
              height={20} 
              color={currentTheme.textSecondary}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                searchForSuggestions(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualSearch();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Search for bus stands, stations, or addresses..."
              style={{
                width: '100%',
                backgroundColor: currentTheme.inputBg,
                border: currentTheme.inputBorder,
                borderRadius: showSuggestions ? '0.5rem 0.5rem 0 0' : '0.5rem',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                color: currentTheme.textPrimary,
                fontSize: '0.875rem',
                outline: 'none',
                position: 'relative',
                zIndex: 1
              }}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: currentTheme.inputBg,
                border: currentTheme.inputBorder,
                borderTop: 'none',
                borderRadius: '0 0 0.5rem 0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.place_id || index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < suggestions.length - 1 ? `1px solid ${currentTheme.inputBorder}` : 'none',
                      backgroundColor: currentTheme.inputBg,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.inputBg;
                    }}
                  >
                    <div style={{
                      color: currentTheme.textPrimary,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </div>
                    <div style={{
                      color: currentTheme.textSecondary,
                      fontSize: '0.75rem'
                    }}>
                      {suggestion.structured_formatting?.secondary_text || suggestion.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleManualSearch}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: currentTheme.inputBorder
        }}
      />

      {/* Selected Location Display */}
      {selectedLocation && selectedLocation.name && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: currentTheme.inputBg,
          border: currentTheme.inputBorder,
          borderRadius: '0.5rem'
        }}>
          <h4 style={{ 
            color: currentTheme.textPrimary, 
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            Selected Location:
          </h4>
          <p style={{ 
            color: currentTheme.textSecondary, 
            margin: '0 0 0.25rem 0',
            fontSize: '0.875rem'
          }}>
            <strong>Name:</strong> {selectedLocation.name}
          </p>
          <p style={{ 
            color: currentTheme.textSecondary, 
            margin: '0 0 0.25rem 0',
            fontSize: '0.875rem'
          }}>
            <strong>Address:</strong> {selectedLocation.address}
          </p>
          <p style={{ 
            color: currentTheme.textSecondary, 
            margin: '0',
            fontSize: '0.875rem'
          }}>
            <strong>Coordinates:</strong> {selectedLocation.coordinates[1].toFixed(6)}, {selectedLocation.coordinates[0].toFixed(6)}
          </p>
        </div>
      )}

      <p style={{ 
        color: currentTheme.textSecondary, 
        fontSize: '0.75rem', 
        marginTop: '0.5rem',
        textAlign: 'center'
      }}>
        Click on the map or search to select a location
      </p>
    </div>
  );
}