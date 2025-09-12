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
import LocationFilter from './components/LocationFilter';
import RouteDetails from './components/RouteDetails';
import { filterRoutes } from '../utils/locationUtils';

// --- DYNAMICALLY IMPORTED COMPONENT ---
const GoogleMapsTracker = dynamic(() => import('../components/GoogleMapsTracker'), { ssr: false });

// --- TYPE DEFINITIONS ---
interface Route { 
  _id: string; 
  name: string; 
  routeId: string;
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
  waypoints?: Array<{ 
    name: string; 
    coordinates: [number, number]; 
    order: number; 
  }>;
  distance?: number;
  estimatedDuration?: number;
  approvalStatus: string;
  status: string;
}
type ViewMode = 'map';

// --- MAIN COMPONENT ---
export default function AdvancedTrackingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [showRouteDetails, setShowRouteDetails] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastApiCallTime, setLastApiCallTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
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

  // Update current time every second for live timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper function to get time difference
  const getTimeDifference = (date: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

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

  const loadRoutes = useCallback(async () => {
    const response = await apiCall('/routes?status=active');
    if (response?.routes || Array.isArray(response)) setRoutes(response.routes || response);
  }, [apiCall]);

  useEffect(() => {
    const loadData = async () => { setLoading(true); await loadRoutes(); setLoading(false); };
    loadData();
  }, [loadRoutes]);

  // Get filtered routes based on province/district selection
  const filteredRoutes = useMemo(() => 
    filterRoutes(routes, 
      selectedProvince === 'all' ? undefined : selectedProvince,
      selectedDistrict === 'all' ? undefined : selectedDistrict
    ), [routes, selectedProvince, selectedDistrict]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(59, 130, 246, 0.3)', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '18px', fontWeight: '500' }}>Loading Route Data...</div>
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Route Management System</h1>
          <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>View and manage transportation routes across Sri Lanka</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {[ 
            { label: 'Total Routes', value: routes.length, icon: TruckIcon, color: '#3B82F6' }, 
            { label: 'Active Routes', value: routes.filter(r => r.status === 'active').length, icon: MapPinIcon, color: '#10B981' }, 
            { label: 'Approved Routes', value: routes.filter(r => r.approvalStatus === 'approved').length, icon: ClockIcon, color: '#059669' }, 
            { label: 'Filtered Routes', value: filteredRoutes.length, icon: UsersIcon, color: '#8B5CF6' } 
          ].map((stat, index) => (
            <div key={stat.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'brightness(1.1)' }}><stat.icon width={24} height={24} color="white" /></div>
                <div><h3 style={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h3><p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{stat.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
          {/* Location Filter Component */}
          <LocationFilter
            routes={routes}
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            selectedRoute={selectedRoute}
            onProvinceChange={setSelectedProvince}
            onDistrictChange={setSelectedDistrict}
            onRouteChange={setSelectedRoute}
            currentThemeStyles={currentThemeStyles}
          />

          {/* Controls Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Route Details Toggle */}
              <button 
                onClick={() => setShowRouteDetails(!showRouteDetails)}
                style={{ 
                  backgroundColor: showRouteDetails ? '#3B82F6' : currentThemeStyles.buttonBg, 
                  color: showRouteDetails ? 'white' : currentThemeStyles.buttonText,
                  padding: '0.75rem 1rem', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <MapPinIcon width={16} height={16} />
                {showRouteDetails ? 'Hide Route Details' : 'Show Route Details'}
              </button>

            </div>
            
            {/* View Mode Display */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: '#10B981', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🗺️ Google Maps Pro
              </div>
              <div style={{ 
                backgroundColor: '#F59E0B', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🚦 Live Traffic
              </div>
            </div>
          </div>

          {/* Route Summary Info */}
          <div style={{ marginTop: '1rem', color: currentThemeStyles.textMuted, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Routes loaded: {new Date().toLocaleTimeString()}</span>
              {lastApiCallTime && (
                <span style={{ 
                  color: '#10B981', 
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Live tracking updated: {lastApiCallTime.toLocaleTimeString()} ({getTimeDifference(lastApiCallTime)})
                </span>
              )}
            </div>
            <span>{filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} matching current filters</span>
          </div>
        </div>

        {error && <div style={{ backgroundColor: theme === 'dark' ? '#7F1D1D' : '#FEF2F2', color: theme === 'dark' ? '#FCA5A5' : '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${theme === 'dark' ? '#B91C1C' : '#FCA5A5'}`, marginBottom: '2rem' }}>{error}</div>}

        {/* Route Details Section */}
        {showRouteDetails && filteredRoutes.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: currentThemeStyles.textPrimary, 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MapPinIcon width={20} height={20} color={currentThemeStyles.textPrimary} />
              Route Details ({filteredRoutes.length})
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
              gap: '1.5rem',
              maxHeight: '60vh',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {filteredRoutes.map((route) => (
                <RouteDetails
                  key={route._id}
                  route={route}
                  currentThemeStyles={currentThemeStyles}
                  isSelected={selectedRoute === route._id}
                  onClick={() => setSelectedRoute(selectedRoute === route._id ? 'all' : route._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Map Section - Google Maps Professional Tracking */}
        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden', marginBottom: '2rem' }}>
          <GoogleMapsTracker 
            routes={routes}
            selectedRoute={selectedRoute}
            height="70vh"
            theme={theme}
            onLastApiCallUpdate={setLastApiCallTime}
          />
        </div>
      </main>
    </div>
  );
}