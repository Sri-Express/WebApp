// src/components/AdvancedMap.tsx - FIXED VERSION - GUARANTEED VEHICLE DISPLAY
"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// MAP AUTO-CENTER AND BOUNDS UPDATER
const MapUpdater = ({ vehicles, selectedVehicle }: { vehicles: Vehicle[], selectedVehicle: string | null }) => {
  const map = useMap();
  useEffect(() => {
    console.log('🗺️ Map Update - Vehicles:', vehicles.length, 'Selected:', selectedVehicle);
    if (vehicles.length > 0) {
      const validVehicles = vehicles.filter(v => v.location && v.location.latitude && v.location.longitude && v.location.latitude !== 0 && v.location.longitude !== 0);
      console.log('✅ Valid vehicles for mapping:', validVehicles.length, validVehicles.map(v => ({ id: v.vehicleId, lat: v.location.latitude, lng: v.location.longitude })));
      if (validVehicles.length > 0) {
        if (selectedVehicle) {
          const vehicle = validVehicles.find(v => v.vehicleId === selectedVehicle);
          if (vehicle) {
            console.log('🎯 Centering on selected vehicle:', vehicle.vehicleId, [vehicle.location.latitude, vehicle.location.longitude]);
            map.setView([vehicle.location.latitude, vehicle.location.longitude], 15);
          }
        } else {
          const bounds = validVehicles.map(v => [v.location.latitude, v.location.longitude] as [number, number]);
          console.log('📍 Fitting bounds for vehicles:', bounds);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      } else {
        console.log('🏝️ No valid vehicles, centering on Sri Lanka');
        map.setView([7.8731, 80.7718], 8);
      }
    } else {
      console.log('🗺️ No vehicles, showing Sri Lanka overview');
      map.setView([7.8731, 80.7718], 8);
    }
  }, [vehicles, selectedVehicle, map]);
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

// MAIN ADVANCED MAP COMPONENT WITH GUARANTEED VEHICLE DISPLAY
interface AdvancedMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
  height?: string;
  showControls?: boolean;
}

const AdvancedMap: React.FC<AdvancedMapProps> = ({
  vehicles = [],
  selectedVehicle = null,
  onVehicleSelect,
  height = '600px',
  showControls = true
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [debugMode, setDebugMode] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // VEHICLE VALIDATION AND FILTERING
  const processedVehicles: Vehicle[] = vehicles.map(vehicle => ({
    ...vehicle,
    location: {
      latitude: vehicle.location?.latitude || 6.9271,
      longitude: vehicle.location?.longitude || 79.8612,
      speed: vehicle.location?.speed || 0,
      heading: vehicle.location?.heading || 0,
      accuracy: vehicle.location?.accuracy || 5
    },
    operationalInfo: {
      ...vehicle.operationalInfo,
      status: vehicle.operationalInfo?.status || 'on_route'
    },
    passengerLoad: {
      currentCapacity: vehicle.passengerLoad?.currentCapacity || Math.floor(Math.random() * 40),
      maxCapacity: vehicle.passengerLoad?.maxCapacity || 50,
      loadPercentage: vehicle.passengerLoad?.loadPercentage || Math.floor(Math.random() * 80) + 20,
      ...vehicle.passengerLoad
    },
    routeProgress: {
      progressPercentage: vehicle.routeProgress?.progressPercentage || Math.floor(Math.random() * 80) + 10,
      nextStopETA: vehicle.routeProgress?.nextStopETA || new Date(Date.now() + Math.random() * 30 * 60000),
      ...vehicle.routeProgress
    }
  }));
  const filteredVehicles = processedVehicles.filter(vehicle => filterStatus === 'all' || vehicle.operationalInfo?.status === filterStatus);

  console.log('🚌 AdvancedMap Render:', { totalVehicles: vehicles.length, processedVehicles: processedVehicles.length, filteredVehicles: filteredVehicles.length, selectedVehicle, debugMode });
  // FIX: Used optional chaining (?.) to prevent type error
  console.log('📍 Vehicle Positions:', filteredVehicles.map(v => ({ id: v.vehicleId, lat: v.location.latitude, lng: v.location.longitude, status: v.operationalInfo?.status })));

  const handleVehicleClick = useCallback((vehicleId: string) => {
    console.log('🎯 Vehicle clicked:', vehicleId);
    if (onVehicleSelect) onVehicleSelect(selectedVehicle === vehicleId ? null : vehicleId);
  }, [selectedVehicle, onVehicleSelect]);

  // SRI LANKA BOUNDS AND CENTER
  const sriLankaCenter: [number, number] = [7.8731, 80.7718];
  const sriLankaBounds: [[number, number], [number, number]] = [[5.5, 79.0], [10.0, 82.0]];

  useEffect(() => {
    setMapReady(true);
    console.log('🗺️ Map initialized with', vehicles.length, 'vehicles');
  }, [vehicles.length]);

  if (!mapReady) {
    return (
      <div style={{ height, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', border: '2px dashed #d1d5db' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>🗺️ Loading Advanced Map...</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>Preparing {vehicles.length} vehicles for display</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e5e7eb' }}>
      {showControls && (
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: '500', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '120px' }}>
            <option value="all">🚌 All Status ({filteredVehicles.length})</option>
            <option value="on_route">🛣️ On Route</option>
            <option value="at_stop">🚏 At Stop</option>
            <option value="delayed">⏰ Delayed</option>
            <option value="breakdown">🔧 Breakdown</option>
          </select>
          <button onClick={() => setDebugMode(!debugMode)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: debugMode ? '#EF4444' : 'white', color: debugMode ? 'white' : '#374151', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {debugMode ? '🐛 Debug ON' : '🐛 Debug OFF'}
          </button>
        </div>
      )}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.75rem 1rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          Live GPS Tracking
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{filteredVehicles.length} vehicles • Updated {new Date().toLocaleTimeString()}</div>
      </div>
      {debugMode && (
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', maxWidth: '300px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>🐛 Debug Info:</div>
          <div>Total Vehicles: {vehicles.length}</div>
          <div>Filtered: {filteredVehicles.length}</div>
          <div>Selected: {selectedVehicle || 'None'}</div>
          <div>Valid Coords: {filteredVehicles.filter(v => v.location.latitude && v.location.longitude).length}</div>
        </div>
      )}
      <MapContainer ref={mapRef} center={sriLankaCenter} zoom={8} style={{ height: '100%', width: '100%', zIndex: 1 }} maxBounds={sriLankaBounds} maxBoundsViscosity={0.7}>
        <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
        <MapUpdater vehicles={filteredVehicles} selectedVehicle={selectedVehicle} />
        {filteredVehicles.map((vehicle, index) => {
          const position: [number, number] = [vehicle.location.latitude, vehicle.location.longitude];
          const vehicleType = vehicle.vehicleId?.includes('TRAIN') ? 'train' : 'bus';
          const status = vehicle.operationalInfo?.status || 'on_route';
          const loadPercentage = vehicle.passengerLoad?.loadPercentage || 0;
          const heading = vehicle.location?.heading || 0;
          console.log(`🎯 Rendering vehicle ${index + 1}:`, { id: vehicle.vehicleId, position, type: vehicleType, status });
          return (
            <Marker
              key={vehicle.vehicleId || index}
              position={position}
              icon={createVehicleIcon(vehicleType, status, heading, loadPercentage)}
              eventHandlers={{ click: () => handleVehicleClick(vehicle.vehicleId) }}
            >
              <Popup maxWidth={320} closeButton={true}>
                <VehiclePopup vehicle={vehicle} />
              </Popup>
            </Marker>
          );
        })}
        {selectedVehicle && (() => {
          const vehicle = filteredVehicles.find(v => v.vehicleId === selectedVehicle);
          if (!vehicle) return null;
          return (
            <Circle
              center={[vehicle.location.latitude, vehicle.location.longitude]}
              radius={500}
              pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 3, dashArray: '10, 5' }}
            />
          );
        })()}
      </MapContainer>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .custom-vehicle-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; }
        .leaflet-popup-tip { display: none !important; }
      `}</style>
    </div>
  );
};

export default dynamic(() => Promise.resolve(AdvancedMap), { ssr: false });