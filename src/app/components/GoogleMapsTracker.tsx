// src/components/GoogleMapsTracker.tsx - PROFESSIONAL REAL-TIME VEHICLE TRACKING
"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS FOR VEHICLE DATA ---
interface VehicleLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

interface OperationalInfo {
  status?: string;
  driverInfo?: { driverName?: string };
  delays?: { currentDelay?: number; reason?: string };
}

interface PassengerLoad {
  currentCapacity?: number;
  maxCapacity?: number;
  loadPercentage?: number;
}

interface RouteProgress {
  progressPercentage?: number;
  nextStopETA?: string | number | Date;
  nextStop?: string;
}

interface Vehicle {
  vehicleId: string;
  vehicleNumber?: string;
  location: VehicleLocation;
  operationalInfo?: OperationalInfo;
  passengerLoad?: PassengerLoad;
  routeProgress?: RouteProgress;
  timestamp?: string | number | Date;
}

// --- ROUTE DATA TYPES ---
interface RouteLocation {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

interface RouteWaypoint {
  name: string;
  coordinates: [number, number];
  order: number;
  address?: string;
}

interface RouteData {
  _id: string;
  name: string;
  routeId: string;
  startLocation: RouteLocation;
  endLocation: RouteLocation;
  waypoints?: RouteWaypoint[];
  distance?: number;
  estimatedDuration?: number;
  status: string;
  approvalStatus: string;
}

declare global {
  interface Window {
    google: any;
  }
}

// SIMPLE VEHICLE MARKER CREATION
const createVehicleMarker = (
  map: any, 
  vehicle: Vehicle, 
  onMarkerClick: (vehicle: Vehicle) => void
) => {
  const heading = vehicle.location?.heading || 0;

  // Create simple HTML marker
  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div class="vehicle-marker" style="
      position: relative;
      transform: rotate(${heading}deg);
      transition: all 0.3s ease;
      cursor: pointer;
    ">
      <div style="
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      ">
        🚌
      </div>
    </div>
  `;

  // Create advanced marker
  const marker = new window.google.maps.marker.AdvancedMarkerElement({
    position: { lat: vehicle.location.latitude, lng: vehicle.location.longitude },
    map: map,
    title: `${vehicle.vehicleNumber || vehicle.vehicleId} - ${status}`,
    content: markerElement
  });

  // Add click listener
  marker.addListener('click', () => onMarkerClick(vehicle));

  // Add hover effects
  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = `rotate(${heading}deg) scale(1.1)`;
  });
  
  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = `rotate(${heading}deg) scale(1)`;
  });

  return marker;
};

// ROUTE MARKERS
const createRouteMarker = (map: any, location: RouteLocation | RouteWaypoint, type: 'start' | 'end' | 'waypoint') => {
  const colors = {
    start: '#10B981',
    end: '#EF4444',
    waypoint: '#3B82F6'
  };
  
  const labels = {
    start: 'A',
    end: 'B',
    waypoint: (location as RouteWaypoint).order?.toString() || '?'
  };

  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: ${type === 'waypoint' ? '36px' : '44px'};
        height: ${type === 'waypoint' ? '36px' : '44px'};
        background: linear-gradient(135deg, ${colors[type]}, ${colors[type]}CC);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${type === 'waypoint' ? '14px' : '16px'};
        font-weight: bold;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        cursor: pointer;
      ">
        ${labels[type]}
      </div>
      <div style="
        position: absolute;
        top: ${type === 'waypoint' ? '40px' : '48px'};
        background: ${colors[type]};
        color: white;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 9px;
        font-weight: 600;
        white-space: nowrap;
      ">
        ${type.toUpperCase()}
      </div>
    </div>
  `;

  return new window.google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.coordinates[1], lng: location.coordinates[0] },
    map: map,
    title: `${type}: ${location.name}`,
    content: markerElement
  });
};

