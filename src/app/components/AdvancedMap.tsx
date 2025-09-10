// src/components/AdvancedMap.tsx - FIXED VERSION - GUARANTEED VEHICLE DISPLAY
"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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


// ENHANCED VEHICLE ICONS WITH STATUS INDICATORS
const createVehicleIcon = (type: string, status: string, heading: number = 0, loadPercentage: number = 0) => {
  const iconColors = {
    bus: { online: '#10B981', on_route: '#10B981', delayed: '#F59E0B', at_stop: '#3B82F6', breakdown: '#EF4444', off_duty: '#6B7280' },
    train: { online: '#8B5CF6', on_route: '#8B5CF6', delayed: '#F59E0B', at_stop: '#3B82F6', breakdown: '#EF4444', off_duty: '#6B7280' }
  };
  const color = iconColors[type as keyof typeof iconColors]?.[status as keyof typeof iconColors.bus] || '#10B981';
  const loadColor = loadPercentage > 80 ? '#EF4444' : loadPercentage > 60 ? '#F59E0B' : '#10B981';
  const vehicleEmoji = type === 'train' ? '🚊' : '🚌';
  const iconSvg = `<div style="position: relative; transform: rotate(${heading}deg); transition: transform 0.3s ease;"><div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${color}, ${color}CC); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;">${vehicleEmoji}</div><div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: ${loadColor}; border: 2px solid white; border-radius: 50%;"></div><div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: bold; white-space: nowrap;">${status.replace('_', ' ').toUpperCase()}</div></div>`;
  return L.divIcon({ html: iconSvg, className: 'custom-vehicle-icon', iconSize: [40, 40], iconAnchor: [20, 20] });
};

// PROFESSIONAL START POINT MARKER (Green Circle with A)
const createStartPointIcon = (routeName: string) => {
  const iconSvg = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10B981, #059669); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); cursor: pointer;">A</div>
      <div style="position: absolute; top: 44px; left: 50%; transform: translateX(-50%); background: rgba(16, 185, 129, 0.95); color: white; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">START</div>
    </div>`;
  return L.divIcon({ html: iconSvg, className: 'route-start-icon', iconSize: [40, 58], iconAnchor: [20, 40] });
};

// PROFESSIONAL END POINT MARKER (Red Circle with B)
const createEndPointIcon = (routeName: string) => {
  const iconSvg = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #EF4444, #DC2626); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); cursor: pointer;">B</div>
      <div style="position: absolute; top: 44px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.95); color: white; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">END</div>
    </div>`;
  return L.divIcon({ html: iconSvg, className: 'route-end-icon', iconSize: [40, 58], iconAnchor: [20, 40] });
};

