// /app/components/WeatherWidgets.tsx
// Compact Weather Display Widgets for Sri Express Dashboard with Glass Design

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CloudIcon,
  SunIcon,
  EyeIcon,
  FlagIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  TruckIcon,
  BoltIcon,
  InformationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { WeatherData, CurrentWeather, TransportationImpact } from '@/app/services/weatherService';
import { useTheme } from '@/app/context/ThemeContext';

interface WeatherWidgetsProps {
  weatherData: WeatherData | null;
  currentLocation: string;
  loading?: boolean;
  onRefresh?: () => void;
  onLocationChange?: (location: string) => void;
  availableLocations?: string[];
  compact?: boolean;
}

interface WeatherIconProps {
  condition: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

// Enhanced Weather Icon Component
const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, size = 'md', color }) => {
  const sizeClasses = {
    sm: { width: '16px', height: '16px' },
    md: { width: '24px', height: '24px' },
    lg: { width: '32px', height: '32px' },
  };

  const iconStyle = sizeClasses[size];
  const iconColor = color || '#9ca3af';

  switch (condition.toLowerCase()) {
    case 'clear':
      return <SunIcon style={{ ...iconStyle, color: '#fbbf24' }} />;
    case 'clouds':
      return <CloudIcon style={{ ...iconStyle, color: '#9ca3af' }} />;
    case 'rain':
    case 'drizzle':
      return <CloudIcon style={{ ...iconStyle, color: '#60a5fa' }} />;
    case 'thunderstorm':
      return <BoltIcon style={{ ...iconStyle, color: '#a78bfa' }} />;
    case 'snow':
      return <CloudIcon style={{ ...iconStyle, color: '#f3f4f6' }} />;
    case 'mist':
    case 'fog':
      return <CloudIcon style={{ ...iconStyle, color: '#9ca3af' }} />;
    default:
      return <CloudIcon style={{ ...iconStyle, color: iconColor }} />;
  }
};

// Transportation Impact Badge
const TransportationImpactBadge: React.FC<{ impact: TransportationImpact['overall']; theme: any }> = ({ impact, theme }) => {
  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'excellent':
        return { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case 'good':
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'fair':
        return { backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#facc15', border: '1px solid rgba(251, 191, 36, 0.3)' };
      case 'poor':
        return { backgroundColor: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', border: '1px solid rgba(251, 146, 60, 0.3)' };
      case 'dangerous':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'excellent':
      case 'good':
        return <CheckCircleIcon style={{ width: '12px', height: '12px' }} />;
      case 'fair':
        return <InformationCircleIcon style={{ width: '12px', height: '12px' }} />;
      case 'poor':
      case 'dangerous':
        return <ExclamationTriangleIcon style={{ width: '12px', height: '12px' }} />;
      default:
        return <CloudIcon style={{ width: '12px', height: '12px' }} />;
    }
  };

  const styles = getImpactStyles(impact);

  return (
    <div style={{ 
      ...styles,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    }}>
      {getImpactIcon(impact)}
      <span style={{ textTransform: 'capitalize' }}>{impact}</span>
    </div>
  );
};

// Temperature Trend Component
const TemperatureTrend: React.FC<{ current: number; forecast?: number }> = ({ current, forecast }) => {
  if (!forecast) return null;

  const diff = forecast - current;
  const isRising = diff > 0;
  const isSignificant = Math.abs(diff) > 2;

  if (!isSignificant) return null;

  return (
    <div style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      color: isRising ? '#f87171' : '#60a5fa'
    }}>
      {isRising ? (
        <ArrowTrendingUpIcon style={{ width: '12px', height: '12px' }} />
      ) : (
        <ArrowTrendingDownIcon style={{ width: '12px', height: '12px' }} />
      )}
      <span>{Math.abs(diff).toFixed(1)}°</span>
    </div>
  );
};

