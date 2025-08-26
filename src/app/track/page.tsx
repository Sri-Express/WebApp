// src/app/track/page.tsx - FIXED VERSION WITH ANIMATEDBACKGROUND COMPONENT
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TruckIcon, MapPinIcon, ClockIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';

// --- DYNAMICALLY IMPORTED COMPONENT ---
const AdvancedMap = dynamic(() => import('../components/AdvancedMap'), { ssr: false });

// --- TYPE DEFINITIONS ---
interface VehicleLocation {
  _id: string; deviceId: string; routeId: string; vehicleId?: string; vehicleNumber: string;
  location: { latitude: number; longitude: number; accuracy: number; heading: number; speed: number; altitude: number; };
  routeProgress: { currentWaypoint: number; distanceCovered: number; estimatedTimeToDestination: number; nextStopETA: string; progressPercentage: number; };
  passengerLoad: { currentCapacity: number; maxCapacity: number; loadPercentage: number; };
  operationalInfo: { driverInfo: { driverName: string; contactNumber: string; }; tripInfo: { tripId: string; departureTime: string; estimatedArrival: string; }; status: 'on_route' | 'at_stop' | 'delayed' | 'breakdown' | 'off_duty'; delays: { currentDelay: number; reason: string; }; };
  environmentalData: { weather: string; temperature: number; trafficCondition: string; }; timestamp: string;
}
interface Route { _id: string; name: string; startLocation: { name: string; address: string; }; endLocation: { name: string; address: string; }; waypoints: Array<{ name: string; coordinates: [number, number]; order: number; }>; }
interface SimulationStatus { isRunning: boolean; speedMultiplier: number; }
type ViewMode = 'map' | 'list' | 'both';