// PROFESSIONAL WAYPOINT MARKER (Blue Circle with Number)
const createWaypointIcon = (order: number) => {
  const iconSvg = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3B82F6, #2563EB); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white; box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3); cursor: pointer;">${order}</div>
      <div style="position: absolute; top: 36px; left: 50%; transform: translateX(-50%); background: rgba(59, 130, 246, 0.95); color: white; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 600; white-space: nowrap;">STOP</div>
    </div>`;
  return L.divIcon({ html: iconSvg, className: 'route-waypoint-icon', iconSize: [32, 48], iconAnchor: [16, 32] });
};

// ROUTE POINT POPUP COMPONENT
const RoutePointPopup = ({ route, pointType, location }: { 
  route: RouteData, 
  pointType: 'start' | 'end' | 'waypoint', 
  location: RouteLocation | RouteWaypoint 
}) => (
  <div style={{ minWidth: '280px', fontFamily: 'system-ui', lineHeight: '1.5' }}>
    <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: 'white',
          background: pointType === 'start' ? '#10B981' : pointType === 'end' ? '#EF4444' : '#3B82F6'
        }}>
          {pointType === 'start' ? 'A' : pointType === 'end' ? 'B' : (location as RouteWaypoint).order}
        </div>
        {location.name}
        <span style={{ 
          fontSize: '0.75rem', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          backgroundColor: pointType === 'start' ? '#10B981' : pointType === 'end' ? '#EF4444' : '#3B82F6', 
          color: 'white', 
          fontWeight: '500' 
        }}>
          {pointType.toUpperCase()}
        </span>
      </h3>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>📍 {location.address || 'Address not available'}</p>
      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'monospace' }}>
        📊 {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
      </p>
    </div>
    
    <div style={{ marginBottom: '1rem' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>Route Information</h4>
      <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' }}><strong>Route:</strong> {route.name}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace', marginBottom: '0.25rem' }}>ID: {route.routeId}</div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</span>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>{route.distance ? `${route.distance} km` : 'N/A'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>{route.estimatedDuration ? `${route.estimatedDuration} min` : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <span style={{ 
        padding: '0.25rem 0.75rem', 
        borderRadius: '99px', 
        fontSize: '0.75rem', 
        fontWeight: '600', 
        backgroundColor: route.status === 'active' ? '#10B981' : '#6B7280', 
        color: 'white' 
      }}>
        {route.status.toUpperCase()}
      </span>
      {route.approvalStatus === 'approved' && (
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '99px', 
          fontSize: '0.75rem', 
          fontWeight: '600', 
          backgroundColor: '#059669', 
          color: 'white' 
        }}>
          APPROVED
        </span>
      )}
    </div>
  </div>
);

// MAP AUTO-CENTER AND BOUNDS UPDATER FOR VEHICLES AND ROUTES  
const MapUpdater = ({ routes, selectedRoute, vehicles }: { routes?: RouteData[], selectedRoute?: string | null, vehicles?: Vehicle[] }) => {
  const map = useMap();
  useEffect(() => {
    console.log('🗺️ Map Update - Routes:', routes?.length || 0, 'Vehicles:', vehicles?.length || 0, 'Selected Route:', selectedRoute);
    
    // Collect all points to fit bounds (prioritize vehicles, then routes)
    const allPoints: [number, number][] = [];
    
    // 1. PRIORITY: Add active vehicle locations
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(vehicle => {
        if (vehicle.location?.latitude && vehicle.location?.longitude) {
          allPoints.push([vehicle.location.latitude, vehicle.location.longitude]);
          console.log(`🚌 Vehicle ${vehicle.vehicleId} at [${vehicle.location.latitude}, ${vehicle.location.longitude}]`);
        }
      });
    }
    
    // 2. SECONDARY: Add route points if no vehicles or showing route details
    const routesToShow = selectedRoute && selectedRoute !== 'all' 
      ? routes?.filter(route => route._id === selectedRoute) || []
      : routes || [];
    
    if (routesToShow.length > 0) {
      routesToShow.forEach(route => {
        // Add start point
        if (route.startLocation?.coordinates) {
          allPoints.push([route.startLocation.coordinates[1], route.startLocation.coordinates[0]]);
        }
        // Add end point
        if (route.endLocation?.coordinates) {
          allPoints.push([route.endLocation.coordinates[1], route.endLocation.coordinates[0]]);
        }
        // Add waypoints
        if (route.waypoints) {
          route.waypoints.forEach(wp => {
            if (wp.coordinates) {
              allPoints.push([wp.coordinates[1], wp.coordinates[0]]);
            }
          });
        }
      });
    }
    
    if (allPoints.length > 0) {
      if (vehicles && vehicles.length > 0) {
        // If we have vehicles, center on them with appropriate zoom
        if (vehicles.length === 1) {
          // Single vehicle: center directly on it with street-level zoom
          const vehicle = vehicles[0];
          console.log(`🎯 Centering on single vehicle at [${vehicle.location.latitude}, ${vehicle.location.longitude}]`);
          map.setView([vehicle.location.latitude, vehicle.location.longitude], 16);
        } else {
          // Multiple vehicles: fit bounds to show all
          console.log('📍 Fitting bounds for', vehicles.length, 'vehicles and route points');
          map.fitBounds(allPoints, { padding: [50, 50], maxZoom: 15 });
        }
      } else {
        // No vehicles, show route overview
        console.log('📍 Fitting bounds for route points only');
        map.fitBounds(allPoints, { padding: [50, 50], maxZoom: 15 });
      }
    } else {
      console.log('🗺️ No data, showing Sri Lanka overview');
      map.setView([7.8731, 80.7718], 8);
    }
  }, [routes, selectedRoute, vehicles, map]);
  return null;
};

// ENHANCED VEHICLE POPUP WITH FULL DETAILS
const VehiclePopup = ({ vehicle }: { vehicle: Vehicle }) => (
  <div style={{ minWidth: '300px', fontFamily: 'system-ui', lineHeight: '1.5' }}>
    <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {vehicle.vehicleId?.includes('TRAIN') ? '🚊' : '🚌'} {vehicle.vehicleNumber || vehicle.vehicleId}
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', backgroundColor: vehicle.operationalInfo?.status === 'on_route' ? '#10B981' : vehicle.operationalInfo?.status === 'delayed' ? '#F59E0B' : '#3B82F6', color: 'white', fontWeight: '500' }}>
          {(vehicle.operationalInfo?.status || 'online').replace('_', ' ').toUpperCase()}
        </span>
      </h3>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>📞 Driver: {vehicle.operationalInfo?.driverInfo?.driverName || 'N/A'}</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Speed</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{(vehicle.location?.speed || 0).toFixed(1)}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>km/h</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Load</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: (vehicle.passengerLoad?.loadPercentage || 0) > 80 ? '#EF4444' : '#1f2937' }}>{(vehicle.passengerLoad?.loadPercentage || 0).toFixed(0)}%</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{vehicle.passengerLoad?.currentCapacity || 0}/{vehicle.passengerLoad?.maxCapacity || 0}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Progress</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{(vehicle.routeProgress?.progressPercentage || 0).toFixed(0)}%</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>complete</div>
      </div>
    </div>
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Route Progress</div>
      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '0.25rem', marginBottom: '0.5rem' }}>
        <div style={{ backgroundColor: '#3B82F6', height: '8px', borderRadius: '0.5rem', width: `${vehicle.routeProgress?.progressPercentage || 0}%`, transition: 'width 0.5s ease' }}></div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>📍 Next: {vehicle.routeProgress?.nextStopETA ? new Date(vehicle.routeProgress.nextStopETA).toLocaleTimeString() : 'Calculating...'}</div>
    </div>
    {vehicle.operationalInfo?.delays?.currentDelay && vehicle.operationalInfo.delays.currentDelay > 0 && (
      <div style={{ backgroundColor: '#FEF3C7', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #FCD34D', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#92400E', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ Delayed by {vehicle.operationalInfo.delays.currentDelay} minutes</div>
        {vehicle.operationalInfo.delays.reason && <div style={{ fontSize: '0.8rem', color: '#92400E', marginTop: '0.25rem' }}>Reason: {vehicle.operationalInfo.delays.reason}</div>}
      </div>
    )}
    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
      <span>📍 Lat: {vehicle.location?.latitude?.toFixed(4) || 'N/A'}, Lng: {vehicle.location?.longitude?.toFixed(4) || 'N/A'}</span>
      <span>🕒 {new Date(vehicle.timestamp || Date.now()).toLocaleTimeString()}</span>
    </div>
  </div>
);

// MAIN ADVANCED MAP COMPONENT WITH ROUTE DISPLAY
interface AdvancedMapProps {
  routes?: RouteData[];
  selectedRoute?: string | null;
  vehicles?: VehicleLocation[];
  selectedVehicle?: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
  height?: string;
  showControls?: boolean;
  showRouteDetails?: boolean;
}

const AdvancedMap: React.FC<AdvancedMapProps> = ({
  routes = [],
  selectedRoute = null,
  vehicles = [],
  selectedVehicle = null,
  onVehicleSelect,
  height = '600px',
  showControls = true,
  showRouteDetails = false
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setLiveVehiclesLoading] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  
  // Convert VehicleLocation[] to Vehicle[] if needed and merge
  const convertToVehicles = (vehicleLocations: VehicleLocation[]): Vehicle[] => {
    return vehicleLocations.map((loc, index) => ({
      vehicleId: `vehicle-${index}`,
      location: loc
    }));
  };
  
  const displayVehicles: Vehicle[] = vehicles?.length 
    ? (vehicles as unknown as Vehicle[])
    : liveVehicles;

  // Get the routes to display based on selection
  const routesToDisplay = selectedRoute && selectedRoute !== 'all' 
    ? routes.filter(route => route._id === selectedRoute)
    : (showRouteDetails ? routes : []);

  console.log('🗺️ AdvancedMap Render:', { totalRoutes: routes.length, routesToDisplay: routesToDisplay.length, selectedRoute, showRouteDetails });

  // SRI LANKA BOUNDS AND CENTER
  const sriLankaCenter: [number, number] = [7.8731, 80.7718];
  const sriLankaBounds: [[number, number], [number, number]] = [[5.5, 79.0], [10.0, 82.0]];

  // Fetch vehicle data
  const fetchVehicles = useCallback(async () => {
    if (vehiclesLoading) return;
    
    setLiveVehiclesLoading(true);
    try {
      console.log('🚌 Fetching vehicles from backend...');
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const routeFilter = selectedRoute && selectedRoute !== 'all' ? `?routeId=${selectedRoute}` : '';
      const response = await fetch(`${baseURL}/api/tracking/live${routeFilter}`);
      const data = await response.json();
      
      console.log('🚌 Vehicle data received:', data);
      
      if (data.vehicles && Array.isArray(data.vehicles)) {
        setLiveVehicles(data.vehicles);
        console.log(`✅ Loaded ${data.vehicles.length} vehicles on map`);
      } else {
        console.log('❌ No vehicles found in response');
        setLiveVehicles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      setLiveVehicles([]);
    } finally {
      setLiveVehiclesLoading(false);
    }
  }, [vehiclesLoading, selectedRoute]);

  useEffect(() => {
    setMapReady(true);
    console.log('🗺️ Map initialized with', routes.length, 'routes');
    
    // Initial vehicle fetch
    fetchVehicles();
    
    // Set up interval to refresh vehicle data every 10 seconds
    const interval = setInterval(fetchVehicles, 10000);
    
    return () => clearInterval(interval);
  }, [routes.length, fetchVehicles]);

  // Refetch vehicles when selected route changes
  useEffect(() => {
    if (mapReady) {
      fetchVehicles();
    }
  }, [selectedRoute, mapReady, fetchVehicles]);

  if (!mapReady) {
    return (
      <div style={{ height, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', border: '2px dashed #d1d5db' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>🗺️ Loading Route Map...</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>Preparing {routes.length} routes for display</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e5e7eb' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.75rem 1rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: displayVehicles.length > 0 ? '#10B981' : '#6B7280', borderRadius: '50%' }}></div>
          Live Tracking
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          🚌 {displayVehicles.length} vehicles active
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          📍 {selectedRoute && selectedRoute !== 'all' ? '1 route selected' : `${routesToDisplay.length} routes displayed`}
        </div>
      </div>
      <MapContainer ref={mapRef} center={sriLankaCenter} zoom={8} style={{ height: '100%', width: '100%', zIndex: 1 }} maxBounds={sriLankaBounds} maxBoundsViscosity={0.7}>
        <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
        <MapUpdater routes={routes} selectedRoute={selectedRoute} vehicles={displayVehicles} />
        
        {/* RENDER VEHICLES - CRITICAL FOR BUS TRACKING */}
        {displayVehicles.map((vehicle, vehicleIndex) => (
          vehicle.location?.latitude && vehicle.location?.longitude && (
            <Marker
              key={`vehicle-${vehicle.vehicleId}-${vehicleIndex}`}
              position={[vehicle.location.latitude, vehicle.location.longitude]}
              icon={createVehicleIcon(
                'bus', 
                vehicle.operationalInfo?.status || 'on_route',
                vehicle.location?.heading || 0,
                vehicle.passengerLoad?.loadPercentage || 0
              )}
            >
              <Popup maxWidth={350} closeButton={true}>
                <VehiclePopup vehicle={vehicle} />
              </Popup>
            </Marker>
          )
        ))}

        {/* RENDER ROUTE POINTS ONLY (NO LINES) */}
        {routesToDisplay.map((route, routeIndex) => (
          <div key={route._id}>
            {/* Start Point Marker */}
            {route.startLocation?.coordinates && (
              <Marker
                position={[route.startLocation.coordinates[1], route.startLocation.coordinates[0]]}
                icon={createStartPointIcon(route.name)}
              >
                <Popup maxWidth={320} closeButton={true}>
                  <RoutePointPopup route={route} pointType="start" location={route.startLocation} />
                </Popup>
              </Marker>
            )}
            
            {/* Waypoint Markers */}
            {route.waypoints?.map((waypoint, wpIndex) => (
              waypoint.coordinates && (
                <Marker
                  key={`${route._id}-wp-${wpIndex}`}
                  position={[waypoint.coordinates[1], waypoint.coordinates[0]]}
                  icon={createWaypointIcon(waypoint.order)}
                >
                  <Popup maxWidth={320} closeButton={true}>
                    <RoutePointPopup route={route} pointType="waypoint" location={waypoint} />
                  </Popup>
                </Marker>
              )
            ))}
            
            {/* End Point Marker */}
            {route.endLocation?.coordinates && (
              <Marker
                position={[route.endLocation.coordinates[1], route.endLocation.coordinates[0]]}
                icon={createEndPointIcon(route.name)}
              >
                <Popup maxWidth={320} closeButton={true}>
                  <RoutePointPopup route={route} pointType="end" location={route.endLocation} />
                </Popup>
              </Marker>
            )}
          </div>
        ))}
      </MapContainer>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .custom-vehicle-icon { background: none !important; border: none !important; }
        .route-start-icon { background: none !important; border: none !important; }
        .route-end-icon { background: none !important; border: none !important; }
        .route-waypoint-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; }
        .leaflet-popup-tip { display: none !important; }
      `}</style>
    </div>
  );
};

export default dynamic(() => Promise.resolve(AdvancedMap), { ssr: false });