const WeatherWidgets: React.FC<WeatherWidgetsProps> = ({
  weatherData,
  currentLocation,
  loading = false,
  onRefresh,
  onLocationChange,
  availableLocations = [],
  compact = false,
}) => {
  const { theme } = useTheme();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Theme styles
  const lightTheme = {
    mainBg: '#fffbeb',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    controlBg: 'rgba(249, 250, 251, 0.8)',
    controlBorder: '1px solid rgba(209, 213, 219, 0.5)',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af',
    controlBg: 'rgba(51, 65, 85, 0.8)',
    controlBorder: '1px solid rgba(75, 85, 99, 0.5)',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!autoRefreshEnabled || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastUpdated(new Date());
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, onRefresh]);

  // Format time helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get next few hours of weather
  const getNextHours = (hours: number = 6) => {
    if (!weatherData?.hourly) return [];
    return weatherData.hourly.slice(0, hours);
  };

  // Get transportation recommendation
  const getTransportationRecommendation = (): string => {
    if (!weatherData) return 'Weather data unavailable';
    
    const { transportationImpact } = weatherData;
    
    if (transportationImpact.alerts.length > 0) {
      return transportationImpact.alerts[0];
    }
    
    if (transportationImpact.recommendations.length > 0) {
      return transportationImpact.recommendations[0];
    }
    
    return 'Normal travel conditions';
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <div style={{ 
              height: '1rem', 
              backgroundColor: currentThemeStyles.controlBg, 
              borderRadius: '0.25rem', 
              width: '75%', 
              marginBottom: '0.5rem',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{ 
              height: '2rem', 
              backgroundColor: currentThemeStyles.controlBg, 
              borderRadius: '0.25rem', 
              width: '50%', 
              marginBottom: '0.5rem',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{ 
              height: '0.75rem', 
              backgroundColor: currentThemeStyles.controlBg, 
              borderRadius: '0.25rem', 
              width: '100%',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        ))}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow,
        textAlign: 'center'
      }}>
        <CloudIcon style={{ width: '48px', height: '48px', color: currentThemeStyles.textMuted, margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>
          Weather Data Unavailable
        </h3>
        <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
          Unable to load weather information for {currentLocation}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: currentThemeStyles.buttonBg,
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg}
          >
            <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  const { current, daily, hourly, transportationImpact } = weatherData;

  if (compact) {
    // Compact widget for dashboard integration
    return (
      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        padding: '1rem',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPinIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textMuted }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary }}>
              {currentLocation}
            </span>
          </div>
          <Link 
            href="/weather"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <WeatherIcon condition={current.condition} size="lg" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary }}>
                {current.temperature}°C
              </div>
              <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, textTransform: 'capitalize' }}>
                {current.description}
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <TransportationImpactBadge impact={transportationImpact.overall} theme={currentThemeStyles} />
            <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginTop: '0.25rem' }}>
              Travel conditions
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${currentThemeStyles.textMuted}40`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>Humidity</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary }}>
                {current.humidity}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>Wind</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary }}>
                {current.windSpeed} km/h
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>Visibility</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary }}>
                {current.visibility} km
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <WeatherIcon condition={current.condition} size="lg" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Weather Overview
            </h2>
            <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
              {currentLocation} • Updated {formatTime(lastUpdated)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Location selector */}
          {availableLocations.length > 0 && onLocationChange && (
            <select
              value={currentLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              style={{
                backgroundColor: currentThemeStyles.controlBg,
                border: currentThemeStyles.controlBorder,
                color: currentThemeStyles.textPrimary,
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            >
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                padding: '0.5rem',
                backgroundColor: currentThemeStyles.controlBg,
                color: currentThemeStyles.textPrimary,
                borderRadius: '0.5rem',
                border: currentThemeStyles.controlBorder,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              title="Refresh weather data"
            >
              <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Main weather widgets grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Current Weather Widget */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Current Conditions
            </h3>
            <WeatherIcon condition={current.condition} size="md" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary }}>
                {current.temperature}°C
              </span>
              <TemperatureTrend 
                current={current.temperature} 
                forecast={daily[0]?.tempMax} 
              />
            </div>
            
            <p style={{ color: currentThemeStyles.textSecondary, textTransform: 'capitalize', margin: 0 }}>
              {current.description}
            </p>
            <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted, margin: 0 }}>
              Feels like {current.feelsLike}°C
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: `1px solid ${currentThemeStyles.textMuted}40`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <EyeIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textMuted }} />
                <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>
                  {current.visibility} km
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlagIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textMuted }} />
                <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>
                  {current.windSpeed} km/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Impact Widget */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Transportation Impact
            </h3>
            <TruckIcon style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <TransportationImpactBadge impact={transportationImpact.overall} theme={currentThemeStyles} />
              <p style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginTop: '0.5rem', margin: 0 }}>
                Overall conditions
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: currentThemeStyles.controlBg,
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginBottom: '0.25rem' }}>
                  Visibility
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  textTransform: 'capitalize',
                  color: transportationImpact.visibility === 'excellent' ? '#4ade80' :
                         transportationImpact.visibility === 'good' ? '#60a5fa' :
                         transportationImpact.visibility === 'reduced' ? '#facc15' : '#f87171'
                }}>
                  {transportationImpact.visibility}
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: currentThemeStyles.controlBg,
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginBottom: '0.25rem' }}>
                  Road Conditions
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  textTransform: 'capitalize',
                  color: transportationImpact.roadConditions === 'excellent' ? '#4ade80' :
                         transportationImpact.roadConditions === 'good' ? '#60a5fa' :
                         transportationImpact.roadConditions === 'wet' ? '#facc15' : '#f87171'
                }}>
                  {transportationImpact.roadConditions}
                </div>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: currentThemeStyles.controlBg,
              borderRadius: '0.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginBottom: '0.25rem' }}>
                Recommendation
              </div>
              <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, margin: 0 }}>
                {getTransportationRecommendation()}
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Widget */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Next 6 Hours
            </h3>
            <ClockIcon style={{ width: '24px', height: '24px', color: '#4ade80' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {getNextHours(6).map((hour, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: currentThemeStyles.textMuted, 
                    minWidth: '3rem' 
                  }}>
                    {hour.time}
                  </span>
                  <WeatherIcon condition={hour.condition} size="sm" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textPrimary }}>
                    {hour.temperature}°C
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                    {hour.precipitationChance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Widget */}
      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
            7-Day Forecast
          </h3>
          <CalendarDaysIcon style={{ width: '24px', height: '24px', color: '#a78bfa' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          {daily.slice(0, 7).map((day, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: currentThemeStyles.controlBg,
              borderRadius: '0.5rem',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>
                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day.slice(0, 3)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <WeatherIcon condition={day.condition} size="md" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: currentThemeStyles.textPrimary }}>
                  {day.tempMax}° / {day.tempMin}°
                </div>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                  {day.precipitationChance}% rain
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                  {day.windSpeed} km/h
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Alerts Widget */}
      {(transportationImpact.alerts.length > 0 || transportationImpact.recommendations.length > 0) && (
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Travel Advisories
            </h3>
            <ExclamationTriangleIcon style={{ width: '24px', height: '24px', color: '#facc15' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {/* Alerts */}
            {transportationImpact.alerts.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#facc15', marginBottom: '0.5rem' }}>
                  Active Alerts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {transportationImpact.alerts.map((alert, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      borderRadius: '0.5rem'
                    }}>
                      <ExclamationTriangleIcon style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: '#facc15', 
                        marginTop: '0.125rem',
                        flexShrink: 0 
                      }} />
                      <span style={{ fontSize: '0.875rem', color: '#fde68a' }}>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#60a5fa', marginBottom: '0.5rem' }}>
                Recommendations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {transportationImpact.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.5rem'
                  }}>
                    <CheckCircleIcon style={{ 
                      width: '16px', 
                      height: '16px', 
                      color: '#60a5fa', 
                      marginTop: '0.125rem',
                      flexShrink: 0 
                    }} />
                    <span style={{ fontSize: '0.875rem', color: '#bfdbfe' }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          href="/weather"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: currentThemeStyles.buttonBg,
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg}
        >
          <ChartBarIcon style={{ width: '16px', height: '16px' }} />
          <span>View Analytics</span>
        </Link>
        
        <Link
          href="/weather?tab=chatbot"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
        >
          <BoltIcon style={{ width: '16px', height: '16px' }} />
          <span>AI Assistant</span>
        </Link>

        <button
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: autoRefreshEnabled ? '#10b981' : '#6b7280',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = autoRefreshEnabled ? '#059669' : '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = autoRefreshEnabled ? '#10b981' : '#6b7280'}
        >
          <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
          <span>Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};

export default WeatherWidgets;