// --- MAIN COMPONENT ---
export default function AdvancedTrackingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);
  
  // --- CONSISTENT THEME STYLING ---
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    cardBg: 'rgba(249, 250, 251, 0.8)',
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)',
    navBg: 'rgba(255, 255, 255, 0.85)',
    navBorder: '1px solid rgba(251, 191, 36, 0.2)',
    buttonBg: '#f3f4f6',
    buttonText: '#374151',
    buttonHoverBg: '#e5e7eb',
    selectBg: '#f9fafb',
    selectBorder: '#d1d5db',
    selectText: '#111827',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af',
    cardBg: 'rgba(51, 65, 85, 0.8)',
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)',
    navBg: 'rgba(30, 41, 59, 0.9)',
    navBorder: '1px solid rgba(75, 85, 99, 0.5)',
    buttonBg: '#374151',
    buttonText: '#f9fafb',
    buttonHoverBg: '#4b5563',
    selectBg: '#334155',
    selectBorder: '#475569',
    selectText: '#f1f5f9',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // --- API & DATA LOGIC ---
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = () => { try { const user = JSON.parse(localStorage.getItem('user') || '{}'); return user.role === 'system_admin'; } catch { return false; } };

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${baseURL}/api${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, } });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; }
        if (response.status === 403 && endpoint.includes('/admin/')) { console.log('Admin endpoint access denied - user not authorized'); return null; }
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      if (!(error instanceof Error && error.message.includes('403') && endpoint.includes('/admin/'))) { if (error instanceof Error) setError(error.message); }
      return null;
    }
  }, [router]);

  const loadVehicleLocations = useCallback(async () => {
    const endpoint = selectedRoute === 'all' ? '/tracking/live' : `/tracking/route/${selectedRoute}`;
    const response = await apiCall(endpoint);
    if (response?.vehicles) { setVehicles(response.vehicles); setLastUpdate(new Date()); setError(''); }
  }, [selectedRoute, apiCall]);

  const loadRoutes = useCallback(async () => {
    const response = await apiCall('/routes?status=active');
    if (response?.routes || Array.isArray(response)) setRoutes(response.routes || response);
  }, [apiCall]);

  const loadSimulationStatus = useCallback(async () => {
    if (isAdmin()) { const response = await apiCall('/admin/simulation/status'); if (response?.simulation) setSimulationStatus(response.simulation); }
  }, [apiCall]);

  const controlSimulation = useCallback(async (action: 'start' | 'stop' | 'speed', value?: number) => {
    if (!isAdmin()) return;
    const endpoint = action === 'speed' ? `/admin/simulation/speed` : `/admin/simulation/${action}`;
    const options = action === 'speed' ? { method: 'POST', body: JSON.stringify({ speed: value }) } : { method: 'POST' };
    const response = await apiCall(endpoint, options);
    if (response?.simulation) { setSimulationStatus(response.simulation); if (action === 'start') setAutoRefresh(true); }
  }, [apiCall]);

  useEffect(() => {
    const loadData = async () => { setLoading(true); await Promise.all([loadVehicleLocations(), loadRoutes(), loadSimulationStatus()]); setLoading(false); };
    loadData();
  }, [loadVehicleLocations, loadRoutes, loadSimulationStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { loadVehicleLocations(); if (isAdmin()) loadSimulationStatus(); }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadVehicleLocations, loadSimulationStatus]);

  const filteredVehicles = useMemo(() => vehicles.filter(vehicle => selectedRoute === 'all' || vehicle.routeId === selectedRoute), [vehicles, selectedRoute]);
  const getStatusColor = (status: string) => ({ on_route: '#10B981', at_stop: '#3B82F6', delayed: '#F59E0B', breakdown: '#EF4444', off_duty: '#6B7280' }[status] || '#6B7280');
  const formatSpeed = (speed: number) => `${speed.toFixed(1)} km/h`;

  // Helper function to safely get vehicle ID
  const getVehicleId = (vehicle: VehicleLocation) => vehicle.vehicleId || vehicle._id || 'unknown';
  
  // Convert VehicleLocation to Vehicle type for the map
  const convertToVehicleType = (vehicleLocation: VehicleLocation) => ({
    vehicleId: getVehicleId(vehicleLocation),
    vehicleNumber: vehicleLocation.vehicleNumber,
    location: vehicleLocation.location,
    operationalInfo: vehicleLocation.operationalInfo,
    passengerLoad: vehicleLocation.passengerLoad,
    routeProgress: vehicleLocation.routeProgress,
    timestamp: vehicleLocation.timestamp
  });
  
  const isTrainVehicle = (vehicle: VehicleLocation) => {
    const vehicleId = getVehicleId(vehicle);
    return vehicleId.toLowerCase().includes('train') || vehicle.vehicleNumber?.toLowerCase().includes('train');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(59, 130, 246, 0.3)', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '18px', fontWeight: '500' }}>Loading GPS Tracking...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx global>{`
        @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
        .animate-road-marking { animation: road-marking 10s linear infinite; }
        @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
        .animate-car-right { animation: car-right 15s linear infinite; }
        @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } }
        .animate-car-left { animation: car-left 16s linear infinite; }
        @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
        .animate-light-blink { animation: light-blink 1s infinite; }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        @keyframes trainMove { from { left: 100%; } to { left: -300px; } }
        @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } }
        .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; }
        @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } }
        .animate-steam { animation: steam 2s ease-out infinite; }
        @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        .animate-wheels { animation: wheels 2s linear infinite; }
        @keyframes connecting-rod { 0% { transform: translateX(-1px) rotate(0deg); } 50% { transform: translateX(1px) rotate(180deg); } 100% { transform: translateX(-1px) rotate(360deg); } }
        .animate-connecting-rod { animation: connecting-rod 2s linear infinite; }
        @keyframes piston-move { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } }
        .animate-piston { animation: piston-move 2s linear infinite; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1200 { animation-delay: 1.2s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }
        .animation-delay-3000 { animation-delay: 3s; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 768px) { .animated-vehicle { display: none; } }
      `}</style>
      
      {/* --- ANIMATED BACKGROUND COMPONENT --- */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: currentThemeStyles.navBg, backdropFilter: 'blur(12px)', borderBottom: currentThemeStyles.navBorder, padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>ශ්‍රී</span><span style={{ color: currentThemeStyles.textPrimary }}>Express</span><span style={{ color: '#3B82F6', fontSize: '0.875rem', marginLeft: '0.5rem' }}>GPS Pro</span>
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <Link href="/dashboard" style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>Dashboard</Link>
            <Link href="/bookings" style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' }}>My Bookings</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '500' }}>Live</span>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1800px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div className="animate-fade-in-down" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Advanced GPS Tracking</h1>
          <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Real-time vehicle monitoring across Sri Lanka</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {[ { label: 'Active Vehicles', value: filteredVehicles.length, icon: TruckIcon, color: '#3B82F6' }, { label: 'On Route', value: filteredVehicles.filter(v => v.operationalInfo.status === 'on_route').length, icon: MapPinIcon, color: '#10B981' }, { label: 'Delayed', value: filteredVehicles.filter(v => v.operationalInfo.delays.currentDelay > 0).length, icon: ClockIcon, color: '#F59E0B' }, { label: 'Avg Load', value: `${Math.round(filteredVehicles.reduce((acc, v) => acc + (v.passengerLoad?.loadPercentage || 0), 0) / (filteredVehicles.length || 1))}%`, icon: UsersIcon, color: '#8B5CF6' } ].map((stat, index) => (
            <div key={stat.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'brightness(1.1)' }}><stat.icon width={24} height={24} color="white" /></div>
                <div><h3 style={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h3><p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{stat.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} style={{ padding: '0.75rem 1rem', border: `1px solid ${currentThemeStyles.selectBorder}`, borderRadius: '0.5rem', backgroundColor: currentThemeStyles.selectBg, color: currentThemeStyles.selectText, fontSize: '1rem', minWidth: '200px' }}>
                <option value="all">All Routes ({vehicles.length} vehicles)</option>
                {routes.map((route) => (<option key={route._id} value={route._id}>{route.name}</option>))}
              </select>

              {simulationStatus && isAdmin() && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => controlSimulation(simulationStatus.isRunning ? 'stop' : 'start')} style={{ backgroundColor: simulationStatus.isRunning ? '#EF4444' : '#10B981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>{simulationStatus.isRunning ? '⏹️ Stop' : '▶️ Start'}</button>
                  <select onChange={(e) => controlSimulation('speed', parseFloat(e.target.value))} value={simulationStatus.speedMultiplier} style={{ padding: '0.5rem', border: `1px solid ${currentThemeStyles.selectBorder}`, borderRadius: '0.375rem', backgroundColor: currentThemeStyles.selectBg, color: currentThemeStyles.selectText, fontSize: '0.875rem' }}>
                    <option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option><option value="5">5x</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: currentThemeStyles.buttonBg, padding: '0.25rem', borderRadius: '0.6rem' }}>
              {['map', 'list', 'both'].map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode as ViewMode)} style={{ backgroundColor: viewMode === mode ? '#3B82F6' : 'transparent', color: viewMode === mode ? 'white' : currentThemeStyles.textSecondary, padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{mode}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Last update: {lastUpdate.toLocaleTimeString()}</div>
        </div>

        {error && <div style={{ backgroundColor: theme === 'dark' ? '#7F1D1D' : '#FEF2F2', color: theme === 'dark' ? '#FCA5A5' : '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${theme === 'dark' ? '#B91C1C' : '#FCA5A5'}`, marginBottom: '2rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'both' ? '1fr 450px' : '1fr', gap: '2rem', height: viewMode === 'map' ? '70vh' : 'auto' }}>
          {(viewMode === 'map' || viewMode === 'both') && (
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden' }}>
              <AdvancedMap 
                vehicles={(filteredVehicles.length > 0 ? filteredVehicles : vehicles).map(convertToVehicleType)} 
                selectedVehicle={selectedVehicle} 
                onVehicleSelect={setSelectedVehicle} 
                height={viewMode === 'both' ? '650px' : '70vh'} 
              />
            </div>
          )}

          {(viewMode === 'list' || viewMode === 'both') && (
            <div style={{ maxHeight: viewMode === 'both' ? '650px' : 'none', overflowY: viewMode === 'both' ? 'auto' : 'visible' }}>
              {filteredVehicles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredVehicles.map((vehicle, index) => {
                    const vehicleId = getVehicleId(vehicle);
                    return (
                      <div key={vehicle._id} onClick={() => setSelectedVehicle(selectedVehicle === vehicleId ? null : vehicleId)} style={{ backgroundColor: selectedVehicle === vehicleId ? 'rgba(59, 130, 246, 0.2)' : currentThemeStyles.cardBg, padding: '1.5rem', borderRadius: '0.75rem', border: `2px solid ${selectedVehicle === vehicleId ? '#3B82F6' : currentThemeStyles.cardBorder}`, cursor: 'pointer', transition: 'all 0.2s', animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both` }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TruckIcon width={20} height={20} color={currentThemeStyles.textPrimary} />
                          {vehicle.vehicleNumber} 
                          {selectedVehicle === vehicleId && <span style={{ fontSize: '0.875rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPinIcon width={16} height={16} color="#3B82F6" /> Selected</span>}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: getStatusColor(vehicle.operationalInfo.status), color: 'white' }}>{vehicle.operationalInfo.status.replace('_', ' ').toUpperCase()}</span>
                          {vehicle.operationalInfo.delays.currentDelay > 0 && (<span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#F59E0B', color: 'white' }}>+{vehicle.operationalInfo.delays.currentDelay} min</span>)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, lineHeight: '1.5' }}>
                          <div>Driver: {vehicle.operationalInfo.driverInfo.driverName}</div>
                          <div>Speed: {formatSpeed(vehicle.location.speed)} • Load: {vehicle.passengerLoad.loadPercentage.toFixed(0)}% • Progress: {vehicle.routeProgress.progressPercentage.toFixed(1)}%</div>
                        </div>
                        {vehicle.operationalInfo.delays.reason && (
                          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: theme === 'dark' ? '#7C2D12' : '#FEF2F2', borderRadius: '0.5rem', border: `1px solid ${theme === 'dark' ? '#DC2626' : '#FCA5A5'}` }}>
                            <div style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#FCA5A5' : '#991B1B', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ExclamationTriangleIcon width={16} height={16} color={theme === 'dark' ? '#FCA5A5' : '#991B1B'} /> 
                              Delay: {vehicle.operationalInfo.delays.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No vehicles tracked</h3>
                  <p style={{ margin: 0 }}>Start the simulation or select a different route.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}