// SIMPLE INFO WINDOW COMPONENT
const createVehicleInfoWindow = (vehicle: Vehicle) => {
  return `
    <div style="
      min-width: 280px;
      font-family: system-ui;
      line-height: 1.5;
      padding: 8px;
    ">
      <div style="
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 12px;
        margin-bottom: 16px;
      ">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          🚌 ${vehicle.vehicleNumber || vehicle.vehicleId}
        </h3>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 16px;
      ">
        <div style="text-align: center;">
          <div style="
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          ">Speed</div>
          <div style="
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          ">${(vehicle.location?.speed || 0).toFixed(1)}</div>
          <div style="
            font-size: 12px;
            color: #6b7280;
          ">km/h</div>
        </div>
        
        <div style="text-align: center;">
          <div style="
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          ">Heading</div>
          <div style="
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          ">${(vehicle.location?.heading || 0).toFixed(0)}°</div>
          <div style="
            font-size: 12px;
            color: #6b7280;
          ">direction</div>
        </div>
      </div>
      
      <div style="
        font-size: 12px;
        color: #6b7280;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
      ">
        <span>📍 ${vehicle.location?.latitude?.toFixed(4) || 'N/A'}, ${vehicle.location?.longitude?.toFixed(4) || 'N/A'}</span>
        <span>🕒 ${new Date(vehicle.timestamp || Date.now()).toLocaleTimeString()}</span>
      </div>
    </div>
  `;
};

// MAIN GOOGLE MAPS TRACKER COMPONENT
interface GoogleMapsTrackerProps {
  routes?: RouteData[];
  selectedRoute?: string | null;
  height?: string;
  theme?: 'light' | 'dark';
}

