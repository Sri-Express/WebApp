// src/components/GoogleMapsTracker.tsx - PROFESSIONAL REAL-TIME VEHICLE TRACKING
"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { io, Socket } from 'socket.io-client';

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
  lastSeenMinutesAgo?: number;
  connectionStatus?: 'online' | 'recently_offline' | 'offline';
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

  // Determine color based on connection status
  const getStatusColor = () => {
    switch (vehicle.connectionStatus) {
      case 'online':
        return { bg: '#10B981', border: '#059669', label: 'Online' };
      case 'recently_offline':
        return { bg: '#F59E0B', border: '#D97706', label: 'Recently Offline' };
      case 'offline':
        return { bg: '#EF4444', border: '#DC2626', label: 'Offline' };
      default:
        return { bg: '#6B7280', border: '#4B5563', label: 'Unknown' };
    }
  };

  const statusColor = getStatusColor();

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
        background: linear-gradient(135deg, ${statusColor.bg}, ${statusColor.border});
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        ${vehicle.connectionStatus === 'offline' ? 'opacity: 0.7;' : ''}
      ">
        🚐
      </div>
      ${vehicle.lastSeenMinutesAgo !== undefined ? `
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background: ${statusColor.bg};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">
          ${vehicle.lastSeenMinutesAgo < 60 ? Math.round(vehicle.lastSeenMinutesAgo) : '60+'}
        </div>
      ` : ''}
    </div>
  `;

  // Get friendly status text
  const status = vehicle.operationalInfo?.status || 'unknown';
  const statusText = {
    'on_route': 'On Route',
    'at_stop': 'At Stop',
    'delayed': 'Delayed',
    'breakdown': 'Breakdown',
    'offline': 'Offline'
  }[status] || 'Unknown';

  // Create advanced marker
  const marker = new window.google.maps.marker.AdvancedMarkerElement({
    position: { lat: vehicle.location.latitude, lng: vehicle.location.longitude },
    map: map,
    title: `${vehicle.vehicleNumber || vehicle.vehicleId} - ${statusColor.label} ${vehicle.lastSeenMinutesAgo !== undefined ? `(${Math.round(vehicle.lastSeenMinutesAgo)}m ago)` : ''}`,
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

// UPDATE EXISTING VEHICLE MARKER WITHOUT RECREATING
const updateVehicleMarker = (marker: any, vehicle: Vehicle) => {
  // Update marker position
  const newPosition = { lat: vehicle.location.latitude, lng: vehicle.location.longitude };
  marker.position = newPosition;

  // Update marker content with new status
  const heading = vehicle.location?.heading || 0;
  
  // Determine color based on connection status
  const getStatusColor = () => {
    switch (vehicle.connectionStatus) {
      case 'online':
        return { bg: '#10B981', border: '#059669', label: 'Online' };
      case 'recently_offline':
        return { bg: '#F59E0B', border: '#D97706', label: 'Recently Offline' };
      case 'offline':
        return { bg: '#EF4444', border: '#DC2626', label: 'Offline' };
      default:
        return { bg: '#6B7280', border: '#4B5563', label: 'Unknown' };
    }
  };

  const statusColor = getStatusColor();

  // Update the marker's content element
  const markerElement = marker.content;
  if (markerElement) {
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
          background: linear-gradient(135deg, ${statusColor.bg}, ${statusColor.border});
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          ${vehicle.connectionStatus === 'offline' ? 'opacity: 0.7;' : ''}
        ">
          🚐
        </div>
        ${vehicle.lastSeenMinutesAgo !== undefined ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: ${statusColor.bg};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: bold;
          ">
            ${vehicle.lastSeenMinutesAgo < 60 ? Math.round(vehicle.lastSeenMinutesAgo) : '60+'}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Update marker title
  marker.title = `${vehicle.vehicleNumber || vehicle.vehicleId} - ${statusColor.label} ${vehicle.lastSeenMinutesAgo !== undefined ? `(${Math.round(vehicle.lastSeenMinutesAgo)}m ago)` : ''}`;

  console.log(`🔄 Updated marker for vehicle: ${vehicle.vehicleId} - ${statusColor.label}`);
};

// ROUTE MARKERS WITH PLACE NAMES
const createRouteMarker = (map: any, location: RouteLocation | RouteWaypoint, type: 'start' | 'end' | 'waypoint') => {
  const colors = {
    start: '#10B981',
    end: '#EF4444',
    waypoint: '#3B82F6'
  };
  
  const icons = {
    start: '🚏',
    end: '🏁',
    waypoint: '📍'
  };

  // Get a shortened version of the place name (max 12 characters)
  const getShortName = (name: string) => {
    if (name.length <= 12) return name;
    return name.substring(0, 10) + '..';
  };

  const shortName = getShortName(location.name);

  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
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
        font-size: ${type === 'waypoint' ? '16px' : '18px'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      ">
        ${icons[type]}
      </div>
      <div style="
        position: absolute;
        top: ${type === 'waypoint' ? '40px' : '48px'};
        background: ${colors[type]};
        color: white;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        min-width: 60px;
        text-align: center;
      ">
        ${shortName}
      </div>
    </div>
  `;

  const marker = new window.google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.coordinates[1], lng: location.coordinates[0] },
    map: map,
    title: `${type}: ${location.name}`,
    content: markerElement
  });

  // Add click listener to show full place name and address
  marker.addListener('click', () => {
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="
          font-family: system-ui;
          padding: 8px;
          min-width: 200px;
        ">
          <h4 style="
            margin: 0 0 8px 0;
            color: ${colors[type]};
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            ${icons[type]} ${location.name}
          </h4>
          <p style="
            margin: 0;
            color: #666;
            font-size: 12px;
            line-height: 1.4;
          ">
            ${(location as RouteLocation).address || 'Route waypoint'}
          </p>
          <div style="
            margin-top: 8px;
            padding: 4px 8px;
            background: ${colors[type]}22;
            border-radius: 4px;
            font-size: 10px;
            color: ${colors[type]};
            font-weight: 600;
            text-transform: uppercase;
          ">
            ${type === 'start' ? 'Starting Point' : type === 'end' ? 'Destination' : 'Waypoint'}
          </div>
        </div>
      `
    });
    infoWindow.open(map, marker);
  });

  return marker;
};

// USER-FRIENDLY INFO WINDOW COMPONENT
const createVehicleInfoWindow = (vehicle: Vehicle) => {
  const status = vehicle.operationalInfo?.status || 'unknown';
  const statusText = {
    'on_route': 'On Route',
    'at_stop': 'At Stop',
    'delayed': 'Delayed',
    'breakdown': 'Breakdown',
    'offline': 'Offline'
  }[status] || 'Unknown';

  const statusColor = {
    'on_route': '#10B981',
    'at_stop': '#3B82F6',
    'delayed': '#F59E0B',
    'breakdown': '#EF4444',
    'offline': '#6B7280'
  }[status] || '#6B7280';

  // Connection status info
  const getConnectionStatusDisplay = () => {
    if (vehicle.connectionStatus && vehicle.lastSeenMinutesAgo !== undefined) {
      const connectionColors = {
        'online': '#10B981',
        'recently_offline': '#F59E0B', 
        'offline': '#EF4444'
      };
      
      const connectionLabels = {
        'online': 'Online',
        'recently_offline': 'Recently Offline',
        'offline': 'Offline'
      };
      
      // Calculate actual last seen time
      const lastSeenTime = new Date(Date.now() - (vehicle.lastSeenMinutesAgo * 60 * 1000));
      
      return {
        color: connectionColors[vehicle.connectionStatus],
        label: connectionLabels[vehicle.connectionStatus],
        timeText: vehicle.lastSeenMinutesAgo < 1 ? 'Live now' : `${lastSeenTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}`
      };
    }
    return null;
  };

  const connectionStatus = getConnectionStatusDisplay();

  const currentLoad = vehicle.passengerLoad?.currentCapacity || 0;
  const maxCapacity = vehicle.passengerLoad?.maxCapacity || 50;
  const loadPercentage = Math.round((currentLoad / maxCapacity) * 100);

  return `
    <div style="
      min-width: 320px;
      font-family: system-ui;
      line-height: 1.5;
      padding: 12px;
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
          🚐 Bus ${vehicle.vehicleNumber || vehicle.vehicleId}
        </h3>
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        ">
          <div style="
            background: ${statusColor};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          ">
            ${statusText}
          </div>
          ${connectionStatus ? `
            <div style="
              background: ${connectionStatus.color};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              ${connectionStatus.label === 'Online' ? '🟢' : connectionStatus.label === 'Recently Offline' ? '🟡' : '🔴'}
              ${connectionStatus.label}
            </div>
          ` : ''}
          <div style="
            color: #6b7280;
            font-size: 12px;
          ">
            ${currentLoad}/${maxCapacity} passengers (${loadPercentage}%)
          </div>
        </div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr;
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
      
      ${vehicle.operationalInfo?.delays?.currentDelay && vehicle.operationalInfo.delays.currentDelay > 0 ? `
        <div style="
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 6px;
          padding: 8px;
          margin: 12px 0;
        ">
          <div style="
            font-size: 12px;
            font-weight: 600;
            color: #D97706;
            margin-bottom: 4px;
          ">
            ⚠️ Delayed by ${vehicle.operationalInfo.delays.currentDelay} minutes
          </div>
          ${vehicle.operationalInfo.delays.reason ? `
            <div style="
              font-size: 11px;
              color: #92400E;
            ">
              Reason: ${vehicle.operationalInfo.delays.reason}
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div style="
        font-size: 11px;
        color: #6b7280;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        display: grid;
        grid-template-columns: 1fr;
        gap: 4px;
      ">
        <div>📍 Location: ${vehicle.location?.latitude?.toFixed(4) || 'N/A'}, ${vehicle.location?.longitude?.toFixed(4) || 'N/A'}</div>
        <div>📡 Last API Request: ${new Date(vehicle.timestamp || Date.now()).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}</div>
        ${connectionStatus ? `
          <div style="color: ${connectionStatus.color}; font-weight: 600;">
            📡 ${connectionStatus.label}: ${connectionStatus.timeText}
          </div>
        ` : ''}
        <div style="color: #10B981; font-weight: 600;">
          🔄 Auto-refreshing every 10 seconds
        </div>
        ${vehicle.operationalInfo?.driverInfo?.driverName ? `
          <div>👨‍✈️ Driver: ${vehicle.operationalInfo.driverInfo.driverName}</div>
        ` : ''}
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
  onLastApiCallUpdate?: (time: Date) => void;
}

const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  routes = [],
  selectedRoute = null,
  height = '70vh',
  theme = 'light',
  onLastApiCallUpdate
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [lastApiCallTime, setLastApiCallTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [userMarker, setUserMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Helper function to get live time format
  const getLiveTimeFormat = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper function to get time difference  
  const getTimeDifference = (date: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}m`;
    return `${Math.floor(diffMinutes / 60)}h`;
  };

  // Helper function to get next update countdown
  const getNextUpdateCountdown = () => {
    if (!lastApiCallTime) return '...';
    const timeSinceLastCall = currentTime.getTime() - lastApiCallTime.getTime();
    const nextUpdateIn = Math.max(0, 10000 - timeSinceLastCall); // 10 second intervals
    const secondsRemaining = Math.ceil(nextUpdateIn / 1000);
    return secondsRemaining > 0 ? `${secondsRemaining}s` : 'updating...';
  };

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

  // Update current time every second for live timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    
    // Clear selected vehicle when info window is closed
    infoWin.addListener('closeclick', () => {
      setSelectedVehicleId(null);
    });
    
    setInfoWindow(infoWin);

    setMap(mapInstance);
    console.log('🗺️ Google Maps initialized with traffic layer and directions');
  }, [isLoaded, theme]);

  // Get user location and add marker
  useEffect(() => {
    if (!map || !window.google) return;

    console.log('📍 Requesting user location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          console.log(`✅ User location obtained: ${userPos.lat}, ${userPos.lng}`);
          setUserLocation(userPos);

          // Create user location marker (blue dot like Google Maps)
          const userLocationMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: userPos,
            map: map,
            title: 'Your Location'
          });

          // Create blue dot content
          const userMarkerElement = document.createElement('div');
          userMarkerElement.innerHTML = `
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 20px;
                height: 20px;
                background: #4285F4;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                position: relative;
              "></div>
              <div style="
                position: absolute;
                width: 40px;
                height: 40px;
                background: rgba(66, 133, 244, 0.2);
                border-radius: 50%;
                animation: pulse-user 2s infinite;
              "></div>
            </div>
          `;

          userLocationMarker.content = userMarkerElement;
          setUserMarker(userLocationMarker);

          // Add info window for user location
          userLocationMarker.addListener('click', () => {
            const userInfoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="
                  font-family: system-ui;
                  padding: 8px;
                  text-align: center;
                ">
                  <h4 style="
                    margin: 0 0 8px 0;
                    color: #4285F4;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                  ">
                    📍 Your Location
                  </h4>
                  <p style="
                    margin: 0;
                    color: #666;
                    font-size: 12px;
                    line-height: 1.4;
                  ">
                    Lat: ${userPos.lat.toFixed(6)}<br>
                    Lng: ${userPos.lng.toFixed(6)}
                  </p>
                  <div style="
                    margin-top: 8px;
                    padding: 4px 8px;
                    background: #4285F4;
                    color: white;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                  ">
                    LIVE LOCATION
                  </div>
                </div>
              `
            });
            userInfoWindow.open(map, userLocationMarker);
          });

          console.log('🟢 User location marker added to map');
        },
        (error) => {
          console.warn('❌ Unable to get user location:', error.message);
          
          // Show different messages based on error type
          let errorMessage = 'Location access denied or unavailable';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          console.log(`📍 Location error: ${errorMessage}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('❌ Geolocation not supported by browser');
    }
  }, [map]);

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
      
      // Update API call time
      const now = new Date();
      setLastApiCallTime(now);
      
      // Notify parent component about API call time
      if (onLastApiCallUpdate) {
        onLastApiCallUpdate(now);
      }
      
      if (data.vehicles && Array.isArray(data.vehicles)) {
        console.log(`✅ Loaded ${data.vehicles.length} vehicles at ${now.toLocaleTimeString()}`);
        data.vehicles.forEach((vehicle: Vehicle) => {
          console.log(`🚐 Vehicle ${vehicle.vehicleId}: timestamp=${vehicle.timestamp}, lat=${vehicle.location?.latitude}, lng=${vehicle.location?.longitude}`);
        });
        setVehicles(data.vehicles);
        setLastUpdateTime(new Date());
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

    setSelectedVehicleId(vehicle.vehicleId);
    const content = createVehicleInfoWindow(vehicle);
    infoWindow.setContent(content);
    infoWindow.setPosition({
      lat: vehicle.location.latitude,
      lng: vehicle.location.longitude
    });
    infoWindow.open(map);
  }, [infoWindow, map]);

  // Auto-update info window content when selected vehicle data changes
  useEffect(() => {
    if (!infoWindow || !selectedVehicleId || !map) return;

    const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
    if (selectedVehicle) {
      const updatedContent = createVehicleInfoWindow(selectedVehicle);
      infoWindow.setContent(updatedContent);
      console.log(`🔄 Updated info window for vehicle ${selectedVehicleId}`);
    }
  }, [vehicles, selectedVehicleId, infoWindow, map]);

  // Update vehicle markers - Smart update instead of recreating
  useEffect(() => {
    if (!map) return;

    console.log(`🚌 Updating ${vehicles.length} vehicle markers`);

    const existingMarkerIds = new Set(markersRef.current.keys());
    const currentVehicleIds = new Set(vehicles.map(v => v.vehicleId));

    // Remove markers for vehicles that no longer exist
    existingMarkerIds.forEach(vehicleId => {
      if (!currentVehicleIds.has(vehicleId)) {
        const marker = markersRef.current.get(vehicleId);
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
        markersRef.current.delete(vehicleId);
        console.log(`🗑️ Removed marker for vehicle: ${vehicleId}`);
      }
    });

    // Update or create markers for current vehicles
    vehicles.forEach(vehicle => {
      if (vehicle.location?.latitude && vehicle.location?.longitude) {
        const existingMarker = markersRef.current.get(vehicle.vehicleId);
        
        if (existingMarker) {
          // Update existing marker position and content
          updateVehicleMarker(existingMarker, vehicle);
        } else {
          // Create new marker for new vehicles
          try {
            const marker = createVehicleMarker(map, vehicle, handleVehicleClick);
            markersRef.current.set(vehicle.vehicleId, marker);
            console.log(`✅ Created new marker for vehicle: ${vehicle.vehicleId}`);
          } catch (error) {
            console.error('Error creating marker for vehicle:', vehicle.vehicleId, error);
          }
        }
      }
    });

    setVehicleMarkers(new Map(markersRef.current));
  }, [map, vehicles, handleVehicleClick]);

  // WebSocket real-time connection
  useEffect(() => {
    if (!isLoaded) return;

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const wsURL = baseURL.replace('http://', 'ws://').replace('https://', 'wss://');

    console.log('🔌 Attempting WebSocket connection to:', wsURL);

    const socketInstance = io(wsURL, {
      auth: {
        token: 'anonymous-tracking-token' // For tracking page, we can use anonymous token
      },
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected for real-time vehicle tracking');
      setIsRealTimeConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsRealTimeConnected(false);
    });

    // Listen for real-time vehicle updates
    socketInstance.on('vehicle_status_update', (data) => {
      console.log('🚐 Real-time vehicle update received:', data);
      console.log('📍 Vehicle location:', data.location);
      console.log('🕐 Update timestamp:', data.timestamp);
      handleRealTimeVehicleUpdate(data);
    });

    socketInstance.on('vehicle_online', (data) => {
      console.log('🟢 Vehicle came online:', data.vehicleId);
      handleRealTimeVehicleUpdate({ ...data, connectionStatus: 'online' });
    });

    socketInstance.on('vehicle_offline', (data) => {
      console.log('🔴 Vehicle went offline:', data.vehicleId);
      handleRealTimeVehicleUpdate({ ...data, connectionStatus: 'offline' });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsRealTimeConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isLoaded]);

  // Handle real-time vehicle updates
  const handleRealTimeVehicleUpdate = useCallback((data: any) => {
    console.log('📡 Processing real-time update for vehicle:', data.vehicleId);
    
    // Update last update time when real-time data comes in
    setLastUpdateTime(new Date());
    
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.vehicleId === data.vehicleId) {
          return {
            ...vehicle,
            location: data.location || vehicle.location,
            connectionStatus: data.connectionStatus,
            lastSeenMinutesAgo: data.lastSeenMinutesAgo || 0,
            timestamp: data.timestamp || new Date(),
            operationalInfo: data.operationalInfo || vehicle.operationalInfo,
            passengerLoad: data.passengerLoad || vehicle.passengerLoad
          };
        }
        return vehicle;
      });
      
      console.log(`🔄 Updated vehicle data in real-time for ${data.vehicleId}`);
      return updatedVehicles;
    });
  }, []);

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
        backdropFilter: 'blur(10px)',
        minWidth: '220px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: isRealTimeConnected ? '#10B981' : '#EF4444',
            borderRadius: '50%',
            animation: isRealTimeConnected ? 'pulse 2s infinite' : 'none'
          }}></div>
          {isRealTimeConnected ? 'Live Tracking' : 'Offline Mode'}
        </div>


        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          marginBottom: '4px'
        }}>
          🚌 {vehicles.length} vehicles total
        </div>
        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <span style={{ color: '#10B981' }}>🟢 {vehicles.filter(v => v.connectionStatus === 'online').length}</span>
          <span style={{ color: '#F59E0B' }}>🟡 {vehicles.filter(v => v.connectionStatus === 'recently_offline').length}</span>
          <span style={{ color: '#EF4444' }}>🔴 {vehicles.filter(v => v.connectionStatus === 'offline').length}</span>
        </div>
        <div style={{
          fontSize: '11px',
          color: theme === 'dark' ? '#6b7280' : '#9ca3af',
          borderTop: '1px solid rgba(156, 163, 175, 0.2)',
          paddingTop: '6px',
          marginTop: '6px'
        }}>
          🚦 Live traffic • 📍 {routeMarkers.length} stops
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse-user { 
          0% { 
            transform: scale(0.8); 
            opacity: 0.8; 
          } 
          50% { 
            transform: scale(1.2); 
            opacity: 0.4; 
          } 
          100% { 
            transform: scale(0.8); 
            opacity: 0.8; 
          } 
        }
      `}</style>
    </div>
  );
};

export default GoogleMapsTracker;