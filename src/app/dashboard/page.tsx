// src/app/dashboard/page.tsx - FULLY MERGED & STYLED PRODUCTION VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';
import { 
  ExclamationTriangleIcon, ShieldCheckIcon, CheckCircleIcon,
  TicketIcon, CurrencyDollarIcon, CalendarDaysIcon, ClockIcon, 
  MagnifyingGlassIcon, MapPinIcon, CreditCardIcon, XCircleIcon, 
  ArrowRightIcon, BellIcon, CloudIcon, ArrowPathIcon, StarIcon
} from '@heroicons/react/24/outline';
import RealTimeEmergencyClient from '../components/RealTimeEmergencyClient';
import UserEmergencyAlerts from '../components/UserEmergencyAlerts';
import CustomerChatWidget from '../components/CustomerChatWidget';

// --- Custom Vector Icons for Tabs ---
const OverviewIcon = ({ color = 'currentColor' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
const TripsIcon = ({ color = 'currentColor' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 12H8m8 0l-2-3m2 3l-2 3M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
  </svg>
);
const ProfileIcon = ({ color = 'currentColor' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// --- Data Interfaces ---
interface Trip { _id: string; route: string; fromLocation: string; toLocation: string; date: string; time?: string; seat?: string; price: number; status: 'upcoming' | 'completed' | 'cancelled'; }
interface Booking { _id?: string; id?: string; bookingId?: string; routeId?: string; travelDate?: string; date?: string; departureTime?: string; passengerInfo?: { name: string; }; passenger?: { name: string; }; pricing?: { totalAmount: number; }; amount?: { total: number; }; price?: number; status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show' | string; qrCode?: string; }
interface Payment { _id?: string; id?: string; paymentId?: string; amount?: { total: number; currency: string; }; total?: number; currency?: string; status?: string; createdAt?: string; date?: string; }
interface DashboardStats { totalTrips: number; totalSpent: number; upcomingTrips: number; onTimeRate: number; totalBookings?: number; confirmedBookings?: number; totalPayments?: number; averagePayment?: number; recentActivity?: number; favoriteRoutes?: string[]; }
interface User { _id: string; name: string; email: string; phone?: string; role: string; }
interface WeatherData { current: { temp: number; condition: string; icon: string; }; forecast: { day: string; temp: number; }[]; }

// --- Mock Weather Service (as per your architecture) ---
const weatherService = {
  getComprehensiveWeather: async (location: string): Promise<WeatherData> => {
    await new Promise(resolve => setTimeout(resolve, 750)); // Simulate API latency
    const locationsData: { [key: string]: WeatherData } = {
      'Colombo': { current: { temp: 29, condition: 'Partly Cloudy', icon: '⛅️' }, forecast: [{ day: 'Mon', temp: 30 }, { day: 'Tue', temp: 31 }, { day: 'Wed', temp: 29 }] },
      'Kandy': { current: { temp: 24, condition: 'Light Showers', icon: '🌦️' }, forecast: [{ day: 'Mon', temp: 25 }, { day: 'Tue', temp: 24 }, { day: 'Wed', temp: 23 }] },
      'Galle': { current: { temp: 28, condition: 'Sunny', icon: '☀️' }, forecast: [{ day: 'Mon', temp: 29 }, { day: 'Tue', temp: 29 }, { day: 'Wed', temp: 30 }] },
      'Jaffna': { current: { temp: 31, condition: 'Clear Skies', icon: '☀️' }, forecast: [{ day: 'Mon', temp: 32 }, { day: 'Tue', temp: 31 }, { day: 'Wed', temp: 32 }] },
    };
    return locationsData[location] || locationsData['Colombo'];
  },
  getAllLocations: () => [
    { name: 'Colombo' },
    { name: 'Kandy' },
    { name: 'Galle' },
    { name: 'Jaffna' },
  ]
};

function DashboardContent() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  // --- Weather State ---
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('Colombo');

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } @media (max-width: 768px) { .animated-vehicle { display: none; } } `;

  // --- API and Data Logic ---
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return null;
    }

    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    
    const fullURL = `${baseURL}/api${endpoint}`;

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, clearing token and redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return null;
        }
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call error for ${endpoint}:`, error);
      setApiErrors(prev => [...prev, `Failed to load data for ${endpoint.split('/').pop()}`]);
      return null;
    }
  }, [router]);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setApiErrors([]);
  
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      else {
        const userProfileResponse = await apiCall('/auth/profile');
        if (userProfileResponse && userProfileResponse.user) { 
          setUser(userProfileResponse.user); 
          localStorage.setItem('user', JSON.stringify(userProfileResponse.user)); 
        }
      }
  
      const [statsData, recentTripsData, upcomingTripsData, bookingsResponse, paymentsResponse] = await Promise.all([
        apiCall('/dashboard/stats'),
        apiCall('/dashboard/recent-trips'),
        apiCall('/dashboard/upcoming-trips'),
        apiCall('/bookings?limit=5'),
        apiCall('/payments/history?limit=5')
      ]);

      if (statsData) setStats(statsData);
      if (recentTripsData && Array.isArray(recentTripsData)) setRecentTrips(recentTripsData);
      if (upcomingTripsData && Array.isArray(upcomingTripsData)) setUpcomingTrips(upcomingTripsData);

      const extractArray = <T,>(response: unknown, key: string): T[] => {
        if (!response) return [];
        if (Array.isArray(response)) return response as T[];
        if (typeof response === 'object' && response !== null) {
          const res = response as Record<string, unknown>;
          if (res[key] && Array.isArray(res[key])) {
            return res[key] as T[];
          }
          if (res.data && Array.isArray(res.data)) {
            return res.data as T[];
          }
        }
        return [];
      };

      setRecentBookings(extractArray<Booking>(bookingsResponse, 'bookings'));
      setRecentPayments(extractArray<Payment>(paymentsResponse, 'payments'));
  
      setLastRefresh(new Date());
    } catch (error) {
      console.error('💥 Error loading dashboard data:', error);
      setApiErrors(prev => [...prev, 'A critical error occurred while loading dashboard data.']);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiCall]);
  
  // --- Weather API Functions ---
  const loadWeatherData = useCallback(async (location = userLocation) => {
    setWeatherLoading(true);
    try {
      const data = await weatherService.getComprehensiveWeather(location);
      setWeatherData(data);
    } catch (error) {
      console.error('Weather data error:', error);
      setApiErrors(prev => [...prev, 'Failed to load weather data.']);
    } finally {
      setWeatherLoading(false);
    }
  }, [userLocation]);

  const handleLocationChange = (newLocation: string) => {
    setUserLocation(newLocation);
    loadWeatherData(newLocation);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    loadDashboardData();
    loadWeatherData(); // Load weather data on initial mount
  }, [loadDashboardData, loadWeatherData, router]);

  // Auto-refresh removed - dashboard data doesn't need constant updates

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    const result = await apiCall('/dashboard/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: user.name, email: user.email, phone: user.phone })
    });
    if (result) {
      setProfileSuccess('Profile updated successfully!');
      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError('Failed to update profile');
    }
    setProfileLoading(false);
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  // --- UI Rendering ---
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fffbeb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #fef3c7', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#92400e', fontSize: '16px', fontWeight: '600' }}>Loading Your Dashboard...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- Weather Widget Props Interface ---
  interface WeatherWidgetsProps {
    weatherData: WeatherData | null;
    currentLocation: string;
    loading: boolean;
    onRefresh: (location: string) => void;
    onLocationChange: (location: string) => void;
    availableLocations: string[];
    compact: boolean;
  }

  // --- Weather Widget Component ---
  const WeatherWidgets = ({ weatherData, currentLocation, loading, onRefresh, onLocationChange, availableLocations, compact }: WeatherWidgetsProps) => {
    const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onRefresh(currentLocation);
    };
  
    return (
      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        padding: compact ? '1rem 1.5rem' : '1.5rem',
        borderRadius: '1rem',
        boxShadow: currentThemeStyles.glassPanelShadow,
        backdropFilter: 'blur(12px)',
        border: currentThemeStyles.glassPanelBorder,
        marginBottom: '2rem',
        color: currentThemeStyles.textPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'center' }}>
            <ArrowPathIcon className="animate-spin" width={20} height={20} color={currentThemeStyles.textSecondary} />
            <span style={{ color: currentThemeStyles.textSecondary, fontWeight: 500 }}>Loading Weather...</span>
          </div>
        ) : weatherData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{weatherData.current.icon}</span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weatherData.current.temp}°C</div>
                <div style={{ color: currentThemeStyles.textSecondary, fontWeight: 500 }}>{weatherData.current.condition}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {weatherData.forecast.map(day => (
                <div key={day.day} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{day.day}</div>
                  <div style={{ color: currentThemeStyles.textSecondary, fontSize: '1.1rem' }}>{day.temp}°</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
              <select
                value={currentLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                style={{
                  backgroundColor: currentThemeStyles.alertBg,
                  color: currentThemeStyles.textPrimary,
                  border: currentThemeStyles.quickActionBorder,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div style={{ color: currentThemeStyles.textSecondary }}>Weather data unavailable.</div>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <UserEmergencyAlerts showInDashboard={true} maxAlerts={2} />
      
      {/* --- Weather Widget --- */}
      <WeatherWidgets
        weatherData={weatherData}
        currentLocation={userLocation}
        loading={weatherLoading}
        onRefresh={loadWeatherData}
        onLocationChange={handleLocationChange}
        availableLocations={weatherService.getAllLocations().map(loc => loc.name)}
        compact={true}
      />

      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: currentThemeStyles.glassPanelShadow,
        backdropFilter: 'blur(12px)',
        border: currentThemeStyles.glassPanelBorder,
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <BellIcon width={24} height={24} color="#f59e0b" />
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: 0
            }}>
              Emergency Notifications
            </h3>
          </div>
          <Link 
            href="/notifications" 
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            className="notification-link"
          >
            <BellIcon width={16} height={16} />
            View All Notifications
          </Link>
        </div>
        <p style={{
          color: currentThemeStyles.textSecondary,
          fontSize: '0.9rem',
          margin: 0
        }}>
          Stay updated with real-time emergency alerts, system notifications, and important announcements.
          Click &ldquo;View All Notifications&rdquo; to see your complete notification history.
        </p>
      </div>

      {apiErrors.length > 0 && (
        <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca', backdropFilter: 'blur(5px)' }}>
          <h4 style={{ color: '#b91c1c', margin: '0 0 0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ExclamationTriangleIcon width={20} />Connection Issues:</h4>
          {apiErrors.map((error, index) => ( <div key={index} style={{ color: '#b91c1c', fontSize: '0.8rem' }}>• {error}</div> ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
       <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textPrimary, textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(255,255,255,0.5)' }}>Last updated: {formatDateTime(lastRefresh.toString())}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: stats?.totalBookings || stats?.totalTrips || 0, icon: TicketIcon, color: '#F59E0B' },
          { label: 'Total Spent', value: formatPrice(stats?.totalSpent || 0), icon: CurrencyDollarIcon, color: '#10B981' },
          { label: 'Upcoming Trips', value: stats?.upcomingTrips || 0, icon: CalendarDaysIcon, color: '#3B82F6' },
          { label: 'On-Time Rate', value: `${stats?.onTimeRate || 0}%`, icon: ClockIcon, color: '#8B5CF6' }
        ].map((metric, index) => (
          <div key={metric.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <metric.icon width={32} height={32} color={metric.color} />
              <div>
                <h3 style={{ color: metric.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                <p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{metric.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
        <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Search Routes', href: '/search', icon: MagnifyingGlassIcon },
            { name: 'My Bookings', href: '/bookings', icon: TicketIcon },
            { name: 'Rate Journeys', href: '/ratings', icon: StarIcon },
            { name: 'Track Vehicle', href: '/track', icon: MapPinIcon },
            { name: 'Payment History', href: '/payments', icon: CreditCardIcon },
            { name: 'Weather & Travel', href: '/weather', icon: CloudIcon },
            { name: 'Notifications', href: '/notifications', icon: BellIcon }
          ].map((action, index) => (
            <Link key={action.name} href={action.href} style={{ textDecoration: 'none' }}>
              <div className="quick-action-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder, transition: 'all 0.3s ease', cursor: 'pointer', animation: `fade-in-up 0.6s ease-out ${index * 0.1 + 0.4}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <action.icon width={24} height={24} color="#F59E0B" />
                  <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{action.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
        <div className="main-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Recent Bookings</h3>
            <div style={{ flex: '1 1 0%' }}>
              {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
                recentBookings.slice(0, 3).map((booking) => {
                  const bookingId = booking?.bookingId || booking?._id || booking?.id;
                  const amount = booking?.pricing?.totalAmount || booking?.amount?.total || booking?.price || 0;
                  const status = booking?.status || 'unknown';
                  const travelDate = booking?.travelDate || booking?.date || new Date().toISOString();
                  return (
                    <div key={bookingId as string} style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: `4px solid #3b82f6` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary, fontSize: '0.9rem' }}>Booking #{typeof bookingId === 'string' ? bookingId.slice(-8) : bookingId}</div>
                          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.8rem' }}>{formatDate(travelDate)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#F59E0B', fontWeight: '600', fontSize: '0.9rem' }}>{formatPrice(amount)}</div>
                          <div style={{ fontSize: '0.7rem', color: status === 'confirmed' ? '#10B981' : currentThemeStyles.textMuted, textTransform: 'capitalize' }}>{status}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : ( <div style={{ textAlign: 'center', padding: '1rem', color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>No recent bookings found.</div> )}
            </div>
            {Array.isArray(recentBookings) && recentBookings.length > 0 && (
              <Link href="/bookings" style={{ color: '#F59E0B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all bookings <ArrowRightIcon width={16} />
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Recent Payments</h3>
            <div style={{ flex: '1 1 0%' }}>
              {Array.isArray(recentPayments) && recentPayments.length > 0 ? (
                recentPayments.slice(0, 3).map((payment) => {
                  const paymentId = payment?.paymentId || payment?._id || payment?.id;
                  const amount = payment?.amount?.total || payment?.total || 0;
                  const status = payment?.status || 'unknown';
                  const createdAt = payment?.createdAt || payment?.date || new Date().toISOString();
                  return (
                    <div key={paymentId as string} style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: `4px solid #10b981` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary, fontSize: '0.9rem' }}>Payment #{typeof paymentId === 'string' ? paymentId.slice(-8) : paymentId}</div>
                          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.8rem' }}>{formatDate(createdAt)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#10B981', fontWeight: '600', fontSize: '0.9rem' }}>{formatPrice(amount)}</div>
                          <div style={{ fontSize: '0.7rem', color: status === 'completed' ? '#10B981' : currentThemeStyles.textMuted, textTransform: 'capitalize' }}>{status}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : ( <div style={{ textAlign: 'center', padding: '1rem', color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>No recent payments found.</div> )}
            </div>
            {Array.isArray(recentPayments) && recentPayments.length > 0 && (
              <Link href="/payments" style={{ color: '#F59E0B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all payments <ArrowRightIcon width={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="animate-fade-in-up" style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animationDelay: '0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary }}>My Trips</h3>
        <Link href="/search" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>
          Book New Trip
        </Link>
      </div>
      {upcomingTrips.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Upcoming</h4>
          {upcomingTrips.map(trip => (
            <div key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: currentThemeStyles.alertBg }}>
              <div>
                <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{trip.route}</div>
                <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>{trip.fromLocation} → {trip.toLocation}</div>
                <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.8rem' }}>{formatDate(trip.date)} {trip.time && `at ${trip.time}`} {trip.seat && `• Seat: ${trip.seat}`}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#F59E0B', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
                <div style={{ fontSize: '0.8rem', color: '#3B82F6', textTransform: 'capitalize' }}>{trip.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {recentTrips.length > 0 ? (
        <div>
          <h4 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>History</h4>
          {recentTrips.map(trip => (
            <div key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: currentThemeStyles.alertBg, opacity: 0.8 }}>
              <div>
                <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{trip.route}</div>
                <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>{trip.fromLocation} → {trip.toLocation}</div>
                <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.8rem' }}>{formatDate(trip.date)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: trip.status === 'completed' ? '#10B981' : '#EF4444', fontWeight: '600', fontSize: '0.9rem', textTransform: 'capitalize', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                  {trip.status === 'completed' ? <CheckCircleIcon width={16} /> : <XCircleIcon width={16} />} {trip.status}
                </div>
                <div style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>{formatPrice(trip.price)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        upcomingTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>No trips yet!</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Your booked journeys will appear here.</p>
          </div>
        )
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fade-in-up" style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animationDelay: '0.2s' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary }}>Profile Information</h3>
      {profileError && <div style={{ padding: '1rem', backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem' }}>{profileError}</div>}
      {profileSuccess && <div style={{ padding: '1rem', backgroundColor: 'rgba(209, 250, 229, 0.8)', color: '#065f46', borderRadius: '0.5rem', marginBottom: '1rem' }}>{profileSuccess}</div>}
      <form onSubmit={handleProfileUpdate}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Full Name</label>
          <input type="text" value={user?.name || ''} onChange={(e) => setUser(user ? {...user, name: e.target.value} : null)} style={{ width: '100%', padding: '0.75rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Email Address</label>
          <input type="email" value={user?.email || ''} onChange={(e) => setUser(user ? {...user, email: e.target.value} : null)} style={{ width: '100%', padding: '0.75rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Phone Number</label>
          <input type="tel" value={user?.phone || ''} onChange={(e) => setUser(user ? {...user, phone: e.target.value} : null)} style={{ width: '100%', padding: '0.75rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary }} />
        </div>
        <button type="submit" disabled={profileLoading} style={{ backgroundColor: profileLoading ? '#9CA3AF' : '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: profileLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.3s ease' }}>
          {profileLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .quick-action-panel:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .notification-link:hover { background-color: #d97706 !important; transform: translateY(-2px); }
        @media (max-width: 768px) {
          .main-content-grid { grid-template-columns: 1fr !important; }
          .nav-user-welcome { display: none; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {/* Replace hardcoded background with imported component */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Your Personal Travel Hub</p>
              </div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <ThemeSwitcher />
              <span className="nav-user-welcome" style={{ color: '#94a3b8' }}>Welcome, {user?.name?.split(' ')[0] || 'User'}</span>
              <button onClick={handleLogout} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down" style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: currentThemeStyles.glassPanelBg, padding: '0.5rem', borderRadius: '0.75rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
              {[
                { id: 'overview', name: 'Overview', icon: OverviewIcon },
                { id: 'trips', name: 'My Trips', icon: TripsIcon },
                { id: 'profile', name: 'Profile', icon: ProfileIcon }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '0.75rem 1rem', border: 'none', backgroundColor: activeTab === tab.id ? '#F59E0B' : 'transparent', cursor: 'pointer', fontWeight: '600', color: activeTab === tab.id ? 'white' : currentThemeStyles.textPrimary, borderRadius: '0.5rem', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <tab.icon color={activeTab === tab.id ? 'white' : currentThemeStyles.textPrimary} />
                  {tab.name}
                </button>
              ))}
            </div>
            <div style={{ minHeight: '400px' }}>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'trips' && renderTrips()}
              {activeTab === 'profile' && renderProfile()}
            </div>
          </div>
        </main>
      </div>
      <CustomerChatWidget 
        userId={user?._id} 
        userName={user?.name} 
        userEmail={user?.email} 
      />
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <RealTimeEmergencyClient
      enableSound={true}
      enablePushNotifications={true}
    >
      <DashboardContent />
    </RealTimeEmergencyClient>
  );
}