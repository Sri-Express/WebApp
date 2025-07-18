// src/app/routes/page.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Route {
  _id: string; routeId: string; name: string;
  startLocation: { name: string; coordinates: [number, number]; address: string; };
  endLocation: { name: string; coordinates: [number, number]; address: string; };
  waypoints: Array<{ name: string; coordinates: [number, number]; estimatedTime: number; order: number; }>;
  distance: number; estimatedDuration: number;
  schedules: Array<{ departureTime: string; arrivalTime: string; frequency: number; daysOfWeek: string[]; isActive: boolean; }>;
  operatorInfo: { fleetId: string; companyName: string; contactNumber: string; };
  vehicleInfo: { type: 'bus' | 'train'; capacity: number; amenities: string[]; };
  pricing: { basePrice: number; pricePerKm: number; discounts: Array<{ type: 'student' | 'senior' | 'military'; percentage: number; }>; };
  status: 'active' | 'inactive' | 'maintenance'; avgRating: number; totalReviews: number; isActive: boolean; createdAt: string; updatedAt: string;
}

interface RoutesFilters {
  vehicleType: 'all' | 'bus' | 'train'; status: 'all' | 'active' | 'inactive' | 'maintenance'; minPrice: number; maxPrice: number;
  sortBy: 'name' | 'price' | 'rating' | 'distance' | 'duration'; sortOrder: 'asc' | 'desc'; search: string;
}

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<RoutesFilters>({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' });
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const getToken = () => localStorage.getItem('token');

  // ✅ FIXED: Robust URL construction to handle double /api issue
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
    
    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Remove trailing /api if present to avoid double /api
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    
    const fullURL = `${baseURL}/api${endpoint}`;
    console.log('API Call:', fullURL); // Debug log
    
    try {
      const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers } });
      if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; } throw new Error(`API Error: ${response.status}`); }
      return await response.json();
    } catch (error) { console.error('API call error:', error); return null; }
  }, [router]);

  const loadRoutes = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.vehicleType !== 'all') params.append('vehicleType', filters.vehicleType);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 10000) params.append('maxPrice', filters.maxPrice.toString());
      params.append('sortBy', filters.sortBy); params.append('sortOrder', filters.sortOrder);
      params.append('page', page.toString()); params.append('limit', pageSize.toString());

      const response = await apiCall(`/routes?${params.toString()}`);
      if (response) { setRoutes(response.routes || []); setTotalRoutes(response.total || 0); } else { setError('Failed to load routes'); }
    } catch (error) { console.error('Error loading routes:', error); setError('Failed to load routes'); } finally { setLoading(false); }
  }, [filters, page, pageSize, apiCall]);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  const handleFilterChange = (key: keyof RoutesFilters, value: any) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };

  const getVehicleIcon = (type: string) => type === 'bus' ? '🚌' : '🚊';
  const getStatusColor = (status: string) => ({ 'active': '#10B981', 'inactive': '#6B7280', 'maintenance': '#F59E0B' }[status] || '#6B7280');
  const renderStars = (rating: number) => { const stars = []; for (let i = 1; i <= 5; i++) { stars.push(<span key={i} style={{ color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>★</span>); } return stars; };
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDuration = (minutes: number) => { const hours = Math.floor(minutes / 60); const remainingMinutes = minutes % 60; return `${hours}h ${remainingMinutes}m`; };
  const totalPages = Math.ceil(totalRoutes / pageSize);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading routes...</div>
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
            <Link href="/dashboard" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <Link href="/search" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>Search Routes</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>All Routes</h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Explore all available bus and train routes across Sri Lanka</p>
        </div>

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Search Routes</label>
              <input type="text" placeholder="Search by route name or location..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Vehicle Type</label>
              <select value={filters.vehicleType} onChange={(e) => handleFilterChange('vehicleType', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}>
                <option value="all">All Vehicles</option><option value="bus">Bus</option><option value="train">Train</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}>
                <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Sort By</label>
              <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}>
                <option value="name">Route Name</option><option value="price">Price</option><option value="rating">Rating</option><option value="distance">Distance</option><option value="duration">Duration</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Price Range: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="range" min="0" max="5000" step="100" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))} style={{ flex: 1 }} />
                <span>to</span>
                <input type="range" min="1000" max="10000" step="100" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))} style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Sort Order</label>
              <select value={filters.sortOrder} onChange={(e) => handleFilterChange('sortOrder', e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}>
                <option value="asc">Ascending</option><option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Showing {routes.length} of {totalRoutes} routes</div>
            <button onClick={() => setFilters({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' })} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>Reset Filters</button>
          </div>
        </div>

        {/* Error Message */}
        {error && ( <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem' }}>{error}</div> )}

        {/* Routes Grid */}
        {routes.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {routes.map((route) => (
                <div key={route._id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>{route.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: getStatusColor(route.status), color: 'white' }}>{route.status}</span>
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>{getVehicleIcon(route.vehicleInfo.type)} {route.vehicleInfo.type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F59E0B' }}>{formatPrice(route.pricing.basePrice)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                        {renderStars(route.avgRating)}
                        <span style={{ color: '#6B7280' }}>({route.totalReviews})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{route.startLocation.name}</span><span>→</span><span style={{ fontWeight: '500' }}>{route.endLocation.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#6B7280' }}>
                      <span>📍 {route.distance}km</span><span>⏱️ {formatDuration(route.estimatedDuration)}</span><span>👥 {route.vehicleInfo.capacity} seats</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '0.5rem' }}><strong>Operator:</strong> {route.operatorInfo.companyName}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '0.5rem' }}><strong>Contact:</strong> {route.operatorInfo.contactNumber}</div>
                    {route.vehicleInfo.amenities.length > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#6B7280' }}><strong>Amenities:</strong> {route.vehicleInfo.amenities.slice(0, 3).join(', ')}{route.vehicleInfo.amenities.length > 3 && '...'}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/routes/${route._id}`} style={{ flex: 1, backgroundColor: '#3B82F6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}>View Details</Link>
                    <Link href={`/book?routeId=${route._id}`} style={{ flex: 1, backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}>Book Now</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ backgroundColor: page === 1 ? '#E5E7EB' : '#3B82F6', color: page === 1 ? '#9CA3AF' : 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)} style={{ backgroundColor: page === pageNum ? '#F59E0B' : 'white', color: page === pageNum ? 'white' : '#374151', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>{pageNum}</button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ backgroundColor: page === totalPages ? '#E5E7EB' : '#3B82F6', color: page === totalPages ? '#9CA3AF' : 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No routes found</h3>
            <p style={{ marginBottom: '1rem' }}>Try adjusting your search criteria or check back later</p>
            <button onClick={() => setFilters({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' })} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Reset Filters</button>
          </div>
        )}
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