// src/app/track/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VehicleLocation {
  _id: string; deviceId: string; routeId: string; vehicleId: string; vehicleNumber: string;
  location: { latitude: number; longitude: number; accuracy: number; heading: number; speed: number; altitude: number; };
  routeProgress: { currentWaypoint: number; distanceCovered: number; estimatedTimeToDestination: number; nextStopETA: string; progressPercentage: number; };
  passengerLoad: { currentCapacity: number; maxCapacity: number; loadPercentage: number; };
  operationalInfo: { driverInfo: { driverName: string; contactNumber: string; }; tripInfo: { tripId: string; departureTime: string; estimatedArrival: string; }; status: 'on_route' | 'at_stop' | 'delayed' | 'breakdown' | 'off_duty'; delays: { currentDelay: number; reason: string; }; };
  timestamp: string;
}

interface Route {
  _id: string; name: string;
  startLocation: { name: string; address: string; };
  endLocation: { name: string; address: string; };
  waypoints: Array<{ name: string; coordinates: [number, number]; order: number; }>;
}

export default function TrackingPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // *** FIX: Removed the hardcoded "/api" prefix from the URL construction ***
    const fullURL = `${baseURL}${endpoint}`;

    try {
      const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, } });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; }
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      if (error instanceof Error) setError(error.message);
      return null;
    }
  }, [router]);

  const loadVehicleLocations = useCallback(async () => {
    // Now these endpoints will be called correctly (e.g., /tracking/live)
    const endpoint = selectedRoute === 'all' ? '/tracking/live' : `/tracking/route/${selectedRoute}`;
    const response = await apiCall(endpoint);
    if (response) { setVehicles(response.vehicles || []); setLastUpdate(new Date()); setError(''); }
  }, [selectedRoute, apiCall]);

  const loadRoutes = useCallback(async () => {
    const response = await apiCall('/routes?status=active');
    if (response) setRoutes(response.routes || []);
  }, [apiCall]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadVehicleLocations(), loadRoutes()]);
      setLoading(false);
    };
    loadData();
  }, [loadVehicleLocations, loadRoutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) { interval = setInterval(() => { loadVehicleLocations(); }, 5000); }
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, loadVehicleLocations]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = { on_route: '#10B981', at_stop: '#F59E0B', delayed: '#EF4444', breakdown: '#DC2626', off_duty: '#6B7280' };
    return colors[status] || '#6B7280';
  };
  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = { on_route: 'On Route', at_stop: 'At Stop', delayed: 'Delayed', breakdown: 'Breakdown', off_duty: 'Off Duty' };
    return labels[status] || 'Unknown';
  };
  const formatTime = (timeString: string) => new Date(timeString).toLocaleTimeString();
  const formatSpeed = (speed: number) => `${speed.toFixed(1)} km/h`;
  const formatLastUpdate = (date: Date) => date.toLocaleTimeString();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading live tracking...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <Link href="/bookings" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>My Bookings</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Live Vehicle Tracking</h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Real-time locations and status of vehicles across Sri Lanka</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Filter by Route</label>
              <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', minWidth: '200px' }}>
                <option value="all">All Routes</option>
                {routes.map((route) => (<option key={route._id} value={route._id}>{route.name}</option>))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Auto Refresh</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /><span>Every 5 seconds</span></label>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={loadVehicleLocations} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>🔄 Refresh Now</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div><span style={{ fontSize: '0.9rem', color: '#6B7280' }}>{vehicles.length} vehicles tracked</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div><span style={{ fontSize: '0.9rem', color: '#6B7280' }}>Last update: {formatLastUpdate(lastUpdate)}</span></div>
          </div>
        </div>

        {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem' }}>{error}</div>}

        {vehicles.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>🚌 {vehicle.vehicleNumber}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getStatusColor(vehicle.operationalInfo.status), color: 'white' }}>{getStatusLabel(vehicle.operationalInfo.status)}</span>
                      {vehicle.operationalInfo.delays.currentDelay > 0 && (<span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: '#EF4444', color: 'white' }}>+{vehicle.operationalInfo.delays.currentDelay} min</span>)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}><div>Driver: {vehicle.operationalInfo.driverInfo.driverName}</div><div>Contact: {vehicle.operationalInfo.driverInfo.contactNumber}</div><div>Speed: {formatSpeed(vehicle.location.speed)}</div></div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Route Progress</h4>
                    <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '0.5rem' }}><div style={{ backgroundColor: '#F59E0B', height: '8px', borderRadius: '0.25rem', width: `${vehicle.routeProgress.progressPercentage}%`, transition: 'width 0.3s ease' }}></div></div>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}><div>{vehicle.routeProgress.progressPercentage.toFixed(1)}% complete</div><div>Distance: {vehicle.routeProgress.distanceCovered.toFixed(1)} km</div><div>Next stop ETA: {formatTime(vehicle.routeProgress.nextStopETA)}</div></div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Passenger Load</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: vehicle.passengerLoad.loadPercentage > 80 ? '#EF4444' : vehicle.passengerLoad.loadPercentage > 50 ? '#F59E0B' : '#10B981' }}>{vehicle.passengerLoad.loadPercentage.toFixed(0)}%</div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>({vehicle.passengerLoad.currentCapacity}/{vehicle.passengerLoad.maxCapacity})</div>
                    </div>
                    <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem' }}><div style={{ backgroundColor: vehicle.passengerLoad.loadPercentage > 80 ? '#EF4444' : vehicle.passengerLoad.loadPercentage > 50 ? '#F59E0B' : '#10B981', height: '8px', borderRadius: '0.25rem', width: `${vehicle.passengerLoad.loadPercentage}%`, transition: 'width 0.3s ease' }}></div></div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Trip Details</h4>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}><div>Trip ID: {vehicle.operationalInfo.tripInfo.tripId}</div><div>Departure: {formatTime(vehicle.operationalInfo.tripInfo.departureTime)}</div><div>Est. Arrival: {formatTime(vehicle.operationalInfo.tripInfo.estimatedArrival)}</div><div>Last Update: {formatTime(vehicle.timestamp)}</div></div>
                  </div>
                </div>
                {vehicle.operationalInfo.delays.reason && (<div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '0.5rem', border: '1px solid #FCD34D' }}><div style={{ fontSize: '0.9rem', color: '#92400E', fontWeight: '500' }}>Delay Reason: {vehicle.operationalInfo.delays.reason}</div></div>)}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No vehicles currently tracked</h3>
            <p>Check back later or try selecting a different route</p>
          </div>
        )}
      </div>

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}