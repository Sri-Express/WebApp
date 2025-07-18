// src/app/track/page.tsx - UPDATED WITH ADVANCED MAP INTEGRATION
"use client"; import { useState, useEffect, useCallback } from 'react'; import Link from 'next/link'; import { useRouter } from 'next/navigation'; import dynamic from 'next/dynamic'; const AdvancedMap = dynamic(() => import('../components/AdvancedMap'), { ssr: false });

interface VehicleLocation { _id: string; deviceId: string; routeId: string; vehicleId: string; vehicleNumber: string; location: { latitude: number; longitude: number; accuracy: number; heading: number; speed: number; altitude: number; }; routeProgress: { currentWaypoint: number; distanceCovered: number; estimatedTimeToDestination: number; nextStopETA: string; progressPercentage: number; }; passengerLoad: { currentCapacity: number; maxCapacity: number; loadPercentage: number; }; operationalInfo: { driverInfo: { driverName: string; contactNumber: string; }; tripInfo: { tripId: string; departureTime: string; estimatedArrival: string; }; status: 'on_route' | 'at_stop' | 'delayed' | 'breakdown' | 'off_duty'; delays: { currentDelay: number; reason: string; }; }; environmentalData: { weather: string; temperature: number; trafficCondition: string; }; timestamp: string; }

interface Route { _id: string; name: string; startLocation: { name: string; address: string; }; endLocation: { name: string; address: string; }; waypoints: Array<{ name: string; coordinates: [number, number]; order: number; }>; }

