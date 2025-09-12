// src/app/sysadmin/routes/add/components/HybridLocationSelector.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface LocationData {
  name: string;
  coordinates: [number, number];
  address: string;
}

interface HybridLocationSelectorProps {
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

// Common Sri Lankan locations database
const sriLankanLocations = [
  { name: "Colombo Fort", address: "Fort, Colombo 01, Western Province, Sri Lanka", coordinates: [79.8612, 6.9334] },
  { name: "Kandy", address: "Kandy, Central Province, Sri Lanka", coordinates: [80.6337, 7.2906] },
  { name: "Galle", address: "Galle, Southern Province, Sri Lanka", coordinates: [80.2170, 6.0329] },
  { name: "Negombo", address: "Negombo, Western Province, Sri Lanka", coordinates: [79.8358, 7.2084] },
  { name: "Anuradhapura", address: "Anuradhapura, North Central Province, Sri Lanka", coordinates: [80.4037, 8.3114] },
  { name: "Polonnaruwa", address: "Polonnaruwa, North Central Province, Sri Lanka", coordinates: [81.0014, 7.9403] },
  { name: "Trincomalee", address: "Trincomalee, Eastern Province, Sri Lanka", coordinates: [81.2335, 8.5874] },
  { name: "Batticaloa", address: "Batticaloa, Eastern Province, Sri Lanka", coordinates: [81.7981, 7.7172] },
  { name: "Jaffna", address: "Jaffna, Northern Province, Sri Lanka", coordinates: [80.0255, 9.6615] },
  { name: "Matara", address: "Matara, Southern Province, Sri Lanka", coordinates: [80.5550, 5.9549] },
  { name: "Ratnapura", address: "Ratnapura, Sabaragamuwa Province, Sri Lanka", coordinates: [80.4037, 6.6828] },
  { name: "Kurunegala", address: "Kurunegala, North Western Province, Sri Lanka", coordinates: [80.3647, 7.4867] },
  { name: "Badulla", address: "Badulla, Uva Province, Sri Lanka", coordinates: [81.0550, 6.9934] },
  { name: "Monaragala", address: "Monaragala, Uva Province, Sri Lanka", coordinates: [81.3510, 6.8728] },
  { name: "Puttalam", address: "Puttalam, North Western Province, Sri Lanka", coordinates: [79.8283, 8.0362] },
  { name: "Kegalle", address: "Kegalle, Sabaragamuwa Province, Sri Lanka", coordinates: [80.3464, 7.2513] },
  { name: "Kalutara", address: "Kalutara, Western Province, Sri Lanka", coordinates: [79.9553, 6.5854] },
  { name: "Gampaha", address: "Gampaha, Western Province, Sri Lanka", coordinates: [80.0176, 7.0873] },
  { name: "Nuwara Eliya", address: "Nuwara Eliya, Central Province, Sri Lanka", coordinates: [80.7718, 6.9497] },
  { name: "Ella", address: "Ella, Uva Province, Sri Lanka", coordinates: [81.0462, 6.8670] },
  { name: "Sigiriya", address: "Sigiriya, Central Province, Sri Lanka", coordinates: [80.7603, 7.9568] },
  { name: "Dambulla", address: "Dambulla, Central Province, Sri Lanka", coordinates: [80.6512, 7.8731] },
  { name: "Bentota", address: "Bentota, Southern Province, Sri Lanka", coordinates: [80.0021, 6.4256] },
  { name: "Hikkaduwa", address: "Hikkaduwa, Southern Province, Sri Lanka", coordinates: [80.0983, 6.1418] },
  { name: "Mirissa", address: "Mirissa, Southern Province, Sri Lanka", coordinates: [80.4585, 5.9487] },
  { name: "Unawatuna", address: "Unawatuna, Southern Province, Sri Lanka", coordinates: [80.2493, 6.0108] },
  { name: "Arugam Bay", address: "Arugam Bay, Eastern Province, Sri Lanka", coordinates: [81.8344, 6.8402] },
  { name: "Kottawa", address: "Kottawa, Western Province, Sri Lanka", coordinates: [79.9739, 6.9147] },
  { name: "Maharagama", address: "Maharagama, Western Province, Sri Lanka", coordinates: [79.9275, 6.8448] },
  { name: "Nugegoda", address: "Nugegoda, Western Province, Sri Lanka", coordinates: [79.8990, 6.8748] },
  { name: "Mount Lavinia", address: "Mount Lavinia, Western Province, Sri Lanka", coordinates: [79.8638, 6.8389] },
  { name: "Moratuwa", address: "Moratuwa, Western Province, Sri Lanka", coordinates: [79.8816, 6.7737] },
  { name: "Panadura", address: "Panadura, Western Province, Sri Lanka", coordinates: [79.9073, 6.7132] },
  { name: "Homagama", address: "Homagama, Western Province, Sri Lanka", coordinates: [80.0021, 6.8448] },
  { name: "Kesbewa", address: "Kesbewa, Western Province, Sri Lanka", coordinates: [79.9275, 6.8069] },
  { name: "Padukka", address: "Padukka, Western Province, Sri Lanka", coordinates: [80.0915, 6.8448] },
  { name: "Kottawa Bus Stand", address: "Kottawa Bus Stand, Kottawa, Western Province, Sri Lanka", coordinates: [79.9739, 6.8276] },
  { name: "Maharagama Bus Stand", address: "Maharagama Bus Stand, Maharagama, Western Province, Sri Lanka", coordinates: [79.9275, 6.8448] },
  { name: "Nugegoda Bus Stand", address: "Nugegoda Bus Stand, Nugegoda, Western Province, Sri Lanka", coordinates: [79.8990, 6.8748] },
  { name: "Colombo Central Bus Stand", address: "Central Bus Stand, Pettah, Colombo, Western Province, Sri Lanka", coordinates: [79.8553, 6.9388] },
];

export default function HybridLocationSelector({ 
  title, 
  onLocationSelect, 
  selectedLocation, 
  theme 
}: HybridLocationSelectorProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);

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
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        setIsGoogleMapsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsGoogleMapsLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current) return;

    const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
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

    // Add click listener to map
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Use reverse geocoding if available, otherwise create generic location
      if (window.google?.maps?.Geocoder) {
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
          } else {
            // Fallback if geocoding fails
            const location: LocationData = {
              name: 'Selected Location',
              coordinates: [lng, lat],
              address: `Selected Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            };
            
            setSearchValue(location.address);
            onLocationSelect(location);
            updateMarker(lat, lng, mapInstance);
            setShowSuggestions(false);
          }
        });
      } else {
        // Fallback if geocoder not available
        const location: LocationData = {
          name: 'Selected Location',
          coordinates: [lng, lat],
          address: `Selected Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        };
        
        setSearchValue(location.address);
        onLocationSelect(location);
        updateMarker(lat, lng, mapInstance);
        setShowSuggestions(false);
      }
    });

    // Set initial location if provided
    if (selectedLocation && selectedLocation.coordinates[0] !== 0 && selectedLocation.coordinates[1] !== 0) {
      const [lng, lat] = selectedLocation.coordinates;
      mapInstance.setCenter({ lat, lng });
      updateMarker(lat, lng, mapInstance);
      setSearchValue(selectedLocation.address);
    }
  }, [isGoogleMapsLoaded, theme]);

  const updateMarker = (lat: number, lng: number, mapInstance: any) => {
    // Remove existing marker completely
    if (marker) {
      try {
        marker.setMap(null);
        marker.setVisible(false);
      } catch (error) {
        console.log('Error removing previous marker:', error);
      }
    }

    // Create new marker
    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      title: title,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      }
    });

    setMarker(newMarker);
  };

  const searchForSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Use Google Maps Places API for real location search
    if (window.google?.maps?.places?.AutocompleteService) {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
        types: ['geocode'], // All geographic locations
      }, (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const mappedSuggestions = predictions.slice(0, 5).map((prediction: any) => ({
            name: prediction.structured_formatting.main_text,
            address: prediction.description,
            place_id: prediction.place_id
          }));
          setSuggestions(mappedSuggestions);
          setShowSuggestions(true);
        } else {
          // Fallback to minimal hardcoded locations only if Google Places fails
          const filtered = sriLankanLocations.filter(location =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.address.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 3);
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      });
    } else {
      // Fallback to minimal hardcoded locations if Places API not available
      const filtered = sriLankanLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    // If it's from Google Places API (has place_id), get real coordinates
    if (suggestion.place_id && window.google?.maps?.places?.PlacesService) {
      const service = new window.google.maps.places.PlacesService(map);
      
      service.getDetails({
        placeId: suggestion.place_id,
        fields: ['name', 'formatted_address', 'geometry']
      }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location: LocationData = {
            name: place.name || suggestion.name,
            coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
            address: place.formatted_address || suggestion.address
          };
          
          setSearchValue(location.address);
          onLocationSelect(location);
          setShowSuggestions(false);

          // Update map with real coordinates
          if (map) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat, lng });
            map.setZoom(15);
            updateMarker(lat, lng, map);
          }
        }
      });
    } else {
      // Fallback for hardcoded locations
      const location: LocationData = {
        name: suggestion.name,
        coordinates: suggestion.coordinates || [79.8612, 6.9271], // Default to Colombo
        address: suggestion.address
      };
      
      setSearchValue(suggestion.address);
      onLocationSelect(location);
      setShowSuggestions(false);

      // Update map if loaded
      if (map && suggestion.coordinates) {
        const [lng, lat] = suggestion.coordinates;
        map.setCenter({ lat, lng });
        map.setZoom(15);
        updateMarker(lat, lng, map);
      }
    }
  };

  const handleManualSearch = () => {
    if (!searchValue.trim()) return;

    // Use Google Places Text Search for manual search
    if (window.google?.maps?.places?.PlacesService) {
      const service = new window.google.maps.places.PlacesService(map);
      
      service.textSearch({
        query: searchValue + ', Sri Lanka',
        fields: ['name', 'formatted_address', 'geometry']
      }, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0];
          const location: LocationData = {
            name: place.name || searchValue,
            coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
            address: place.formatted_address
          };
          
          setSearchValue(location.address);
          onLocationSelect(location);
          setShowSuggestions(false);

          // Update map with real coordinates
          if (map) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat, lng });
            map.setZoom(15);
            updateMarker(lat, lng, map);
          }
        } else {
          // Try minimal hardcoded locations as fallback
          const exactMatch = sriLankanLocations.find(location =>
            location.name.toLowerCase() === searchValue.toLowerCase()
          );

          if (exactMatch) {
            handleSuggestionSelect(exactMatch);
          } else {
            alert('Location not found. Please try a different search term or click on the map.');
          }
        }
      });
    } else {
      // Fallback to minimal hardcoded search if Google Places not available
      const exactMatch = sriLankanLocations.find(location =>
        location.name.toLowerCase() === searchValue.toLowerCase()
      );

      if (exactMatch) {
        handleSuggestionSelect(exactMatch);
      } else {
        alert('Location not found. Please try a different search term or click on the map.');
      }
    }
  };

  const handleClearLocation = () => {
    // Clear the form data
    const emptyLocation: LocationData = {
      name: '',
      coordinates: [0, 0],
      address: ''
    };
    
    setSearchValue('');
    onLocationSelect(emptyLocation);
    setShowSuggestions(false);
    
    // Force remove map marker
    if (marker) {
      try {
        marker.setMap(null);
        marker.setVisible(false);
      } catch (error) {
        console.log('Error removing marker:', error);
      }
      setMarker(null);
    }
    
    // Reset map to default center and clear any existing markers
    if (map) {
      map.setCenter({ lat: 6.9271, lng: 79.8612 });
      map.setZoom(10);
      
      // Force refresh the map to ensure marker is gone
      window.google?.maps?.event?.trigger(map, 'resize');
    }
  };

  return (
    <div style={{
      backgroundColor: currentTheme.glassPanelBg,
      padding: '2rem',
      borderRadius: '0.75rem',
      border: currentTheme.glassPanelBorder,
      backdropFilter: 'blur(12px)',
      marginBottom: '2rem'
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
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Type Kottawa, Colombo, Kandy, etc..."
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
                    key={index}
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
                      {suggestion.name}
                    </div>
                    <div style={{
                      color: currentTheme.textSecondary,
                      fontSize: '0.75rem'
                    }}>
                      {suggestion.address}
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
          {(selectedLocation && selectedLocation.name) && (
            <button
              type="button"
              onClick={handleClearLocation}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Clear selected location"
            >
              <XMarkIcon width={16} height={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '300px',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: currentTheme.inputBorder,
          backgroundColor: currentTheme.inputBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        {!isGoogleMapsLoaded && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #3b82f6',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
              Loading interactive map...
            </p>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && selectedLocation.name && (
        <div style={{
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

      <div style={{ 
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: currentTheme.inputBg,
        border: currentTheme.inputBorder,
        borderRadius: '0.5rem'
      }}>
        <h4 style={{ 
          color: currentTheme.textPrimary, 
          fontSize: '0.875rem', 
          margin: '0 0 0.5rem 0',
          fontWeight: '600'
        }}>
          📍 How to get accurate coordinates:
        </h4>
        <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary, lineHeight: '1.4' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>🔍 Best:</strong> Type location name (uses real Google Maps data)
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>🖱️ Accurate:</strong> Click directly on the map at the exact spot
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>⚠️ Avoid:</strong> Using old/hardcoded coordinates - they may be wrong!
          </div>
          <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: currentTheme.textSecondary }}>
            {isGoogleMapsLoaded ? 
              'Map is ready - search or click for precise location' : 
              'Loading map... Please wait'
            }
          </div>
        </div>
      </div>
    </div>
  );
}