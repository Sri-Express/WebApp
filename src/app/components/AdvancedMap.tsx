// src/components/AdvancedMap.tsx - SUPER STYLISH REAL-TIME MAP COMPONENT
"use client"; import { useEffect, useState, useRef, useCallback } from 'react'; import dynamic from 'next/dynamic'; import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'; import L from 'leaflet'; import 'leaflet/dist/leaflet.css';

// CUSTOM VEHICLE ICONS WITH AMAZING STYLING
const createVehicleIcon = (type: string, status: string, heading: number = 0, loadPercentage: number = 0) => {
  const iconColors = { bus: { online: '#10B981', delayed: '#F59E0B', at_stop: '#3B82F6', breakdown: '#EF4444', off_duty: '#6B7280' }, train: { online: '#8B5CF6', delayed: '#F59E0B', at_stop: '#3B82F6', breakdown: '#EF4444', off_duty: '#6B7280' } };
  const color = iconColors[type as keyof typeof iconColors]?.[status as keyof typeof iconColors.bus] || '#6B7280'; const loadColor = loadPercentage > 80 ? '#EF4444' : loadPercentage > 60 ? '#F59E0B' : '#10B981';
  
  const iconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${heading}deg);">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <dropShadow dx="2" dy="2" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color}AA;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#grad1)" stroke="white" stroke-width="2" filter="url(#shadow)"/>
    <circle cx="16" cy="16" r="10" fill="${color}" opacity="0.8"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${type === 'bus' ? '🚌' : '🚊'}</text>
    <circle cx="16" cy="4" r="3" fill="${loadColor}" stroke="white" stroke-width="1"/>
  </svg>`;
  
  return L.divIcon({ html: iconSvg, className: 'custom-vehicle-icon', iconSize: [32, 32], iconAnchor: [16, 16] });
};

// ROUTE POLYLINE COLORS
const routeColors = { 'ROUTE_COL_KDY': '#3B82F6', 'ROUTE_COL_GAL': '#10B981', 'ROUTE_COL_JAF': '#8B5CF6', 'ROUTE_KDY_COL': '#F59E0B', 'ROUTE_GAL_COL': '#EC4899' };

// MAP UPDATE COMPONENT
const MapUpdater = ({ vehicles, selectedVehicle }: { vehicles: any[], selectedVehicle: string | null }) => {
  const map = useMap(); useEffect(() => { if (vehicles.length > 0 && !selectedVehicle) { const bounds = vehicles.map(v => [v.location.latitude, v.location.longitude]); if (bounds.length > 1) map.fitBounds(bounds, { padding: [20, 20] }); } else if (selectedVehicle) { const vehicle = vehicles.find(v => v.vehicleId === selectedVehicle); if (vehicle) map.setView([vehicle.location.latitude, vehicle.location.longitude], 14); } }, [vehicles, selectedVehicle, map]); return null;
};

// VEHICLE POPUP CONTENT
const VehiclePopup = ({ vehicle }: { vehicle: any }) => (
  <div style={{ minWidth: '280px', fontFamily: 'system-ui', lineHeight: '1.4' }}>
    <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {vehicle.operationalInfo?.tripInfo?.vehicleType === 'train' ? '🚊' : '🚌'} {vehicle.vehicleNumber}
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', backgroundColor: vehicle.operationalInfo?.status === 'on_route' ? '#10B981' : vehicle.operationalInfo?.status === 'delayed' ? '#F59E0B' : '#6B7280', color: 'white' }}>
          {vehicle.operationalInfo?.status?.replace('_', ' ').toUpperCase()}
        </span>
      </h3>
      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Driver: {vehicle.operationalInfo?.driverInfo?.driverName || 'Unknown'}</p>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Speed</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{vehicle.location?.speed?.toFixed(1) || 0} km/h</div>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Passengers</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: vehicle.passengerLoad?.loadPercentage > 80 ? '#EF4444' : '#1f2937' }}>
          {vehicle.passengerLoad?.currentCapacity || 0}/{vehicle.passengerLoad?.maxCapacity || 0}
        </div>
      </div>
    </div>

    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Route Progress</div>
      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '0.25rem' }}>
        <div style={{ backgroundColor: '#3B82F6', height: '6px', borderRadius: '0.25rem', width: `${vehicle.routeProgress?.progressPercentage || 0}%`, transition: 'width 0.5s ease' }}></div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>{(vehicle.routeProgress?.progressPercentage || 0).toFixed(1)}% complete</div>
    </div>

    {vehicle.operationalInfo?.delays?.currentDelay > 0 && (
      <div style={{ backgroundColor: '#FEF3C7', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #FCD34D' }}>
        <div style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '500' }}>⚠️ Delayed by {vehicle.operationalInfo.delays.currentDelay} minutes</div>
        {vehicle.operationalInfo.delays.reason && <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.25rem' }}>Reason: {vehicle.operationalInfo.delays.reason}</div>}
      </div>
    )}

    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
      Last update: {new Date(vehicle.timestamp).toLocaleTimeString()}
    </div>
  </div>
);

// MAIN MAP COMPONENT
interface AdvancedMapProps { vehicles: any[]; routes: any[]; selectedVehicle?: string | null; onVehicleSelect?: (vehicleId: string | null) => void; height?: string; showControls?: boolean; }

const AdvancedMap: React.FC<AdvancedMapProps> = ({ vehicles = [], routes = [], selectedVehicle = null, onVehicleSelect, height = '600px', showControls = true }) => {
  const [mapReady, setMapReady] = useState(false); const [showRoutes, setShowRoutes] = useState(true); const [filterStatus, setFilterStatus] = useState('all'); const [selectedRoute, setSelectedRoute] = useState('all'); const mapRef = useRef<any>(null);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filterStatus !== 'all' && vehicle.operationalInfo?.status !== filterStatus) return false;
    if (selectedRoute !== 'all' && vehicle.routeId !== selectedRoute) return false;
    return true;
  });

  const handleVehicleClick = useCallback((vehicleId: string) => { if (onVehicleSelect) onVehicleSelect(selectedVehicle === vehicleId ? null : vehicleId); }, [selectedVehicle, onVehicleSelect]);

  // SRI LANKA CENTER COORDINATES
  const sriLankaCenter: [number, number] = [7.8731, 80.7718]; const sriLankaBounds: [[number, number], [number, number]] = [[5.9, 79.5], [9.9, 81.9]];

  useEffect(() => { setMapReady(true); }, []);

  if (!mapReady) return <div style={{ height, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem' }}><div style={{ textAlign: 'center' }}><div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div><div style={{ color: '#6b7280' }}>Loading advanced map...</div></div></div>;

  return (
    <div style={{ position: 'relative', height, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
      {showControls && (
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: '500', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <option value="all">All Status</option><option value="on_route">On Route</option><option value="at_stop">At Stop</option><option value="delayed">Delayed</option>
          </select>
          <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: '500', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <option value="all">All Routes</option>
            {Object.keys(routeColors).map(routeId => (<option key={routeId} value={routeId}>{routeId.replace('ROUTE_', '').replace('_', ' → ')}</option>))}
          </select>
          <button onClick={() => setShowRoutes(!showRoutes)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: showRoutes ? '#3B82F6' : 'white', color: showRoutes ? 'white' : '#374151', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            {showRoutes ? 'Hide Routes' : 'Show Routes'}
          </button>
        </div>
      )}

      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Live Tracking</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{filteredVehicles.length} vehicles • Updated {new Date().toLocaleTimeString()}</div>
      </div>

      <MapContainer ref={mapRef} center={sriLankaCenter} zoom={8} style={{ height: '100%', width: '100%' }} maxBounds={sriLankaBounds} maxBoundsViscosity={1.0}>
        <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
        
        <MapUpdater vehicles={filteredVehicles} selectedVehicle={selectedVehicle} />

        {showRoutes && Object.entries(routeColors).map(([routeId, color]) => {
          const routeCoords = routes.find(r => r.routeId === routeId)?.coordinates || [];
          if (routeCoords.length === 0) return null;
          return <Polyline key={routeId} positions={routeCoords.map((coord: any) => [coord.lat, coord.lng])} color={color} weight={4} opacity={0.7} dashArray={selectedRoute === routeId ? undefined : "5, 10"} />;
        })}

        {filteredVehicles.map((vehicle) => (
          <Marker key={vehicle.vehicleId} position={[vehicle.location.latitude, vehicle.location.longitude]} icon={createVehicleIcon(vehicle.vehicleId.includes('TRAIN') ? 'train' : 'bus', vehicle.operationalInfo?.status || 'on_route', vehicle.location?.heading || 0, vehicle.passengerLoad?.loadPercentage || 0)} eventHandlers={{ click: () => handleVehicleClick(vehicle.vehicleId) }}>
            <Popup><VehiclePopup vehicle={vehicle} /></Popup>
          </Marker>
        ))}

        {selectedVehicle && (() => {
          const vehicle = vehicles.find(v => v.vehicleId === selectedVehicle);
          if (!vehicle) return null;
          return <Circle center={[vehicle.location.latitude, vehicle.location.longitude]} radius={200} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.2 }} />;
        })()}
      </MapContainer>

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .custom-vehicle-icon { background: none !important; border: none !important; }`}</style>
    </div>
  );
};

export default dynamic(() => Promise.resolve(AdvancedMap), { ssr: false });