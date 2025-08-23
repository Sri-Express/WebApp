// src/app/routes/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  endLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  waypoints: Array<{
    name: string;
    coordinates: [number, number];
    estimatedTime: number;
    order: number;
  }>;
  distance: number;
  estimatedDuration: number;
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    frequency: number;
    daysOfWeek: string[];
    isActive: boolean;
  }>;
  operatorInfo: {
    fleetId: string;
    companyName: string;
    contactNumber: string;
  };
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: number;
    amenities?: string[]; // FIX: Made amenities optional
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
    discounts: Array<{
      type: 'student' | 'senior' | 'military';
      percentage: number;
    }>;
  };
  status: 'active' | 'inactive' | 'maintenance';
  avgRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RealtimeData {
  activeVehicles: number;
  averageDelay: number;
  nextDeparture: string;
  occupancyRate: number;
  lastUpdate: string;
}

export default function RouteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;
  
  const [route, setRoute] = useState<Route | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers };
    
    // Add auth header only if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(fullURL, { ...options, headers });
      if (!response.ok) { 
        if (response.status === 401 && token) { 
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          router.push('/login'); 
          return null; 
        } 
        throw new Error(`API Error: ${response.status}`); 
      }
      return await response.json();
    } catch (error) { console.error('API call error:', error); return null; }
  }, [router]);

  const loadRouteDetails = useCallback(async () => {
    if (!routeId) return;
    setLoading(true); setError('');
    try {
      const response = await apiCall(`/routes/${routeId}`);
      if (response) { setRoute(response.route); } else { setError('Route not found'); }
    } catch (error) { console.error('Error loading route details:', error); setError('Failed to load route details'); } finally { setLoading(false); }
  }, [routeId, apiCall]);

  const loadRealtimeData = useCallback(async () => {
    if (!routeId) return;
    try {
      const response = await apiCall(`/routes/${routeId}/realtime`);
      if (response) { setRealtimeData(response.realtimeData); }
    } catch (error) { console.error('Error loading realtime data:', error); }
  }, [routeId, apiCall]);

  useEffect(() => { loadRouteDetails(); loadRealtimeData(); }, [loadRouteDetails, loadRealtimeData]);

  const getVehicleIcon = (type: string) => type === 'bus' ? '🚌' : '🚊';
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'maintenance': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>★</span>);
    }
    return stars;
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  const formatTime = (timeString: string) => new Date(timeString).toLocaleTimeString();

  const renderOverview = () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Route Summary */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Route Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Journey Details</h4>
            <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
              <div><strong>Distance:</strong> {route?.distance}km</div>
              <div><strong>Duration:</strong> {formatDuration(route?.estimatedDuration || 0)}</div>
              <div><strong>Price per km:</strong> {formatPrice(route?.pricing.pricePerKm || 0)}</div>
              <div><strong>Capacity:</strong> {route?.vehicleInfo.capacity} passengers</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Operator Information</h4>
            <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
              <div><strong>Company:</strong> {route?.operatorInfo.companyName}</div>
              <div><strong>Contact:</strong> {route?.operatorInfo.contactNumber}</div>
              <div><strong>Fleet ID:</strong> {route?.operatorInfo.fleetId}</div>
              <div><strong>Vehicle Type:</strong> {route?.vehicleInfo.type}</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Ratings & Reviews</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {renderStars(route?.avgRating || 0)}
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1F2937' }}>{route?.avgRating || 0}/5</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
              Based on {route?.totalReviews || 0} reviews
            </div>
          </div>
        </div>
      </div>

      {/* Waypoints */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Route Waypoints</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Start Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '0.5rem', border: '1px solid #BBF7D0' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '50%', flexShrink: 0 }}></div>
            <div>
              <div style={{ fontWeight: '600', color: '#065F46' }}>{route?.startLocation.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#047857' }}>{route?.startLocation.address}</div>
            </div>
          </div>

          {/* Waypoints */}
          {route?.waypoints.sort((a, b) => a.order - b.order).map((waypoint, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#6B7280', borderRadius: '50%', flexShrink: 0 }}></div>
              <div>
                <div style={{ fontWeight: '600', color: '#374151' }}>{waypoint.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Est. time: {waypoint.estimatedTime} min</div>
              </div>
            </div>
          ))}

          {/* End Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '0.5rem', border: '1px solid #FCD34D' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '50%', flexShrink: 0 }}></div>
            <div>
              <div style={{ fontWeight: '600', color: '#92400E' }}>{route?.endLocation.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#B45309' }}>{route?.endLocation.address}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {route?.vehicleInfo?.amenities && route.vehicleInfo.amenities.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Vehicle Amenities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {route.vehicleInfo.amenities.map((amenity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Pricing Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Base Price</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>{formatPrice(route?.pricing.basePrice || 0)}</div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Per person, one way</div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Available Discounts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {route?.pricing.discounts.map((discount, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#F0FDF4', borderRadius: '0.25rem', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontSize: '0.9rem', color: '#065F46', textTransform: 'capitalize' }}>{discount.type}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10B981' }}>{discount.percentage}% off</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Route Schedules</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {route?.schedules.map((schedule, index) => (
          <div key={index} style={{ padding: '1.5rem', backgroundColor: schedule.isActive ? '#F9FAFB' : '#FEF2F2', borderRadius: '0.5rem', border: '1px solid', borderColor: schedule.isActive ? '#E5E7EB' : '#FECACA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937' }}>
                  {schedule.departureTime} - {schedule.arrivalTime}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  Duration: {formatDuration(route.estimatedDuration)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: schedule.isActive ? '#10B981' : '#EF4444', color: 'white' }}>
                  {schedule.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Operating Days</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {schedule.daysOfWeek.map((day) => (
                    <span key={day} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', fontSize: '0.8rem', color: '#374151' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Frequency</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  Every {schedule.frequency} minutes
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRealtime = () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Real-time Stats */}
      {realtimeData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{realtimeData.activeVehicles}</h3>
            <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Active Vehicles</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{realtimeData.averageDelay}min</h3>
            <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Average Delay</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{realtimeData.occupancyRate}%</h3>
            <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Occupancy Rate</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#3B82F6', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{formatTime(realtimeData.nextDeparture)}</h3>
            <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Next Departure</p>
          </div>
        </div>
      )}

      {/* Live Updates */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>Live Tracking</h3>
          <button onClick={loadRealtimeData} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
            🔄 Refresh
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Real-time Tracking Available</h4>
          <p style={{ marginBottom: '1rem' }}>Track vehicles on this route in real-time with live location updates</p>
          <Link href="/track" style={{ backgroundColor: '#10B981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>
            View Live Tracking
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading route details...</div>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#DC2626' }}>
          <h2>Error</h2>
          <p>{error || 'Route not found'}</p>
          <Link href="/routes" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
            Back to Routes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/routes" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>← Back to Routes</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>{route.name}</h1>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
                {route.startLocation.name} to {route.endLocation.name}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>
                {formatPrice(route.pricing.basePrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getStatusColor(route.status), color: 'white' }}>
                  {route.status}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  {getVehicleIcon(route.vehicleInfo.type)} {route.vehicleInfo.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Link href={`/book?routeId=${route._id}`} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            Book This Route
          </Link>
          <Link href="/track" style={{ backgroundColor: '#10B981', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            Track Vehicles
          </Link>
          <Link href="/search" style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
            Find Similar Routes
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '0.5rem 0.5rem 0 0', overflow: 'hidden' }}>
          {[
            { id: 'overview', name: 'Overview', icon: '📋' },
            { id: 'schedules', name: 'Schedules', icon: '🕐' },
            { id: 'realtime', name: 'Real-time', icon: '📡' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '1rem 1.5rem', border: 'none', backgroundColor: activeTab === tab.id ? '#F59E0B' : 'transparent', cursor: 'pointer', fontWeight: '600', color: activeTab === tab.id ? 'white' : '#6B7280', borderRadius: 0, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{tab.icon}</span>{tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '400px' }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'schedules' && renderSchedules()}
          {activeTab === 'realtime' && renderRealtime()}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