const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  routes = [],
  selectedRoute = null,
  height = '70vh',
  theme = 'light'
}) => {
  const [map, setMap] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleMarkers, setVehicleMarkers] = useState<Map<string, any>>(new Map());
  const [routeMarkers, setRouteMarkers] = useState<any[]>([]);
  const [routePolylines, setRoutePolylines] = useState<any[]>([]);
  const [trafficLayer, setTrafficLayer] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Dark theme map styles
  const darkMapStyles = [
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
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    }
  ];

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('🗺️ Google Maps API loaded successfully');
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const sriLankaCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: sriLankaCenter,
      zoom: 12,
      styles: theme === 'dark' ? darkMapStyles : [],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapId: theme === 'dark' ? 'dark_tracking_map' : 'light_tracking_map'
    });

    // Add traffic layer
    const traffic = new window.google.maps.TrafficLayer();
    traffic.setMap(mapInstance);
    setTrafficLayer(traffic);

    // Initialize directions service and renderer
    const directionsServ = new window.google.maps.DirectionsService();
    const directionsRend = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll use our custom markers
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 6
      }
    });
    directionsRend.setMap(mapInstance);
    setDirectionsService(directionsServ);
    setDirectionsRenderer(directionsRend);

    // Create info window
    const infoWin = new window.google.maps.InfoWindow();
    setInfoWindow(infoWin);

    setMap(mapInstance);
    console.log('🗺️ Google Maps initialized with traffic layer and directions');
  }, [isLoaded, theme]);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    if (vehiclesLoading) return;
    
    setVehiclesLoading(true);
    try {
      console.log('🚌 Fetching vehicles from backend...');
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const routeFilter = selectedRoute && selectedRoute !== 'all' ? `?routeId=${selectedRoute}` : '';
      const response = await fetch(`${baseURL}/api/tracking/live${routeFilter}`);
      const data = await response.json();
      
      console.log('🚌 Vehicle data received:', data);
      
      if (data.vehicles && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
        console.log(`✅ Loaded ${data.vehicles.length} vehicles`);
      } else {
        console.log('❌ No vehicles found in response');
        setVehicles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, [vehiclesLoading, selectedRoute]);

  // Handle vehicle marker click
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    if (!infoWindow || !map) return;

    const content = createVehicleInfoWindow(vehicle);
    infoWindow.setContent(content);
    infoWindow.setPosition({
      lat: vehicle.location.latitude,
      lng: vehicle.location.longitude
    });
    infoWindow.open(map);
  }, [infoWindow, map]);

  // Update vehicle markers
  useEffect(() => {
    if (!map) return;

    console.log(`🚌 Updating ${vehicles.length} vehicle markers`);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) marker.setMap(null);
    });
    markersRef.current.clear();

    // Create new markers
    vehicles.forEach(vehicle => {
      if (vehicle.location?.latitude && vehicle.location?.longitude) {
        try {
          const marker = createVehicleMarker(map, vehicle, handleVehicleClick);
          markersRef.current.set(vehicle.vehicleId, marker);
        } catch (error) {
          console.error('Error creating marker for vehicle:', vehicle.vehicleId, error);
        }
      }
    });

    setVehicleMarkers(new Map(markersRef.current));
  }, [map, vehicles, handleVehicleClick]);

  // Initial auto-center (only once when vehicles first load)
  const [hasInitialCentered, setHasInitialCentered] = useState(false);
  useEffect(() => {
    if (!map || !vehicles.length || hasInitialCentered) return;

    console.log('🎯 Initial centering on vehicles');
    
    if (vehicles.length === 1) {
      const vehicle = vehicles[0];
      map.setCenter({ lat: vehicle.location.latitude, lng: vehicle.location.longitude });
      map.setZoom(14); // Less aggressive zoom
    } else if (vehicles.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      vehicles.forEach(vehicle => {
        bounds.extend({ lat: vehicle.location.latitude, lng: vehicle.location.longitude });
      });
      map.fitBounds(bounds);
    }
    
    setHasInitialCentered(true);
  }, [map, vehicles, hasInitialCentered]);

  // Update route markers (show ONLY selected route's start/end points)
  useEffect(() => {
    if (!map || !routes.length) {
      // Clear everything if no routes
      routeMarkers.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
      });
      routePolylines.forEach(polyline => {
        if (polyline.setMap) polyline.setMap(null);
      });
      setRouteMarkers([]);
      setRoutePolylines([]);
      return;
    }

    // Clear existing route markers and polylines
    routeMarkers.forEach(marker => {
      if (marker.setMap) marker.setMap(null);
    });
    routePolylines.forEach(polyline => {
      if (polyline.setMap) polyline.setMap(null);
    });

    const newRouteMarkers: any[] = [];
    const newRoutePolylines: any[] = [];
    
    // FILTER: Show only selected route's start/end points, or all if 'all' selected
    const routesToShow = selectedRoute && selectedRoute !== 'all' 
      ? routes.filter(route => route._id === selectedRoute)
      : routes;

    routesToShow.forEach((route, routeIndex) => {
      // Start marker
      if (route.startLocation?.coordinates) {
        const startMarker = createRouteMarker(map, route.startLocation, 'start');
        newRouteMarkers.push(startMarker);
      }

      // End marker
      if (route.endLocation?.coordinates) {
        const endMarker = createRouteMarker(map, route.endLocation, 'end');
        newRouteMarkers.push(endMarker);
      }

      // Skip waypoints and polylines - only show start/end markers
    });

    setRouteMarkers(newRouteMarkers);
    // No polylines created anymore
    setRoutePolylines([]);
  }, [map, routes, selectedRoute]);

  // Initial fetch and periodic updates
  useEffect(() => {
    if (!map) return;

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [map, fetchVehicles]);

  // Route selection change
  useEffect(() => {
    if (map) {
      fetchVehicles();
    }
  }, [selectedRoute, map, fetchVehicles]);

  if (!isLoaded) {
    return (
      <div style={{
        height,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <div style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            🗺️ Loading Google Maps...
          </div>
          <div style={{
            color: theme === 'dark' ? '#6b7280' : '#9ca3af',
            fontSize: '14px',
            marginTop: '8px'
          }}>
            Preparing real-time vehicle tracking
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Map status panel */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: vehicles.length > 0 ? '#10B981' : '#6B7280',
            borderRadius: '50%'
          }}></div>
          Live Tracking
        </div>
        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}>
          🚌 {vehicles.length} vehicles active
        </div>
        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}>
          🚦 Traffic layer enabled
        </div>
        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}>
          📍 {routeMarkers.length} route points
        </div>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px'
        }}
      />

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default GoogleMapsTracker;