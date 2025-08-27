// /app/weather/page.tsx
// Main Weather Dashboard Page for Sri Express Transportation Platform

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CloudIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Import our weather components with correct paths
import WeatherAnalytics from '@/app/components/WeatherAnalytics';
import WeatherChatbot from '@/app/components/WeatherChatbot';
import WeatherWidgets from '@/app/components/WeatherWidgets';
import WeatherCharts from '@/app/components/WeatherCharts';
import { weatherService, WeatherData, CurrentWeather } from '@/app/services/weatherService';

// Import theme context and switcher
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';

interface User {
  _id: string;
  name: string;
  email: string;
  weatherPreferences?: {
    defaultLocation: string;
    temperatureUnit: 'celsius' | 'fahrenheit';
    favoriteLocations: string[];
  };
}

// Defined specific types to replace 'any' and improve type safety.
type ActiveTab = 'overview' | 'analytics' | 'chatbot' | 'settings';
type ChartType = 'temperature' | 'precipitation' | 'wind' | 'comprehensive' | 'transportation' | 'comparison';
type TimeRange = '24h' | '7d' | '30d';

interface TabInfo {
  id: ActiveTab;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const WeatherPage: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedLocation, setSelectedLocation] = useState('Colombo');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [multiLocationData, setMultiLocationData] = useState<Map<string, CurrentWeather>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Chart settings
  const [chartType, setChartType] = useState<ChartType>('comprehensive');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Available Sri Lankan locations
  const availableLocations = weatherService.getAllLocations().map(loc => loc.name);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.weatherPreferences?.defaultLocation) {
        setSelectedLocation(parsedUser.weatherPreferences.defaultLocation);
      }
    }
  }, [router]);

  // Load weather data
  const loadWeatherData = useCallback(async (location: string = selectedLocation) => {
    if (!weatherData) setLoading(true);
    setError(null);

    try {
      const data = await weatherService.getComprehensiveWeather(location);
      if (data) {
        setWeatherData(data);
      } else {
        throw new Error('Failed to load weather data');
      }

      const favoriteLocations = user?.weatherPreferences?.favoriteLocations || ['Colombo', 'Kandy', 'Galle'];
      const multiData = await weatherService.getMultiLocationWeather(favoriteLocations);
      setMultiLocationData(multiData);

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, user, weatherData]);

  // Initial data load
  useEffect(() => {
    if (selectedLocation) {
      loadWeatherData(selectedLocation);
    }
  }, [selectedLocation, loadWeatherData]);

  // Auto-refresh removed - weather data doesn't need constant updates

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation);
  };

  const handleRefresh = () => loadWeatherData();
  const handleTabChange = (tab: ActiveTab) => setActiveTab(tab);

  const getAlertsCount = (): number => weatherData?.alerts?.length || 0;

  const getTransportationStatus = (): { status: string; color: string; description: string } => {
    if (!weatherData) return { status: 'Unknown', color: '#9ca3af', description: 'Weather data is not available.' };
    const impact = weatherData.transportationImpact.overall;
    switch (impact) {
      case 'excellent': return { status: 'Excellent', color: '#4ade80', description: 'Ideal conditions for all transportation.' };
      case 'good': return { status: 'Good', color: '#60a5fa', description: 'Good conditions, minor delays possible.' };
      case 'fair': return { status: 'Fair', color: '#facc15', description: 'Conditions may cause minor disruptions.' };
      case 'poor': return { status: 'Poor', color: '#fb923c', description: 'Expect delays and difficult travel conditions.' };
      case 'dangerous': return { status: 'Dangerous', color: '#f87171', description: 'Travel is not recommended. High risk.' };
      default: return { status: 'Unknown', color: '#9ca3af', description: 'Transportation impact is unknown.' };
    }
  };

  // Theme and Animation Styles from Admin Dashboard
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    controlBg: 'rgba(249, 250, 251, 0.8)',
    controlBorder: '1px solid rgba(209, 213, 219, 0.5)',
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
    controlBg: 'rgba(51, 65, 85, 0.8)',
    controlBorder: '1px solid rgba(75, 85, 99, 0.5)',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

  const transportationStatus = getTransportationStatus();

  if (loading && !weatherData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Weather Dashboard...</p>
          <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginTop: '0.5rem' }}>Fetching latest weather data for {selectedLocation}...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary, maxWidth: '400px' }}>
          <ExclamationTriangleIcon style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Weather Data Unavailable</h2>
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/dashboard" style={{ backgroundColor: '#475569', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabInfo[] = [
    { id: 'overview', name: 'Overview', icon: CloudIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'chatbot', name: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      {/* Header */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '0.5rem 0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textSecondary, textDecoration: 'none' }}>
              <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheckIcon style={{ width: '32px', height: '32px', color: '#dc2626' }} />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>Sri Express Weather</h1>
                <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, margin: 0 }}>AI-Powered Weather Intelligence</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPinIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textSecondary }} />
                <span style={{ color: currentThemeStyles.textPrimary }}>{selectedLocation}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: weatherData ? '#4ade80' : '#f87171' }}></div>
                <span style={{ color: transportationStatus.color }}>{transportationStatus.status}</span>
                <InformationCircleIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textSecondary, cursor: 'help' }} title={transportationStatus.description} />
              </div>
              {getAlertsCount() > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15' }}>
                  <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
                  <span>{getAlertsCount()} alerts</span>
                </div>
              )}
            </div>
            <span className="hidden lg:inline" style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ width: '100%', minHeight: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Tab Navigation as a Glass Panel */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '0 1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0.5rem',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#60a5fa' : currentThemeStyles.textSecondary,
                    backgroundColor: 'transparent',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }}
                >
                  <tab.icon style={{ width: '20px', height: '20px' }} />
                  <span>{tab.name}</span>
                  {tab.id === 'chatbot' && <SparklesIcon style={{ width: '16px', height: '16px', color: '#a78bfa' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content in a Glass Panel */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <WeatherWidgets
                  weatherData={weatherData}
                  currentLocation={selectedLocation}
                  loading={loading}
                  onLocationChange={handleLocationChange}
                  availableLocations={availableLocations}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                  <WeatherCharts weatherData={weatherData} currentLocation={selectedLocation} chartType="temperature" timeRange={timeRange} multiLocationData={multiLocationData} loading={loading} />
                  <WeatherCharts weatherData={weatherData} currentLocation={selectedLocation} chartType="transportation" timeRange={timeRange} multiLocationData={multiLocationData} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', backgroundColor: currentThemeStyles.controlBg, padding: '1rem', borderRadius: '0.75rem', border: currentThemeStyles.controlBorder }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    <label style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: 500 }}>Chart Type:</label>
                    <select value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)} style={{ backgroundColor: currentThemeStyles.controlBg, border: currentThemeStyles.controlBorder, color: currentThemeStyles.textPrimary, borderRadius: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="temperature">Temperature</option>
                      <option value="precipitation">Precipitation</option>
                      <option value="wind">Wind</option>
                      <option value="transportation">Transportation</option>
                      <option value="comparison">Comparison</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: 500 }}>Time Range:</label>
                    <div style={{ display: 'flex', backgroundColor: currentThemeStyles.controlBg, borderRadius: '0.25rem' }}>
                      {(['24h', '7d', '30d'] as const).map((range) => (
                        <button key={range} onClick={() => setTimeRange(range)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', backgroundColor: timeRange === range ? '#2563eb' : 'transparent', color: timeRange === range ? 'white' : currentThemeStyles.textSecondary }}>{range}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <WeatherAnalytics weatherData={weatherData} selectedLocation={selectedLocation} loading={loading} multiLocationData={multiLocationData} />
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>AI Weather Assistant</h2>
                  <p style={{ color: currentThemeStyles.textSecondary }}>Ask questions about weather conditions, forecasts, and travel impact for Sri Lankan routes</p>
                </div>
                <WeatherChatbot weatherData={weatherData} currentLocation={selectedLocation} availableLocations={availableLocations} multiLocationData={multiLocationData} className="h-[600px]" />
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ backgroundColor: currentThemeStyles.controlBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.controlBorder }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>Weather Preferences</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Default Location</label>
                      <select value={selectedLocation} onChange={(e) => handleLocationChange(e.target.value)} style={{ width: '100%', backgroundColor: currentThemeStyles.controlBg, border: currentThemeStyles.controlBorder, color: currentThemeStyles.textPrimary, borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
                        {availableLocations.map((location) => (<option key={location} value={location}>{location}</option>))}
                      </select>
                    </div>
                    {/* Other settings fields would go here, styled similarly */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;