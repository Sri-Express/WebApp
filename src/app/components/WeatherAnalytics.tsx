// /app/components/WeatherAnalytics.tsx
// Advanced Weather Analytics with Charts for Sri Express Transportation - Glass Design

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
  TooltipProps,
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CloudIcon,
  SunIcon,
  EyeIcon,
  FlagIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { WeatherData, CurrentWeather } from '@/app/services/weatherService';
import { useTheme } from '@/app/context/ThemeContext';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Define interfaces for props and data structures
interface WeatherAnalyticsProps {
  weatherData: WeatherData | null;
  selectedLocation: string;
  loading?: boolean;
  onRefresh?: () => void;
  multiLocationData?: Map<string, CurrentWeather>;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  pressure?: number;
  uvIndex?: number;
}

interface TransportationAnalytics {
  safeHours: number;
  riskyHours: number;
  delayProbability: number;
  recommendedTimes: string[];
  avoidTimes: string[];
}

// Define the type for the active tab state
type ActiveTab = 'overview' | 'trends' | 'forecast' | 'transportation' | 'comparison';

const WeatherAnalytics: React.FC<WeatherAnalyticsProps> = ({
  weatherData,
  selectedLocation,
  loading = false,
  onRefresh,
  multiLocationData = new Map(),
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [animationKey, setAnimationKey] = useState(0);

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
    buttonActive: '#1d4ed8',
    chartGrid: '#e5e7eb',
    chartAxis: '#6b7280',
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
    buttonActive: '#1d4ed8',
    chartGrid: '#374151',
    chartAxis: '#9ca3af',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Trigger animation when data changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [weatherData, selectedLocation]);

  // Process hourly data for charts
  const hourlyChartData: ChartDataPoint[] = useMemo(() => {
    if (!weatherData?.hourly) return [];
    
    return weatherData.hourly.map((hour, index) => ({
      time: hour.time,
      temperature: hour.temperature,
      humidity: hour.humidity,
      windSpeed: hour.windSpeed,
      precipitation: hour.precipitationChance,
      pressure: 1013 + Math.sin(index * 0.5) * 10,
      uvIndex: Math.max(0, 8 * Math.sin((index - 6) * Math.PI / 12)),
    }));
  }, [weatherData]);

  // Process daily forecast data
  const dailyChartData = useMemo(() => {
    if (!weatherData?.daily) return [];
    
    return weatherData.daily.map((day) => ({
      day: day.day.slice(0, 3),
      date: day.date,
      tempMax: day.tempMax,
      tempMin: day.tempMin,
      avgTemp: Math.round((day.tempMax + day.tempMin) / 2),
      humidity: day.humidity,
      windSpeed: day.windSpeed,
      precipitation: day.precipitationChance,
      uvIndex: day.uvIndex,
    }));
  }, [weatherData]);

  // Calculate transportation analytics
  const transportationAnalytics: TransportationAnalytics = useMemo(() => {
    if (!weatherData) return {
      safeHours: 0,
      riskyHours: 0,
      delayProbability: 0,
      recommendedTimes: [],
      avoidTimes: [],
    };

    const safeHours = hourlyChartData.filter(hour => 
      hour.precipitation < 30 && hour.windSpeed < 25
    ).length;
    
    const riskyHours = 24 - safeHours;
    const delayProbability = Math.round((riskyHours / 24) * 100);

    const recommendedTimes = hourlyChartData
      .filter(hour => hour.precipitation < 20 && hour.windSpeed < 20)
      .slice(0, 3)
      .map(hour => hour.time);

    const avoidTimes = hourlyChartData
      .filter(hour => hour.precipitation > 60 || hour.windSpeed > 35)
      .slice(0, 3)
      .map(hour => hour.time);

    return {
      safeHours,
      riskyHours,
      delayProbability,
      recommendedTimes,
      avoidTimes,
    };
  }, [hourlyChartData, weatherData]);

  // Multi-location comparison data
  const comparisonData = useMemo(() => {
    if (multiLocationData.size === 0) return [];
    
    return Array.from(multiLocationData.entries()).map(([location, weather]) => ({
      location: location.slice(0, 8),
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      visibility: weather.visibility,
      pressure: weather.pressure,
    }));
  }, [multiLocationData]);

  // Weather condition distribution for pie chart
  const conditionDistribution = useMemo(() => {
    if (!weatherData?.daily) return [];

    const conditions = weatherData.daily.reduce((acc: Record<string, number>, day) => {
      const condition = day.condition;
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    const colors: Record<string, string> = {
      Clear: '#FFD700',
      Clouds: '#87CEEB',
      Rain: '#4682B4',
      Thunderstorm: '#800080',
      Snow: '#F0F8FF',
      Mist: '#D3D3D3',
    };

    return Object.entries(conditions).map(([condition, count]) => ({
      name: condition,
      value: count,
      color: colors[condition] || '#999999',
    }));
  }, [weatherData]);

  // Transportation risk radar data
  const transportationRiskData = useMemo(() => {
    if (!weatherData) return [];

    const current = weatherData.current;
    const impact = weatherData.transportationImpact;

    const riskScores = {
      'Wind Risk': Math.min(100, (current.windSpeed / 50) * 100),
      'Rain Risk': hourlyChartData.length > 0 ? 
        hourlyChartData.reduce((acc, hour) => acc + hour.precipitation, 0) / hourlyChartData.length : 0,
      'Visibility Risk': Math.max(0, 100 - (current.visibility / 10) * 100),
      'Temperature Risk': Math.abs(current.temperature - 25) * 4,
      'Humidity Risk': Math.abs(current.humidity - 60) * 1.67,
      'Overall Risk': impact.overall === 'excellent' ? 10 : 
                     impact.overall === 'good' ? 30 :
                     impact.overall === 'fair' ? 50 :
                     impact.overall === 'poor' ? 80 : 95,
    };

    return Object.entries(riskScores).map(([risk, value]) => ({
      risk,
      value: Math.round(value),
      fullMark: 100,
    }));
  }, [weatherData, hourlyChartData]);

  // Custom tooltip component with proper types
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <p style={{ color: currentThemeStyles.textPrimary, fontWeight: '500', marginBottom: '0.5rem' }}>
            {label}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{
              fontSize: '0.875rem',
              color: entry.color,
              margin: '0.125rem 0'
            }}>
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey?.toString().includes('temp') || entry.dataKey?.toString().includes('Temperature') ? '°C' :
                entry.dataKey?.toString().includes('wind') || entry.dataKey?.toString().includes('Wind') ? ' km/h' :
                entry.dataKey?.toString().includes('precipitation') || entry.dataKey?.toString().includes('humidity') || entry.dataKey?.toString().includes('Humidity') ? '%' :
                entry.dataKey?.toString().includes('pressure') ? ' hPa' :
                entry.dataKey?.toString().includes('visibility') ? ' km' : ''
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Transportation impact color coding
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'excellent': return '#4ade80';
      case 'good': return '#60a5fa';
      case 'fair': return '#facc15';
      case 'poor': return '#fb923c';
      case 'dangerous': return '#f87171';
      default: return currentThemeStyles.textMuted;
    }
  };

  const getImpactIcon = (impact: string) => {
    const iconStyle = { width: '20px', height: '20px' };
    const color = getImpactColor(impact);
    
    switch (impact) {
      case 'excellent': return <CheckCircleIcon style={{ ...iconStyle, color }} />;
      case 'good': return <CheckCircleIcon style={{ ...iconStyle, color }} />;
      case 'fair': return <ExclamationTriangleIcon style={{ ...iconStyle, color }} />;
      case 'poor': return <XCircleIcon style={{ ...iconStyle, color }} />;
      case 'dangerous': return <XCircleIcon style={{ ...iconStyle, color }} />;
      default: return <CloudIcon style={{ ...iconStyle, color }} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '24rem',
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <div style={{ textAlign: 'center' }}>
          <ArrowPathIcon style={{
            width: '32px',
            height: '32px',
            color: '#60a5fa',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: currentThemeStyles.textSecondary }}>Loading weather analytics...</p>
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

  if (!weatherData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '24rem',
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <div style={{ textAlign: 'center' }}>
          <CloudIcon style={{
            width: '48px',
            height: '48px',
            color: currentThemeStyles.textMuted,
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
            No weather data available
          </p>
          <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
            Select a location to view analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: currentThemeStyles.glassPanelBg,
        backdropFilter: 'blur(12px)',
        padding: '1rem',
        borderRadius: '1rem',
        border: currentThemeStyles.glassPanelBorder,
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ChartBarIcon style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>
                Weather Analytics
              </h2>
              <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', margin: 0 }}>
                {selectedLocation} • Last updated: {weatherData.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Time range selector */}
            <div style={{
              display: 'flex',
              backgroundColor: currentThemeStyles.controlBg,
              borderRadius: '0.5rem',
              padding: '0.25rem',
              border: currentThemeStyles.controlBorder
            }}>
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: timeRange === range ? currentThemeStyles.buttonActive : 'transparent',
                    color: timeRange === range ? 'white' : currentThemeStyles.textSecondary
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  padding: '0.5rem',
                  backgroundColor: currentThemeStyles.buttonBg,
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg}
              >
                <ArrowPathIcon style={{ width: '16px', height: '16px', color: 'white' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[
          { id: 'overview', name: 'Overview', icon: ChartBarIcon },
          { id: 'trends', name: 'Trends', icon: ArrowTrendingUpIcon },
          { id: 'forecast', name: 'Forecast', icon: CloudIcon },
          { id: 'transportation', name: 'Transportation', icon: MapPinIcon },
          { id: 'comparison', name: 'Comparison', icon: EyeIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === tab.id ? currentThemeStyles.buttonBg : currentThemeStyles.controlBg,
              color: activeTab === tab.id ? 'white' : currentThemeStyles.textSecondary,
              backdropFilter: 'blur(12px)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            <tab.icon style={{ width: '16px', height: '16px' }} />
            <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }} key={`overview-${animationKey}`}>
          {/* Temperature & Humidity Trend */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <SunIcon style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              Temperature & Humidity (24h)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <YAxis yAxisId="temp" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <YAxis yAxisId="humidity" orientation="right" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  fill="url(#tempGradient)"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Weather Conditions Distribution */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CloudIcon style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
              Weather Conditions (7 days)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={conditionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent || 0 * 100).toFixed(0)}%`}
                >
                  {conditionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Wind & Precipitation */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FlagIcon style={{ width: '20px', height: '20px', color: '#4ade80' }} />
              Wind & Precipitation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <YAxis yAxisId="wind" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <YAxis yAxisId="precip" orientation="right" stroke={currentThemeStyles.chartAxis} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="precip"
                  dataKey="precipitation"
                  fill="#60A5FA"
                  opacity={0.6}
                  name="Precipitation %"
                />
                <Line
                  yAxisId="wind"
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Wind Speed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Transportation Risk Radar */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#facc15' }} />
              Transportation Risk Analysis
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={transportationRiskData}>
                <PolarGrid stroke={currentThemeStyles.chartGrid} />
                <PolarAngleAxis dataKey="risk" tick={{ fontSize: 12, fill: currentThemeStyles.chartAxis }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={currentThemeStyles.chartAxis} fontSize={10} />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} key={`trends-${animationKey}`}>
          {/* Hourly Temperature Trend */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              24-Hour Temperature Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} />
                <YAxis stroke={currentThemeStyles.chartAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  fill="url(#temperatureGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-metric Trends */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              Multi-Metric Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} />
                <YAxis stroke={currentThemeStyles.chartAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Humidity (%)"
                />
                <Line
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Wind Speed (km/h)"
                />
                <Line
                  type="monotone"
                  dataKey="precipitation"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Precipitation (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} key={`forecast-${animationKey}`}>
          {/* 7-Day Temperature Forecast */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              7-Day Temperature Forecast
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="day" stroke={currentThemeStyles.chartAxis} />
                <YAxis stroke={currentThemeStyles.chartAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tempMax"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  name="Max Temp"
                />
                <Area
                  type="monotone"
                  dataKey="tempMin"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="Min Temp"
                />
                <Line
                  type="monotone"
                  dataKey="avgTemp"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  name="Avg Temp"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Precipitation & Wind Forecast */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              Precipitation & Wind Forecast
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey="day" stroke={currentThemeStyles.chartAxis} />
                <YAxis yAxisId="precip" stroke={currentThemeStyles.chartAxis} />
                <YAxis yAxisId="wind" orientation="right" stroke={currentThemeStyles.chartAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="precip"
                  dataKey="precipitation"
                  fill="#60A5FA"
                  name="Precipitation %"
                />
                <Line
                  yAxisId="wind"
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Wind Speed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transportation Tab */}
      {activeTab === 'transportation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} key={`transportation-${animationKey}`}>
          {/* Transportation Impact Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: 0 }}>Overall Conditions</p>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: getImpactColor(weatherData.transportationImpact.overall),
                    margin: 0
                  }}>
                    {weatherData.transportationImpact.overall}
                  </p>
                </div>
                {getImpactIcon(weatherData.transportationImpact.overall)}
              </div>
            </div>

            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: 0 }}>Safe Hours (24h)</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#4ade80', margin: 0 }}>
                    {transportationAnalytics.safeHours}/24
                  </p>
                </div>
                <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#4ade80' }} />
              </div>
            </div>

            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: 0 }}>Delay Risk</p>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: transportationAnalytics.delayProbability < 25 ? '#4ade80' :
                           transportationAnalytics.delayProbability < 50 ? '#facc15' :
                           transportationAnalytics.delayProbability < 75 ? '#fb923c' : '#f87171',
                    margin: 0
                  }}>
                    {transportationAnalytics.delayProbability}%
                  </p>
                </div>
                <ClockIcon style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
              </div>
            </div>

            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: 0 }}>Visibility</p>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: getImpactColor(weatherData.transportationImpact.visibility),
                    margin: 0
                  }}>
                    {weatherData.transportationImpact.visibility}
                  </p>
                </div>
                <EyeIcon style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
              </div>
            </div>
          </div>

          {/* Travel Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: currentThemeStyles.textPrimary,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#4ade80' }} />
                Recommended Travel Times
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {transportationAnalytics.recommendedTimes.length > 0 ? (
                  transportationAnalytics.recommendedTimes.map((time, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <CheckCircleIcon style={{ width: '16px', height: '16px', color: '#4ade80' }} />
                      <span style={{ color: '#bbf7d0' }}>{time}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                    No optimal times identified
                  </p>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: currentThemeStyles.textPrimary,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#facc15' }} />
                Times to Avoid
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {transportationAnalytics.avoidTimes.length > 0 ? (
                  transportationAnalytics.avoidTimes.map((time, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <XCircleIcon style={{ width: '16px', height: '16px', color: '#f87171' }} />
                      <span style={{ color: '#fecaca' }}>{time}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                    No high-risk times identified
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Transportation Recommendations */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              Transportation Recommendations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                  General Advice
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {weatherData.transportationImpact.recommendations.map((rec, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: currentThemeStyles.textSecondary
                    }}>
                      <CheckCircleIcon style={{
                        width: '16px',
                        height: '16px',
                        color: '#60a5fa',
                        marginTop: '0.125rem',
                        flexShrink: 0
                      }} />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                  Active Alerts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {weatherData.transportationImpact.alerts.length > 0 ? (
                    weatherData.transportationImpact.alerts.map((alert, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#fde68a'
                      }}>
                        <ExclamationTriangleIcon style={{
                          width: '16px',
                          height: '16px',
                          color: '#facc15',
                          marginTop: '0.125rem',
                          flexShrink: 0
                        }} />
                        <span>{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#bbf7d0'
                    }}>
                      <CheckCircleIcon style={{ width: '16px', height: '16px', color: '#4ade80' }} />
                      <span>No active weather alerts</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} key={`comparison-${animationKey}`}>
          {comparisonData.length > 0 ? (
            <>
              {/* Multi-location Temperature Comparison */}
              <div style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                backdropFilter: 'blur(12px)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                  Temperature Comparison
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                    <XAxis dataKey="location" stroke={currentThemeStyles.chartAxis} />
                    <YAxis stroke={currentThemeStyles.chartAxis} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="temperature" fill="#EF4444" name="Temperature (°C)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Multi-metric Scatter Plot */}
              <div style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                backdropFilter: 'blur(12px)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                  Weather Conditions Scatter Plot
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                    <XAxis dataKey="temperature" stroke={currentThemeStyles.chartAxis} name="Temperature" unit="°C" />
                    <YAxis dataKey="humidity" stroke={currentThemeStyles.chartAxis} name="Humidity" unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Locations" dataKey="humidity" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              textAlign: 'center'
            }}>
              <MapPinIcon style={{
                width: '48px',
                height: '48px',
                color: currentThemeStyles.textMuted,
                margin: '0 auto 1rem'
              }} />
              <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                No comparison data available
              </p>
              <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                Select multiple locations to compare weather conditions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherAnalytics;
