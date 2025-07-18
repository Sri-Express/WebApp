// src/app/sysadmin/devices/monitor/page.tsx - UPDATED WITH WORKING GPS MAP
"use client"; import { useState, useEffect, useCallback } from 'react'; import Link from 'next/link'; import { useRouter } from 'next/navigation'; import dynamic from 'next/dynamic'; import { GlobeAltIcon, DevicePhoneMobileIcon, MagnifyingGlassIcon, MapPinIcon, SignalIcon, BoltIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon, ViewColumnsIcon, MapIcon, FunnelIcon, EyeIcon } from '@heroicons/react/24/outline';

// Dynamic import for the map component (SSR safe)
const AdvancedMap = dynamic(() => import('../../../components/AdvancedMap'), { ssr: false, loading: () => <div style={{ height: '600px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem' }}><div style={{ color: '#94a3b8' }}>Loading advanced GPS map...</div></div> });

interface Device { _id: string; deviceId: string; vehicleNumber: string; vehicleType: 'bus' | 'train'; status: 'online' | 'offline' | 'maintenance'; lastSeen: string; location: { latitude: number; longitude: number; address: string; lastUpdated: string; }; batteryLevel: number; signalStrength: number; assignedTo: { type: 'route_admin' | 'company_admin' | 'system'; name: string; id: string; }; route?: { id: string; name: string; }; alerts: { count: number; messages: string[]; }; }

interface VehicleLocation { _id: string; deviceId: string; routeId: string; vehicleId: string; vehicleNumber: string; location: { latitude: number; longitude: number; accuracy: number; heading: number; speed: number; altitude: number; }; routeProgress: { currentWaypoint: number; distanceCovered: number; estimatedTimeToDestination: number; nextStopETA: string; progressPercentage: number; }; passengerLoad: { currentCapacity: number; maxCapacity: number; loadPercentage: number; }; operationalInfo: { driverInfo: { driverName: string; contactNumber: string; }; tripInfo: { tripId: string; departureTime: string; estimatedArrival: string; }; status: 'on_route' | 'at_stop' | 'delayed' | 'breakdown' | 'off_duty'; delays: { currentDelay: number; reason: string; }; }; environmentalData: { weather: string; temperature: number; trafficCondition: string; }; timestamp: string; }

interface SimulationStatus { isRunning: boolean; vehicleCount: number; speedMultiplier: number; routes: number; lastUpdate: string; }

type ViewMode = 'map' | 'grid' | 'hybrid';

