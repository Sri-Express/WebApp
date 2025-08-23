// src/app/search/page.tsx - THE COMPLETE, FINAL, AND CORRECTED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { 
  ShieldCheckIcon, MapPinIcon, StarIcon, ClockIcon, UsersIcon, BuildingOffice2Icon, PhoneIcon, MagnifyingGlassIcon, TruckIcon
} from '@heroicons/react/24/outline';

// --- Data Interfaces ---
interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: { name: string; coordinates: [number, number]; address: string; };
  endLocation: { name:string; coordinates: [number, number]; address: string; };
  distance: number;
  estimatedDuration: number;
  schedules: Array<{ departureTime: string; arrivalTime: string; frequency: number; daysOfWeek: string[]; isActive: boolean; }>;
  operatorInfo: { companyName: string; contactNumber: string; };
  vehicleInfo: { type: 'bus' | 'train'; capacity: number; amenities: string[]; };
  pricing: { basePrice: number; pricePerKm: number; discounts: Array<{ type: string; percentage: number; }>; };
  avgRating: number;
  totalReviews: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface SearchFilters {
  from: string;
  to: string;
  date: string;
  vehicleType: 'all' | 'bus' | 'train';
  maxPrice: number;
  sortBy: 'price' | 'duration' | 'rating' | 'departure';
}

export default function RouteSearchPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // --- State Management ---
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    vehicleType: 'all',
    maxPrice: 10000,
    sortBy: 'departure'
  });

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } @media (max-width: 768px) { .animated-vehicle { display: none; } } `;

  // --- API and Data Logic ---
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}${endpoint}`;
    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
      });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; }
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) { console.error('API call error:', error); return null; }
  }, [router]);

  const handleSearch = async () => {
    if (!filters.from || !filters.to) { setError('Please enter both departure and destination locations'); return; }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ from: filters.from, to: filters.to, date: filters.date, maxPrice: filters.maxPrice.toString(), sortBy: filters.sortBy });
      if (filters.vehicleType !== 'all') params.append('vehicleType', filters.vehicleType);
      const response = await apiCall(`/api/routes/search?${params.toString()}`);
      if (response) { setRoutes(response.routes || []); } else { setError('Failed to search routes'); }
    } catch (error) { console.error('Search error:', error); setError('Failed to search routes'); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadPopularRoutes = async () => {
      setLoading(true);
      const response = await apiCall('/api/routes?limit=10&sortBy=totalReviews&sortOrder=desc');
      if (response) { setRoutes(response.routes || []); }
      setLoading(false);
    };
    loadPopularRoutes();
  }, [apiCall]);

  // --- Helper Functions ---
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <StarIcon key={i} width={16} height={16} style={{ color: i < Math.round(rating) ? '#FBBF24' : (theme === 'dark' ? '#4B5563' : '#D1D5DB'), display: 'inline' }} />
  ));

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
        }
        .form-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #F59E0B;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          margin-top: -6px;
        }
        .form-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #F59E0B;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .search-form-grid { grid-template-columns: 1fr !important; }
          .result-card-flex { flex-direction: column; }
          .result-card-right { text-align: left !important; margin-top: 1rem; }
          .result-card-footer { flex-direction: column; align-items: flex-start !important; }
          .result-card-footer-links { margin-top: 1rem; width: 100%; display: flex; justify-content: space-between; }
        }
      `}</style>
      
      {/* Replace hardcoded background with imported component */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* --- Main Content --- */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navigation */}
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1>
              </div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>My Bookings</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down" style={{ width: '100%', maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center', color: currentThemeStyles.textPrimary }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Find Your Next Journey</h1>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Search buses and trains across Sri Lanka with ease.</p>
            </div>

            {/* --- Styled Search Form (Glass Panel) --- */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
              <div className="search-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>From</label>
                  <input type="text" placeholder="e.g., Colombo" value={filters.from} onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))} className="form-input" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>To</label>
                  <input type="text" placeholder="e.g., Kandy" value={filters.to} onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))} className="form-input" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Date</label>
                  <input type="date" value={filters.date} onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))} className="form-input" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Vehicle Type</label>
                  {/* ✅ FIXED: Cast to the specific union type instead of any */}
                  <select value={filters.vehicleType} onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value as SearchFilters['vehicleType'] }))} className="form-select" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                    <option value="all">All Vehicles</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Max Price: {formatPrice(filters.maxPrice)}</label>
                  <input type="range" min="100" max="10000" step="100" value={filters.maxPrice} onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))} className="form-range" style={{ width: '100%', height: '6px', borderRadius: '3px', background: currentThemeStyles.quickActionBorder, outline: 'none', appearance: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Sort By</label>
                  {/* ✅ FIXED: Cast to the specific union type instead of any */}
                  <select value={filters.sortBy} onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SearchFilters['sortBy'] }))} className="form-select" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                    <option value="departure">Departure Time</option>
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSearch} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#9CA3AF' : '#F59E0B', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease' }}>
                {loading ? 'Searching...' : 'Search Routes'}
              </button>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem', backdropFilter: 'blur(5px)' }}>{error}</div>}

            {/* --- Styled Results (Glass Panel Cards) --- */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid rgba(251, 191, 36, 0.3)', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : routes.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {routes.map((route) => (
                    <div key={route._id} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                      <div className="result-card-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>{route.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                            <span>{route.startLocation.name}</span><span>→</span><span>{route.endLocation.name}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: currentThemeStyles.textMuted }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TruckIcon width={16} /> {route.vehicleInfo.type}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ClockIcon width={16} /> {formatDuration(route.estimatedDuration)}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPinIcon width={16} /> {route.distance}km</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UsersIcon width={16} /> {route.vehicleInfo.capacity} seats</span>
                          </div>
                        </div>
                        <div className="result-card-right" style={{ textAlign: 'right', minWidth: '120px' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>{formatPrice(route.pricing.basePrice)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontSize: '0.9rem', color: currentThemeStyles.textSecondary }}>
                            <div>{renderStars(route.avgRating)}</div>
                            <span>({route.totalReviews})</span>
                          </div>
                        </div>
                      </div>
                      <div className="result-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: currentThemeStyles.textMuted }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BuildingOffice2Icon width={16} /> {route.operatorInfo.companyName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><PhoneIcon width={16} /> {route.operatorInfo.contactNumber}</span>
                        </div>
                        <div className="result-card-footer-links" style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/routes/${route._id}`} style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>View Details</Link>
                          <Link href={`/book?routeId=${route._id}`} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Book Now</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                  <MagnifyingGlassIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: currentThemeStyles.textMuted }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Routes Found</h3>
                  <p>Try adjusting your search criteria or check our popular routes on the dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}