
// /app/components/WeatherAnalytics.tsx
// Advanced Weather Analytics with Charts for Sri Express Transportation

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
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CloudIcon,
  SunIcon,
  EyeIcon,
  BeakerIcon,
  FlagIcon, // Corrected: Replaced WindIcon with FlagIcon
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { WeatherData, WeatherForecast, CurrentWeather, TransportationImpact } from '@/app/services/weatherService';

interface WeatherAnalyticsProps {
  weatherData: WeatherData | null;
  selectedLocation: string;
  loading?: boolean;
  onRefresh?: () => void;
  historicalData?: any[];
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

const WeatherAnalytics: React.FC<WeatherAnalyticsProps> = ({
  weatherData,
  selectedLocation,
  loading = false,
  onRefresh,
  historicalData = [],
  multiLocationData = new Map(),
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'forecast' | 'transportation' | 'comparison'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [animationKey, setAnimationKey] = useState(0);

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
      pressure: 1013 + Math.sin(index * 0.5) * 10, // Simulated pressure data
      uvIndex: Math.max(0, 8 * Math.sin((index - 6) * Math.PI / 12)), // Simulated UV index
    }));
  }, [weatherData]);

  // Process daily forecast data
  const dailyChartData = useMemo(() => {
    if (!weatherData?.daily) return [];
    
    return weatherData.daily.map((day, index) => ({
      day: day.day.slice(0, 3), // Mon, Tue, etc.
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
      location: location.slice(0, 8), // Truncate for chart
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

    const conditions = weatherData.daily.reduce((acc: any, day) => {
      const condition = day.condition;
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      Clear: '#FFD700',
      Clouds: '#87CEEB',
      Rain: '#4682B4',
      Thunderstorm: '#800080',
      Snow: '#F0F8FF',
      Mist: '#D3D3D3',
    };

    return Object.entries(conditions).map(([condition, count]) => ({
      name: condition,
      value: count as number,
      color: colors[condition as keyof typeof colors] || '#999999',
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
      'Temperature Risk': Math.abs(current.temperature - 25) * 4, // Ideal temp around 25°C
      'Humidity Risk': Math.abs(current.humidity - 60) * 1.67, // Ideal humidity around 60%
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

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm p-3 rounded-lg border border-slate-600 shadow-xl">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey.includes('temp') || entry.dataKey.includes('Temperature') ? '°C' :
                entry.dataKey.includes('wind') || entry.dataKey.includes('Wind') ? ' km/h' :
                entry.dataKey.includes('precipitation') || entry.dataKey.includes('humidity') || entry.dataKey.includes('Humidity') ? '%' :
                entry.dataKey.includes('pressure') ? ' hPa' :
                entry.dataKey.includes('visibility') ? ' km' : ''
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
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'dangerous': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'excellent': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'good': return <CheckCircleIcon className="h-5 w-5 text-blue-400" />;
      case 'fair': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'poor': return <XCircleIcon className="h-5 w-5 text-orange-400" />;
      case 'dangerous': return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default: return <CloudIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading weather analytics...</p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="text-center">
          <CloudIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">No weather data available</p>
          <p className="text-slate-500 text-sm">Select a location to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Weather Analytics</h2>
            <p className="text-slate-400 text-sm">
              {selectedLocation} • Last updated: {weatherData.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time range selector */}
          <div className="flex bg-slate-700 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', name: 'Overview', icon: ChartBarIcon },
          { id: 'trends', name: 'Trends', icon: ArrowTrendingUpIcon },
          { id: 'forecast', name: 'Forecast', icon: CloudIcon },
          { id: 'transportation', name: 'Transportation', icon: MapPinIcon },
          { id: 'comparison', name: 'Comparison', icon: EyeIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" key={`overview-${animationKey}`}>
          {/* Temperature & Humidity Trend */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <SunIcon className="h-5 w-5 text-yellow-400 mr-2" />
              Temperature & Humidity (24h)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="temp" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="humidity" orientation="right" stroke="#9CA3AF" fontSize={12} />
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
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CloudIcon className="h-5 w-5 text-blue-400 mr-2" />
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FlagIcon className="h-5 w-5 text-green-400 mr-2" />
              Wind & Precipitation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="wind" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="precip" orientation="right" stroke="#9CA3AF" fontSize={12} />
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
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              Transportation Risk Analysis
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={transportationRiskData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="risk" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" fontSize={10} />
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
        <div className="space-y-6" key={`trends-${animationKey}`}>
          {/* Hourly Temperature Trend */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Temperature Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
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
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Multi-Metric Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
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
        <div className="space-y-6" key={`forecast-${animationKey}`}>
          {/* 7-Day Temperature Forecast */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">7-Day Temperature Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
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
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Precipitation & Wind Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis yAxisId="precip" stroke="#9CA3AF" />
                <YAxis yAxisId="wind" orientation="right" stroke="#9CA3AF" />
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
        <div className="space-y-6" key={`transportation-${animationKey}`}>
          {/* Transportation Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Overall Conditions</p>
                  <p className={`text-lg font-semibold capitalize ${getImpactColor(weatherData.transportationImpact.overall)}`}>
                    {weatherData.transportationImpact.overall}
                  </p>
                </div>
                {getImpactIcon(weatherData.transportationImpact.overall)}
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Safe Hours (24h)</p>
                  <p className="text-lg font-semibold text-green-400">
                    {transportationAnalytics.safeHours}/24
                  </p>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Delay Risk</p>
                  <p className={`text-lg font-semibold ${
                    transportationAnalytics.delayProbability < 25 ? 'text-green-400' :
                    transportationAnalytics.delayProbability < 50 ? 'text-yellow-400' :
                    transportationAnalytics.delayProbability < 75 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {transportationAnalytics.delayProbability}%
                  </p>
                </div>
                <ClockIcon className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Visibility</p>
                  <p className={`text-lg font-semibold capitalize ${getImpactColor(weatherData.transportationImpact.visibility)}`}>
                    {weatherData.transportationImpact.visibility}
                  </p>
                </div>
                <EyeIcon className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Travel Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                Recommended Travel Times
              </h3>
              <div className="space-y-2">
                {transportationAnalytics.recommendedTimes.length > 0 ? (
                  transportationAnalytics.recommendedTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-900/20 rounded-lg">
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                      <span className="text-green-300">{time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No optimal times identified</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                Times to Avoid
              </h3>
              <div className="space-y-2">
                {transportationAnalytics.avoidTimes.length > 0 ? (
                  transportationAnalytics.avoidTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-red-900/20 rounded-lg">
                      <XCircleIcon className="h-4 w-4 text-red-400" />
                      <span className="text-red-300">{time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No high-risk times identified</p>
                )}
              </div>
            </div>
          </div>

          {/* Transportation Recommendations */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Transportation Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">General Advice</h4>
                <div className="space-y-2">
                  {weatherData.transportationImpact.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-slate-300">
                      <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Active Alerts</h4>
                <div className="space-y-2">
                  {weatherData.transportationImpact.alerts.length > 0 ? (
                    weatherData.transportationImpact.alerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-yellow-300">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-green-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
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
        <div className="space-y-6" key={`comparison-${animationKey}`}>
          {comparisonData.length > 0 ? (
            <>
              {/* Multi-location Temperature Comparison */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Temperature Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="location" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="temperature" fill="#EF4444" name="Temperature (°C)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Multi-metric Scatter Plot */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Weather Conditions Scatter Plot</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="temperature" stroke="#9CA3AF" name="Temperature" unit="°C" />
                    <YAxis dataKey="humidity" stroke="#9CA3AF" name="Humidity" unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Locations" dataKey="humidity" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
              <MapPinIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">No comparison data available</p>
              <p className="text-slate-500 text-sm">Select multiple locations to compare weather conditions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherAnalytics;