export default function AdvancedDeviceMonitorPage() {
  const router = useRouter(); const [devices, setDevices] = useState<Device[]>([]); const [vehicles, setVehicles] = useState<VehicleLocation[]>([]); const [filteredDevices, setFilteredDevices] = useState<Device[]>([]); const [loading, setLoading] = useState(true); const [viewMode, setViewMode] = useState<ViewMode>('hybrid'); const [searchTerm, setSearchTerm] = useState(''); const [statusFilter, setStatusFilter] = useState('all'); const [typeFilter, setTypeFilter] = useState('all'); const [autoRefresh, setAutoRefresh] = useState(true); const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null); const [showSimulationData, setShowSimulationData] = useState(true);

  // Get auth token
  const getToken = () => localStorage.getItem('token');

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return null; } try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, }, }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; } throw new Error(`API Error: ${response.status}`); } return await response.json(); } catch (error) { console.error('API call error:', error); return null; } }, [router]);

  // Load devices data
  const loadDevices = useCallback(async () => { try { const response = await apiCall('/admin/devices?limit=1000'); if (response?.devices) { setDevices(response.devices); } } catch (error) { console.error('Error loading devices:', error); } }, [apiCall]);

  // Load real-time vehicle locations (GPS simulation data)
  const loadVehicleLocations = useCallback(async () => { try { const response = await apiCall('/tracking/live'); if (response?.vehicles) { setVehicles(response.vehicles); } } catch (error) { console.error('Error loading vehicle locations:', error); } }, [apiCall]);

  // Load simulation status
  const loadSimulationStatus = useCallback(async () => { try { const response = await apiCall('/admin/simulation/status'); if (response?.simulation) { setSimulationStatus(response.simulation); } } catch (error) { console.error('Error loading simulation status:', error); } }, [apiCall]);

  // Control simulation
  const controlSimulation = useCallback(async (action: 'start' | 'stop' | 'speed', value?: number) => { try { const endpoint = action === 'speed' ? `/admin/simulation/speed` : `/admin/simulation/${action}`; const options = action === 'speed' ? { method: 'POST', body: JSON.stringify({ speed: value }) } : { method: 'POST' }; const response = await apiCall(endpoint, options); if (response) { setSimulationStatus(response.simulation); if (action === 'start') setAutoRefresh(true); } } catch (error) { console.error('Error controlling simulation:', error); } }, [apiCall]);

  // Initial load
  useEffect(() => { const initialLoad = async () => { setLoading(true); await Promise.all([loadDevices(), loadVehicleLocations(), loadSimulationStatus()]); setLoading(false); }; initialLoad(); }, [loadDevices, loadVehicleLocations, loadSimulationStatus]);

  // Auto refresh
  useEffect(() => { if (!autoRefresh) return; const interval = setInterval(() => { loadDevices(); loadVehicleLocations(); loadSimulationStatus(); }, 5000); return () => clearInterval(interval); }, [autoRefresh, loadDevices, loadVehicleLocations, loadSimulationStatus]);

  // Filter devices
  useEffect(() => { let filtered = devices; if (searchTerm) { filtered = filtered.filter(device => device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) || device.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || device.location.address.toLowerCase().includes(searchTerm.toLowerCase()) || device.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())); } if (statusFilter !== 'all') { filtered = filtered.filter(device => device.status === statusFilter); } if (typeFilter !== 'all') { filtered = filtered.filter(device => device.vehicleType === typeFilter); } setFilteredDevices(filtered); }, [devices, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => { switch (status) { case 'online': return '#10b981'; case 'offline': return '#ef4444'; case 'maintenance': return '#f59e0b'; default: return '#6b7280'; } }; const getStatusIcon = (status: string) => { switch (status) { case 'online': return <CheckCircleIcon width={16} height={16} />; case 'offline': return <XCircleIcon width={16} height={16} />; case 'maintenance': return <ClockIcon width={16} height={16} />; default: return <ExclamationTriangleIcon width={16} height={16} />; } }; const getBatteryColor = (level: number) => { if (level > 50) return '#10b981'; if (level > 20) return '#f59e0b'; return '#ef4444'; }; const getTimeSince = (dateString: string) => { const now = new Date(); const past = new Date(dateString); const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60)); if (diffInMinutes < 1) return 'Just now'; if (diffInMinutes < 60) return `${diffInMinutes}m ago`; if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`; return `${Math.floor(diffInMinutes / 1440)}d ago`; };

  const handleRefresh = async () => { setLoading(true); await Promise.all([loadDevices(), loadVehicleLocations(), loadSimulationStatus()]); setLoading(false); };

  // Combine device and vehicle data for display
  const displayData = showSimulationData ? vehicles : filteredDevices; const deviceCounts = { total: devices.length, online: devices.filter(d => d.status === 'online').length, offline: devices.filter(d => d.status === 'offline').length, maintenance: devices.filter(d => d.status === 'maintenance').length, alerts: devices.reduce((sum, d) => sum + d.alerts.count, 0), simulationVehicles: vehicles.length };

  if (loading && devices.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}><div style={{ width: '48px', height: '48px', border: '4px solid #1e293b', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div><div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>Loading Advanced Device Monitor...</div><div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Initializing GPS tracking system</div></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Enhanced Navigation */}
      <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/sysadmin/devices" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Devices</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GlobeAltIcon width={24} height={24} color="#06b6d4" /><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Advanced GPS Monitor</h1>{simulationStatus && <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', backgroundColor: simulationStatus.isRunning ? '#10B981' : '#6B7280', color: 'white' }}>{simulationStatus.isRunning ? '🟢 Simulation Active' : '⭕ Simulation Stopped'}</span>}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ accentColor: '#3b82f6' }} />Auto Refresh (5s)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" checked={showSimulationData} onChange={(e) => setShowSimulationData(e.target.checked)} style={{ accentColor: '#10B981' }} />Show Simulation Data</label>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#334155', borderRadius: '0.5rem', padding: '0.25rem' }}>
              {(['grid', 'map', 'hybrid'] as ViewMode[]).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ backgroundColor: viewMode === mode ? '#3b82f6' : 'transparent', color: viewMode === mode ? 'white' : '#94a3b8', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', textTransform: 'capitalize' }}>{mode === 'grid' ? <ViewColumnsIcon width={16} height={16} /> : mode === 'map' ? <MapIcon width={16} height={16} /> : <GlobeAltIcon width={16} height={16} />}{mode}</button>
              ))}
            </div>

            <button onClick={handleRefresh} disabled={loading} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}><ArrowPathIcon width={16} height={16} />Refresh</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Enhanced Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><DevicePhoneMobileIcon width={32} height={32} color="#3b82f6" /><div><h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{deviceCounts.total}</h3><p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Devices</p></div></div></div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircleIcon width={32} height={32} color="#10b981" /><div><h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{showSimulationData ? deviceCounts.simulationVehicles : deviceCounts.online}</h3><p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>{showSimulationData ? 'GPS Vehicles' : 'Online'}</p></div></div></div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><XCircleIcon width={32} height={32} color="#ef4444" /><div><h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{deviceCounts.offline}</h3><p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Offline</p></div></div></div>
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><ExclamationTriangleIcon width={32} height={32} color="#f59e0b" /><div><h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{deviceCounts.alerts}</h3><p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Alerts</p></div></div></div>
          {simulationStatus && (
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><GlobeAltIcon width={32} height={32} color="#8B5CF6" /><div><h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{simulationStatus.speedMultiplier}x</h3><p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Sim Speed</p></div></div></div>
          )}
        </div>

        {/* Simulation Controls */}
        {simulationStatus && (
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#e2e8f0', fontWeight: '600' }}>GPS Simulation Control:</span></div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => controlSimulation(simulationStatus.isRunning ? 'stop' : 'start')} style={{ backgroundColor: simulationStatus.isRunning ? '#EF4444' : '#10B981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>{simulationStatus.isRunning ? '⏹️ Stop Simulation' : '▶️ Start Simulation'}</button>
                <select onChange={(e) => controlSimulation('speed', parseFloat(e.target.value))} value={simulationStatus.speedMultiplier} style={{ padding: '0.5rem', border: '1px solid #475569', borderRadius: '0.375rem', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '0.875rem' }}><option value="0.5">0.5x Speed</option><option value="1">1x Normal</option><option value="2">2x Fast</option><option value="5">5x Very Fast</option></select>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{simulationStatus.vehicleCount} vehicles • {simulationStatus.routes} routes</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FunnelIcon width={20} height={20} color="#94a3b8" /><span style={{ color: '#e2e8f0', fontWeight: '600' }}>Filters:</span></div>
            <div style={{ position: 'relative', flex: '1 1 300px' }}><MagnifyingGlassIcon width={20} height={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} /><input type="text" placeholder="Search devices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '0.5rem', border: '1px solid #475569', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #475569', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '1rem', outline: 'none' }}><option value="all">All Status</option><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #475569', backgroundColor: '#334155', color: '#f1f5f9', fontSize: '1rem', outline: 'none' }}><option value="all">All Types</option><option value="bus">Bus</option><option value="train">Train</option></select>
          </div>
          <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>Showing {showSimulationData ? vehicles.length : filteredDevices.length} {showSimulationData ? 'simulation vehicles' : 'devices'} • Updated {new Date().toLocaleTimeString()}</div>
        </div>

        {/* Content Area */}
        {viewMode === 'map' ? (
          /* Map View Only */
          <div style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden', height: '70vh' }}>
            <AdvancedMap vehicles={vehicles} routes={[]} selectedVehicle={selectedVehicle} onVehicleSelect={setSelectedVehicle} height="70vh" showControls={true} />
          </div>
        ) : viewMode === 'hybrid' ? (
          /* Hybrid View - Map + Grid */
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: '70vh' }}>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' }}>
              <AdvancedMap vehicles={vehicles} routes={[]} selectedVehicle={selectedVehicle} onVehicleSelect={setSelectedVehicle} height="70vh" showControls={true} />
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Grid View - Compact for hybrid */}
              {displayData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(showSimulationData ? vehicles : filteredDevices).slice(0, 10).map((item) => {
                    const isVehicle = 'operationalInfo' in item; const device = item as Device; const vehicle = item as VehicleLocation;
                    return (
                      <div key={item._id} onClick={() => isVehicle && setSelectedVehicle(selectedVehicle === vehicle.vehicleId ? null : vehicle.vehicleId)} style={{ backgroundColor: isVehicle && selectedVehicle === vehicle.vehicleId ? '#374151' : '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${isVehicle && selectedVehicle === vehicle.vehicleId ? '#3B82F6' : '#334155'}`, cursor: isVehicle ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{isVehicle ? (vehicle.vehicleId.includes('TRAIN') ? '🚊' : '🚌') : <TruckIcon width={16} height={16} />}{isVehicle ? vehicle.vehicleNumber : device.vehicleNumber}{isVehicle && selectedVehicle === vehicle.vehicleId && <span style={{ fontSize: '0.75rem', color: '#3B82F6' }}>📍</span>}</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>{isVehicle ? `${vehicle.operationalInfo.driverInfo.driverName} • Speed: ${vehicle.location.speed.toFixed(1)} km/h` : `${device.assignedTo.name} • ${device.vehicleType}`}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isVehicle ? (
                              <span style={{ color: vehicle.operationalInfo.status === 'on_route' ? '#10B981' : vehicle.operationalInfo.status === 'delayed' ? '#F59E0B' : '#6B7280', fontSize: '0.75rem', fontWeight: '500', textTransform: 'capitalize' }}>{vehicle.operationalInfo.status.replace('_', ' ')}</span>
                            ) : (
                              <>
                                <span style={{ color: getStatusColor(device.status) }}>{getStatusIcon(device.status)}</span>
                                <span style={{ color: getStatusColor(device.status), fontSize: '0.75rem', textTransform: 'capitalize' }}>{device.status}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isVehicle && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span>Load: {vehicle.passengerLoad.loadPercentage.toFixed(0)}%</span>
                            <span>Progress: {vehicle.routeProgress.progressPercentage.toFixed(0)}%</span>
                            {vehicle.operationalInfo.delays.currentDelay > 0 && <span style={{ color: '#F59E0B' }}>+{vehicle.operationalInfo.delays.currentDelay}min</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155', textAlign: 'center' }}>
                  <DevicePhoneMobileIcon width={48} height={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>No data found</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Try adjusting your filters or starting the simulation</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View Only */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {(showSimulationData ? vehicles : filteredDevices).map((item) => {
              const isVehicle = 'operationalInfo' in item; const device = item as Device; const vehicle = item as VehicleLocation;
              return (
                <div key={item._id} onClick={() => isVehicle && setSelectedVehicle(selectedVehicle === vehicle.vehicleId ? null : vehicle.vehicleId)} style={{ backgroundColor: isVehicle && selectedVehicle === vehicle.vehicleId ? '#374151' : '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: `1px solid ${isVehicle && selectedVehicle === vehicle.vehicleId ? '#3B82F6' : '#334155'}`, transition: 'all 0.2s', cursor: isVehicle ? 'pointer' : 'default' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = isVehicle && selectedVehicle === vehicle.vehicleId ? '#3B82F6' : '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {/* Device/Vehicle Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{isVehicle ? (vehicle.vehicleId.includes('TRAIN') ? '🚊' : '🚌') : device.deviceId}{isVehicle ? vehicle.vehicleNumber : device.vehicleNumber}{isVehicle && selectedVehicle === vehicle.vehicleId && <span style={{ fontSize: '0.875rem', color: '#3B82F6' }}>📍 Selected</span>}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TruckIcon width={14} height={14} />{isVehicle ? `${vehicle.operationalInfo.driverInfo.driverName} • Speed: ${vehicle.location.speed.toFixed(1)} km/h` : `${device.vehicleNumber} • ${device.vehicleType}`}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isVehicle ? (
                        <span style={{ color: vehicle.operationalInfo.status === 'on_route' ? '#10B981' : vehicle.operationalInfo.status === 'delayed' ? '#F59E0B' : '#6B7280', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{vehicle.operationalInfo.status.replace('_', ' ')}</span>
                      ) : (
                        <>
                          <span style={{ color: getStatusColor(device.status) }}>{getStatusIcon(device.status)}</span>
                          <span style={{ color: getStatusColor(device.status), fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{device.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  {isVehicle ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}><div style={{ color: '#3B82F6', fontSize: '0.875rem', fontWeight: '600' }}>{vehicle.location.speed.toFixed(1)}</div><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>km/h</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ color: vehicle.passengerLoad.loadPercentage > 80 ? '#EF4444' : '#10B981', fontSize: '0.875rem', fontWeight: '600' }}>{vehicle.passengerLoad.loadPercentage.toFixed(0)}%</div><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Load</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ color: '#8B5CF6', fontSize: '0.875rem', fontWeight: '600' }}>{vehicle.routeProgress.progressPercentage.toFixed(0)}%</div><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Progress</div></div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}><BoltIcon width={20} height={20} color={getBatteryColor(device.batteryLevel)} style={{ margin: '0 auto 0.25rem' }} /><div style={{ color: getBatteryColor(device.batteryLevel), fontSize: '0.875rem', fontWeight: '600' }}>{device.batteryLevel}%</div></div>
                      <div style={{ textAlign: 'center' }}><SignalIcon width={20} height={20} color="#10b981" style={{ margin: '0 auto 0.25rem' }} /><div style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>{device.signalStrength}/5</div></div>
                      <div style={{ textAlign: 'center' }}><ExclamationTriangleIcon width={20} height={20} color={device.alerts.count > 0 ? '#f59e0b' : '#6b7280'} style={{ margin: '0 auto 0.25rem' }} /><div style={{ color: device.alerts.count > 0 ? '#f59e0b' : '#6b7280', fontSize: '0.875rem', fontWeight: '600' }}>{device.alerts.count}</div></div>
                    </div>
                  )}

                  {/* Location Info */}
                  <div style={{ backgroundColor: '#334155', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><MapPinIcon width={14} height={14} color="#94a3b8" /><span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Location</span></div>
                    <p style={{ color: '#f1f5f9', fontSize: '0.875rem', margin: 0, lineHeight: '1.4' }}>{isVehicle ? `${vehicle.location.latitude.toFixed(4)}, ${vehicle.location.longitude.toFixed(4)}` : device.location.address}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Updated {isVehicle ? getTimeSince(vehicle.timestamp) : getTimeSince(device.location.lastUpdated)}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/sysadmin/devices/${item._id}`} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><EyeIcon width={14} height={14} />View Details</Link>
                    <button onClick={() => window.open(`https://maps.google.com/?q=${isVehicle ? vehicle.location.latitude : device.location.latitude},${isVehicle ? vehicle.location.longitude : device.location.longitude}`, '_blank')} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPinIcon width={14} height={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {displayData.length === 0 && !loading && (
          <div style={{ backgroundColor: '#1e293b', padding: '3rem', borderRadius: '0.75rem', border: '1px solid #334155', textAlign: 'center' }}>
            <DevicePhoneMobileIcon width={48} height={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>No {showSimulationData ? 'simulation vehicles' : 'devices'} found</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>{showSimulationData ? 'Start the GPS simulation to see vehicles' : 'Try adjusting your search criteria or filters'}</p>
          </div>
        )}
      </div>

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}