// /app/components/WeatherCharts.tsx
// Advanced Weather Chart Components for Sri Express - FIXED VERSION

'use client';

import React, { useMemo } from 'react';
import {
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Line,
  TooltipProps, // FIX: Imported TooltipProps for proper typing
} from 'recharts';
import {
  SunIcon,
  CloudIcon,
  FlagIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TruckIcon, 
} from '@heroicons/react/24/outline';
import { WeatherData, CurrentWeather } from '@/app/services/weatherService';

// FIX: Removed unused imports: LineChart, AreaChart, EyeIcon, BeakerIcon, ClockIcon, CalendarDaysIcon, ExclamationTriangleIcon

interface WeatherChartsProps {
  weatherData: WeatherData | null;
  currentLocation: string;
  chartType: 'temperature' | 'precipitation' | 'wind' | 'comprehensive' | 'transportation' | 'comparison';
  timeRange: '24h' | '7d' | '30d';
  multiLocationData?: Map<string, CurrentWeather>;
  // FIX: Removed unused 'historicalData' prop
  loading?: boolean;
}

interface ChartDataPoint {
  time: string;
  date?: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  feelsLike: number;
}

const WeatherCharts: React.FC<WeatherChartsProps> = ({
  weatherData,
  currentLocation,
  chartType,
  timeRange,
  multiLocationData = new Map(),
  loading = false,
}) => {
  // Process hourly data for charts
  const hourlyChartData: ChartDataPoint[] = useMemo(() => {
    if (!weatherData?.hourly) return [];
    
    return weatherData.hourly.map((hour, index) => ({
      time: hour.time,
      temperature: hour.temperature,
      humidity: hour.humidity,
      windSpeed: hour.windSpeed,
      precipitation: hour.precipitationChance,
      pressure: 1013 + Math.sin(index * 0.5) * 10, // Simulated
      uvIndex: Math.max(0, 8 * Math.sin((index - 6) * Math.PI / 12)), // Simulated
      visibility: weatherData.current.visibility,
      feelsLike: hour.feelsLike,
    }));
  }, [weatherData]);

  // Process daily data for charts
  const dailyChartData = useMemo(() => {
    if (!weatherData?.daily) return [];
    
    return weatherData.daily.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      day: day.day.slice(0, 3),
      tempMax: day.tempMax,
      tempMin: day.tempMin,
      avgTemp: Math.round((day.tempMax + day.tempMin) / 2),
      humidity: day.humidity,
      windSpeed: day.windSpeed,
      precipitation: day.precipitationChance,
      uvIndex: day.uvIndex,
    }));
  }, [weatherData]);

  // Transportation safety data
  const transportationSafetyData = useMemo(() => {
    if (!weatherData) return [];

    // FIX: Removed unused 'index' parameter
    return hourlyChartData.map((hour) => {
      let safetyScore = 100;
      
      // Reduce safety based on weather conditions
      if (hour.precipitation > 30) safetyScore -= hour.precipitation * 0.8;
      if (hour.windSpeed > 25) safetyScore -= (hour.windSpeed - 25) * 2;
      if (hour.visibility < 5) safetyScore -= (5 - hour.visibility) * 10;
      if (hour.temperature < 5 || hour.temperature > 35) {
        safetyScore -= Math.abs(hour.temperature - 20) * 2;
      }

      return {
        ...hour,
        safetyScore: Math.max(0, Math.min(100, safetyScore)),
        delayRisk: Math.max(0, 100 - safetyScore),
      };
    });
  }, [hourlyChartData, weatherData]);

  // Multi-location comparison data
  const comparisonData = useMemo(() => {
    if (multiLocationData.size === 0) return [];
    
    return Array.from(multiLocationData.entries()).map(([location, weather]) => ({
      location: location.length > 8 ? location.slice(0, 8) + '...' : location,
      fullLocation: location,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      visibility: weather.visibility,
      pressure: weather.pressure,
    }));
  }, [multiLocationData]);

  // Weather pattern distribution
  const weatherPatternData = useMemo(() => {
    if (!weatherData?.daily) return [];

    // FIX: Provided a specific type for the accumulator instead of 'any'
    const patterns = weatherData.daily.reduce((acc: Record<string, number>, day) => {
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

    return Object.entries(patterns).map(([condition, count]) => ({
      name: condition,
      value: count,
      color: colors[condition as keyof typeof colors] || '#999999',
    }));
  }, [weatherData]);

  // Custom tooltip component
  // FIX: Used TooltipProps for type safety instead of 'any'
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl border border-slate-600 shadow-xl">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          {/* FIX: Type for 'entry' is now inferred from TooltipProps */}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center justify-between" style={{ color: entry.color }}>
              <span className="mr-2">{entry.dataKey}:</span>
              <span className="font-medium">
                {entry.value}
                {entry.dataKey?.includes('temp') || entry.dataKey?.includes('Temperature') ? '°C' :
                 entry.dataKey?.includes('wind') || entry.dataKey?.includes('Wind') ? ' km/h' :
                 entry.dataKey?.includes('precipitation') || entry.dataKey?.includes('humidity') || 
                 entry.dataKey?.includes('Humidity') || entry.dataKey?.includes('safetyScore') || 
                 entry.dataKey?.includes('delayRisk') ? '%' :
                 entry.dataKey?.includes('pressure') ? ' hPa' :
                 entry.dataKey?.includes('visibility') ? ' km' :
                 entry.dataKey?.includes('uvIndex') ? ' UV' : ''}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading weather charts...</p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">No weather data available</p>
          <p className="text-slate-500 text-sm">Select a location to view charts</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'temperature':
        return (
          <div className="space-y-6">
            {/* Temperature Trend */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center mb-4">
                <SunIcon className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Temperature Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {timeRange === '7d' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="tempMax"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name="Max Temperature"
                      />
                      <Area
                        type="monotone"
                        dataKey="tempMin"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Min Temperature"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgTemp"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Average"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#EF4444"
                        fill="url(#temperatureGradient)"
                        strokeWidth={2}
                        name="Temperature"
                      />
                      <Line
                        type="monotone"
                        dataKey="feelsLike"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Feels Like"
                      />
                    </>
                  )}
                  <defs>
                    <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Temperature vs Humidity Correlation */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Temperature vs Humidity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="temperature" stroke="#9CA3AF" name="Temperature" unit="°C" />
                  <YAxis dataKey="humidity" stroke="#9CA3AF" name="Humidity" unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Data Points" dataKey="humidity" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'precipitation':
        return (
          <div className="space-y-6">
            {/* Precipitation Forecast */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center mb-4">
                <CloudIcon className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Precipitation Forecast</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke="#9CA3AF" />
                  <YAxis yAxisId="precip" stroke="#9CA3AF" />
                  <YAxis yAxisId="humidity" orientation="right" stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="precip"
                    dataKey="precipitation"
                    fill="#60A5FA"
                    name="Precipitation %"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Humidity %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Weather Pattern Distribution */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Weather Patterns (7 days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={weatherPatternData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {weatherPatternData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'wind':
        return (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <FlagIcon className="h-6 w-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Wind Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke="#9CA3AF" />
                <YAxis yAxisId="wind" stroke="#9CA3AF" />
                <YAxis yAxisId="visibility" orientation="right" stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="wind"
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="Wind Speed (km/h)"
                />
                <Line
                  yAxisId="visibility"
                  type="monotone"
                  dataKey="visibility"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Visibility (km)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );

      case 'transportation':
        return (
          <div className="space-y-6">
            {/* Transportation Safety Score */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center mb-4">
                <TruckIcon className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Transportation Safety Analysis</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={transportationSafetyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="safetyScore"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Safety Score %"
                  />
                  <Bar
                    dataKey="delayRisk"
                    fill="#EF4444"
                    name="Delay Risk %"
                    radius={[2, 2, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Multi-factor Risk Analysis */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Multi-Factor Risk Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  {
                    factor: 'Wind Risk',
                    value: Math.min(100, (weatherData.current.windSpeed / 50) * 100),
                  },
                  {
                    factor: 'Rain Risk',
                    value: hourlyChartData.length > 0 ? 
                      hourlyChartData.reduce((acc, hour) => acc + hour.precipitation, 0) / hourlyChartData.length : 0,
                  },
                  {
                    factor: 'Visibility Risk',
                    value: Math.max(0, 100 - (weatherData.current.visibility / 10) * 100),
                  },
                  {
                    factor: 'Temperature Risk',
                    value: Math.abs(weatherData.current.temperature - 25) * 4,
                  },
                  {
                    factor: 'Humidity Risk',
                    value: Math.abs(weatherData.current.humidity - 60) * 1.67,
                  },
                ]}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
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
        );

      case 'comparison':
        return (
          <div className="space-y-6">
            {comparisonData.length > 0 ? (
              <>
                {/* Multi-location Temperature Comparison */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Multi-Location Temperature Comparison</h3>
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

                {/* Weather Conditions Comparison */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Weather Conditions Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="location" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="humidity" fill="#3B82F6" name="Humidity %" />
                      <Line
                        type="monotone"
                        dataKey="windSpeed"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Wind Speed (km/h)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                <ChartBarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">No comparison data available</p>
                <p className="text-slate-500 text-sm">Select multiple locations to compare weather conditions</p>
              </div>
            )}
          </div>
        );

      case 'comprehensive':
      default:
        return (
          <div className="space-y-6">
            {/* Comprehensive Weather Overview */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Comprehensive Weather Analysis</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke="#9CA3AF" />
                  <YAxis yAxisId="temp" stroke="#9CA3AF" />
                  <YAxis yAxisId="percent" orientation="right" stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.3}
                    name="Temperature (°C)"
                  />
                  <Bar
                    yAxisId="percent"
                    dataKey="precipitation"
                    fill="#60A5FA"
                    name="Precipitation %"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="percent"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Humidity %"
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Wind Speed (km/h)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* UV Index & Pressure */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">UV Index & Atmospheric Pressure</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis yAxisId="uv" stroke="#9CA3AF" />
                  <YAxis yAxisId="pressure" orientation="right" stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="uv"
                    type="monotone"
                    dataKey="uvIndex"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                    name="UV Index"
                  />
                  <Line
                    yAxisId="pressure"
                    type="monotone"
                    dataKey="pressure"
                    stroke="#6366F1"
                    strokeWidth={2}
                    name="Pressure (hPa)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Weather Charts</h2>
            <p className="text-slate-400">
              {currentLocation} • {timeRange === '24h' ? '24 Hour' : timeRange === '7d' ? '7 Day' : '30 Day'} View
            </p>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      {renderChart()}
    </div>
  );
};

export default WeatherCharts;