export default function AdvancedTrackingPage() {
  const router = useRouter(); const [vehicles, setVehicles] = useState<VehicleLocation[]>([]); const [routes, setRoutes] = useState<Route[]>([]); const [selectedRoute, setSelectedRoute] = useState<string>('all'); const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); const [viewMode, setViewMode] = useState<'map' | 'list' | 'both'>('both'); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [lastUpdate, setLastUpdate] = useState<Date>(new Date()); const [autoRefresh, setAutoRefresh] = useState(true); const [simulationStatus, setSimulationStatus] = useState<any>(null);

  const getToken = () => localStorage.getItem('token'); const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/login'); return null; } const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; const fullURL = `${baseURL}${endpoint}`; try { const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, } }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; } throw new Error(`API Error: ${response.status}`); } return await response.json(); } catch (error) { console.error('API call error:', error); if (error instanceof Error) setError(error.message); return null; } }, [router]);

  const loadVehicleLocations = useCallback(async () => { const endpoint = selectedRoute === 'all' ? '/tracking/live' : `/tracking/route/${selectedRoute}`; const response = await apiCall(endpoint); if (response) { setVehicles(response.vehicles || []); setLastUpdate(new Date()); setError(''); } }, [selectedRoute, apiCall]);

  const loadRoutes = useCallback(async () => { const response = await apiCall('/routes?status=active'); if (response) setRoutes(response.routes || []); }, [apiCall]);

  const loadSimulationStatus = useCallback(async () => { const response = await apiCall('/admin/simulation/status'); if (response) setSimulationStatus(response); }, [apiCall]);

  const controlSimulation = useCallback(async (action: 'start' | 'stop' | 'speed', value?: number) => { const endpoint = action === 'speed' ? `/admin/simulation/speed` : `/admin/simulation/${action}`; const options = action === 'speed' ? { method: 'POST', body: JSON.stringify({ speed: value }) } : { method: 'POST' }; const response = await apiCall(endpoint, options); if (response) { setSimulationStatus(response); if (action === 'start') setAutoRefresh(true); } }, [apiCall]);

  useEffect(() => { const loadData = async () => { setLoading(true); await Promise.all([loadVehicleLocations(), loadRoutes(), loadSimulationStatus()]); setLoading(false); }; loadData(); }, [loadVehicleLocations, loadRoutes, loadSimulationStatus]);

  useEffect(() => { let interval: NodeJS.Timeout; if (autoRefresh) { interval = setInterval(() => { loadVehicleLocations(); loadSimulationStatus(); }, 3000); } return () => { if (interval) clearInterval(interval); }; }, [autoRefresh, loadVehicleLocations, loadSimulationStatus]);

  const getStatusColor = (status: string) => { const colors: { [key: string]: string } = { on_route: '#10B981', at_stop: '#3B82F6', delayed: '#F59E0B', breakdown: '#EF4444', off_duty: '#6B7280' }; return colors[status] || '#6B7280'; }; const getStatusLabel = (status: string) => { const labels: { [key: string]: string } = { on_route: 'On Route', at_stop: 'At Stop', delayed: 'Delayed', breakdown: 'Breakdown', off_duty: 'Off Duty' }; return labels[status] || 'Unknown'; }; const formatTime = (timeString: string) => new Date(timeString).toLocaleTimeString(); const formatSpeed = (speed: number) => `${speed.toFixed(1)} km/h`; const formatLastUpdate = (date: Date) => date.toLocaleTimeString();

  const filteredVehicles = vehicles.filter(vehicle => selectedRoute === 'all' || vehicle.routeId === selectedRoute);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #1e293b', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>Loading Advanced GPS Tracking...</div>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Initializing real-time vehicle monitoring</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#f1f5f9' }}>Express</span><span style={{ color: '#3B82F6', fontSize: '0.875rem', marginLeft: '0.5rem' }}>GPS Pro</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>Dashboard</Link>
            <Link href="/bookings" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>My Bookings</Link>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#334155' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '500' }}>Live</span>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Advanced GPS Tracking</h1>
              <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Real-time vehicle monitoring across Sri Lanka with precision GPS technology</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['map', 'list', 'both'].map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode as any)} style={{ backgroundColor: viewMode === mode ? '#3B82F6' : '#374151', color: viewMode === mode ? 'white' : '#94a3b8', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{mode}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#3B82F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🚌</div>
              <div><h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{filteredVehicles.length}</h3><p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Active Vehicles</p></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#10B981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📍</div>
              <div><h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{filteredVehicles.filter(v => v.operationalInfo.status === 'on_route').length}</h3><p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>On Route</p></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: filteredVehicles.filter(v => v.operationalInfo.delays.currentDelay > 0).length > 0 ? '#F59E0B' : '#6B7280', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⏱️</div>
              <div><h3 style={{ color: filteredVehicles.filter(v => v.operationalInfo.delays.currentDelay > 0).length > 0 ? '#F59E0B' : '#6B7280', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{filteredVehicles.filter(v => v.operationalInfo.delays.currentDelay > 0).length}</h3><p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Delayed</p></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👥</div>
              <div><h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{Math.round(filteredVehicles.reduce((acc, v) => acc + (v.passengerLoad?.loadPercentage || 0), 0) / (filteredVehicles.length || 1))}%</h3><p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Avg Load</p></div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>Filter by Route</label><select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #475569', borderRadius: '0.5rem', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '1rem', minWidth: '200px' }}><option value="all">All Routes</option>{routes.map((route) => (<option key={route._id} value={route._id}>{route.name}</option>))}</select></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>Auto Refresh</label><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ accentColor: '#3B82F6' }} /><span>Every 3 seconds</span></label></div>
              {simulationStatus && (<div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>Simulation Control</label><div style={{ display: 'flex', gap: '0.5rem' }}><button onClick={() => controlSimulation(simulationStatus.isRunning ? 'stop' : 'start')} style={{ backgroundColor: simulationStatus.isRunning ? '#EF4444' : '#10B981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>{simulationStatus.isRunning ? '⏹️ Stop' : '▶️ Start'}</button><select onChange={(e) => controlSimulation('speed', parseFloat(e.target.value))} value={simulationStatus.speedMultiplier} style={{ padding: '0.5rem', border: '1px solid #475569', borderRadius: '0.375rem', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '0.875rem' }}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option><option value="5">5x</option></select></div></div>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={loadVehicleLocations} style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔄 Refresh Now</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div><span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Last update: {formatLastUpdate(lastUpdate)}</span></div>
            </div>
          </div>
        </div>

        {error && <div style={{ backgroundColor: '#7F1D1D', color: '#FCA5A5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #B91C1C', marginBottom: '2rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'both' ? '1fr 400px' : '1fr', gap: '2rem', height: viewMode === 'map' ? '70vh' : 'auto' }}>
          {(viewMode === 'map' || viewMode === 'both') && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' }}>
              <AdvancedMap vehicles={filteredVehicles} routes={routes} selectedVehicle={selectedVehicle} onVehicleSelect={setSelectedVehicle} height={viewMode === 'both' ? '600px' : '70vh'} />
            </div>
          )}

          {(viewMode === 'list' || viewMode === 'both') && (
            <div style={{ maxHeight: viewMode === 'both' ? '600px' : 'none', overflowY: viewMode === 'both' ? 'auto' : 'visible' }}>
              {filteredVehicles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle._id} onClick={() => setSelectedVehicle(selectedVehicle === vehicle.vehicleId ? null : vehicle.vehicleId)} style={{ backgroundColor: selectedVehicle === vehicle.vehicleId ? '#374151' : '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: `2px solid ${selectedVehicle === vehicle.vehicleId ? '#3B82F6' : '#334155'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{vehicle.vehicleId.includes('TRAIN') ? '🚊' : '🚌'} {vehicle.vehicleNumber} {selectedVehicle === vehicle.vehicleId && <span style={{ fontSize: '0.875rem', color: '#3B82F6' }}>📍 Selected</span>}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: getStatusColor(vehicle.operationalInfo.status), color: 'white' }}>{getStatusLabel(vehicle.operationalInfo.status)}</span>
                            {vehicle.operationalInfo.delays.currentDelay > 0 && (<span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#F59E0B', color: 'white' }}>+{vehicle.operationalInfo.delays.currentDelay} min</span>)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.4' }}><div>Driver: {vehicle.operationalInfo.driverInfo.driverName}</div><div>Contact: {vehicle.operationalInfo.driverInfo.contactNumber}</div><div>Speed: {formatSpeed(vehicle.location.speed)} • Heading: {vehicle.location.heading.toFixed(0)}°</div></div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>Route Progress</h4>
                          <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '0.5rem' }}><div style={{ backgroundColor: '#3B82F6', height: '8px', borderRadius: '0.25rem', width: `${vehicle.routeProgress.progressPercentage}%`, transition: 'width 0.3s ease' }}></div></div>
                          <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.4' }}><div>{vehicle.routeProgress.progressPercentage.toFixed(1)}% complete</div><div>Distance: {vehicle.routeProgress.distanceCovered.toFixed(1)} km</div><div>ETA: {formatTime(vehicle.routeProgress.nextStopETA)}</div></div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>Passenger Load</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: vehicle.passengerLoad.loadPercentage > 80 ? '#EF4444' : vehicle.passengerLoad.loadPercentage > 50 ? '#F59E0B' : '#10B981' }}>{vehicle.passengerLoad.loadPercentage.toFixed(0)}%</div>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>({vehicle.passengerLoad.currentCapacity}/{vehicle.passengerLoad.maxCapacity})</div>
                          </div>
                          <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.25rem' }}><div style={{ backgroundColor: vehicle.passengerLoad.loadPercentage > 80 ? '#EF4444' : vehicle.passengerLoad.loadPercentage > 50 ? '#F59E0B' : '#10B981', height: '8px', borderRadius: '0.25rem', width: `${vehicle.passengerLoad.loadPercentage}%`, transition: 'width 0.3s ease' }}></div></div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>Environmental Data</h4>
                          <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.4' }}><div>Weather: {vehicle.environmentalData?.weather || 'Unknown'}</div><div>Temperature: {vehicle.environmentalData?.temperature || 'N/A'}°C</div><div>Traffic: {vehicle.environmentalData?.trafficCondition || 'Unknown'}</div><div>Last Update: {formatTime(vehicle.timestamp)}</div></div>
                        </div>
                      </div>
                      {vehicle.operationalInfo.delays.reason && (<div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#7C2D12', borderRadius: '0.5rem', border: '1px solid #DC2626' }}><div style={{ fontSize: '0.875rem', color: '#FCA5A5', fontWeight: '500' }}>⚠️ Delay Reason: {vehicle.operationalInfo.delays.reason}</div></div>)}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>No vehicles currently tracked</h3>
                  <p>Start the simulation or check back later for live vehicle data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}