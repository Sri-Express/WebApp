// src/app/routes/page.tsx - THE COMPLETE, FINAL, AND FULLY STYLED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// --- Data Interfaces ---
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
  const { theme } = useTheme();
  
  // --- State Management ---
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<RoutesFilters>({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' });
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    
    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    
    const fullURL = `${baseURL}/api${endpoint}`;
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(fullURL, { 
        ...options, 
        headers 
      });
      
      if (!response.ok) { 
        if (response.status === 401 && token) { 
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          router.push('/login'); 
          return null; 
        } 
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        throw new Error(`API Error: ${response.status}`); 
      }
      return await response.json();
    } catch (error) { 
      console.error('API call error:', error); 
      return null; 
    }
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

  const handleFilterChange = (key: keyof RoutesFilters, value: string | number) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };

  const getVehicleIcon = (type: string) => type === 'bus' ? '🚌' : '🚊';
  const getStatusColor = (status: string) => ({ 'active': '#10B981', 'inactive': '#6B7280', 'maintenance': '#F59E0B' }[status] || '#6B7280');
  const renderStars = (rating: number) => { const stars = []; for (let i = 1; i <= 5; i++) { stars.push(<span key={i} style={{ color: i <= rating ? '#F59E0B' : (theme === 'dark' ? '#4b5563' : '#D1D5DB') }}>★</span>); } return stars; };
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDuration = (minutes: number) => { const hours = Math.floor(minutes / 60); const remainingMinutes = minutes % 60; return `${hours}h ${remainingMinutes}m`; };
  const totalPages = Math.ceil(totalRoutes / pageSize);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `4px solid ${currentThemeStyles.glassPanelBorder}`, borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '16px', fontWeight: '600' }}>Loading Routes...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .route-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .action-button:hover { transform: translateY(-2px); }
        @media (max-width: 768px) { .nav-links { display: none; } }
      `}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1></div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/search" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Search</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down" style={{ width: '100%', maxWidth: '1400px' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>All Available Routes</h1>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Explore all available bus and train routes across Sri Lanka</p>
            </div>

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Search Routes</label>
                  <input type="text" placeholder="Search by name or location..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${currentThemeStyles.quickActionBorder}`, borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Vehicle Type</label>
                  <select value={filters.vehicleType} onChange={(e) => handleFilterChange('vehicleType', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${currentThemeStyles.quickActionBorder}`, borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }}>
                    <option value="all">All Vehicles</option><option value="bus">Bus</option><option value="train">Train</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Status</label>
                  <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${currentThemeStyles.quickActionBorder}`, borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }}>
                    <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Sort By</label>
                  <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${currentThemeStyles.quickActionBorder}`, borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }}>
                    <option value="name">Route Name</option><option value="price">Price</option><option value="rating">Rating</option><option value="distance">Distance</option><option value="duration">Duration</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>Showing {routes.length} of {totalRoutes} routes</div>
                <button onClick={() => setFilters({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' })} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>Reset Filters</button>
              </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem', backdropFilter: 'blur(5px)' }}>{error}</div>}

            {routes.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {routes.map((route) => (
                    <div key={route._id} className="route-card" style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, transition: 'all 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>{route.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', backgroundColor: getStatusColor(route.status), color: 'white' }}>{route.status}</span>
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>{getVehicleIcon(route.vehicleInfo.type)} {route.vehicleInfo.type}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F59E0B' }}>{formatPrice(route.pricing.basePrice)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                            {renderStars(route.avgRating)}
                            <span style={{ color: currentThemeStyles.textMuted }}>({route.totalReviews})</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '500' }}>{route.startLocation.name}</span><span>→</span><span style={{ fontWeight: '500' }}>{route.endLocation.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: currentThemeStyles.textMuted }}>
                          <span>📍 {route.distance}km</span><span>⏱️ {formatDuration(route.estimatedDuration)}</span><span>👥 {route.vehicleInfo.capacity} seats</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/routes/${route._id}`} className="action-button" style={{ flex: 1, backgroundColor: '#3B82F6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center', transition: 'all 0.2s' }}>View Details</Link>
                        <Link href={`/book?routeId=${route._id}`} className="action-button" style={{ flex: 1, backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center', transition: 'all 0.2s' }}>Book Now</Link>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ backgroundColor: page === 1 ? '#6B7280' : '#3B82F6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
                    <span style={{ color: currentThemeStyles.textPrimary }}>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ backgroundColor: page === totalPages ? '#6B7280' : '#3B82F6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No routes found</h3>
                <p style={{ marginBottom: '1rem' }}>Try adjusting your search criteria or check back later</p>
                <button onClick={() => setFilters({ vehicleType: 'all', status: 'active', minPrice: 0, maxPrice: 10000, sortBy: 'name', sortOrder: 'asc', search: '' })} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Reset Filters</button>
              </div>
            )}
          </div>
        </main>
      </div>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}