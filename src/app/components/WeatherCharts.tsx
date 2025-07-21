// /app/components/WeatherCharts.tsx
// Advanced Weather Chart Components for Sri Express with Glass Design

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
import { useTheme } from '@/app/context/ThemeContext';

interface WeatherChartsProps {
  weatherData: WeatherData | null;
  currentLocation: string;
  chartType: 'temperature' | 'precipitation' | 'wind' | 'comprehensive' | 'transportation' | 'comparison';
  timeRange: '24h' | '7d' | '30d';
  multiLocationData?: Map<string, CurrentWeather>;
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

// Define custom tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string;
    name?: string;
    value?: number | string;
    payload?: ChartDataPoint;
  }>;
  label?: string | number;
}

const WeatherCharts: React.FC<WeatherChartsProps> = ({
  weatherData,
  currentLocation,
  chartType,
  timeRange,
  multiLocationData = new Map(),
  loading = false,
}) => {
  const { theme } = useTheme();

  // Theme styles
  const lightTheme = {
    mainBg: '#fffbeb',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
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
    chartGrid: '#374151',
    chartAxis: '#9ca3af',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

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

    return hourlyChartData.map((hour) => {
      let safetyScore = 100;
      
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
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <p style={{ color: currentThemeStyles.textPrimary, fontWeight: '500', marginBottom: '0.5rem' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: entry.color,
              margin: '0.25rem 0'
            }}>
              <span style={{ marginRight: '0.5rem' }}>{entry.dataKey}:</span>
              <span style={{ fontWeight: '500' }}>
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
          <p style={{ color: currentThemeStyles.textSecondary }}>Loading weather charts...</p>
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
          <ChartBarIcon style={{
            width: '48px',
            height: '48px',
            color: currentThemeStyles.textMuted,
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
            No weather data available
          </p>
          <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
            Select a location to view charts
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'temperature':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Temperature Trend */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <SunIcon style={{ width: '24px', height: '24px', color: '#fbbf24', marginRight: '0.5rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Temperature Trends
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke={currentThemeStyles.chartAxis} />
                  <YAxis stroke={currentThemeStyles.chartAxis} />
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
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                Temperature vs Humidity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey="temperature" stroke={currentThemeStyles.chartAxis} name="Temperature" unit="°C" />
                  <YAxis dataKey="humidity" stroke={currentThemeStyles.chartAxis} name="Humidity" unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Data Points" dataKey="humidity" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'precipitation':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Precipitation Forecast */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <CloudIcon style={{ width: '24px', height: '24px', color: '#60a5fa', marginRight: '0.5rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Precipitation Forecast
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="precip" stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="humidity" orientation="right" stroke={currentThemeStyles.chartAxis} />
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
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                Weather Patterns (7 days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={weatherPatternData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            backdropFilter: 'blur(12px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <FlagIcon style={{ width: '24px', height: '24px', color: '#4ade80', marginRight: '0.5rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                Wind Analysis
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke={currentThemeStyles.chartAxis} />
                <YAxis yAxisId="wind" stroke={currentThemeStyles.chartAxis} />
                <YAxis yAxisId="visibility" orientation="right" stroke={currentThemeStyles.chartAxis} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Transportation Safety Score */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <TruckIcon style={{ width: '24px', height: '24px', color: '#60a5fa', marginRight: '0.5rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Transportation Safety Analysis
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={transportationSafetyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} />
                  <YAxis stroke={currentThemeStyles.chartAxis} />
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
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                Multi-Factor Risk Analysis
              </h3>
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
                  <PolarGrid stroke={currentThemeStyles.chartGrid} />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12, fill: currentThemeStyles.chartAxis }} />
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
        );

      case 'comparison':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                    Multi-Location Temperature Comparison
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

                {/* Weather Conditions Comparison */}
                <div style={{
                  backgroundColor: currentThemeStyles.glassPanelBg,
                  backdropFilter: 'blur(12px)',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: currentThemeStyles.glassPanelBorder,
                  boxShadow: currentThemeStyles.glassPanelShadow
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                    Weather Conditions Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                      <XAxis dataKey="location" stroke={currentThemeStyles.chartAxis} />
                      <YAxis stroke={currentThemeStyles.chartAxis} />
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
              <div style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                backdropFilter: 'blur(12px)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                textAlign: 'center'
              }}>
                <ChartBarIcon style={{
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
        );

      case 'comprehensive':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Comprehensive Weather Overview */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <ChartBarIcon style={{ width: '24px', height: '24px', color: '#a78bfa', marginRight: '0.5rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Comprehensive Weather Analysis
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timeRange === '24h' ? hourlyChartData : dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="temp" stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="percent" orientation="right" stroke={currentThemeStyles.chartAxis} />
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
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                UV Index & Atmospheric Pressure
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentThemeStyles.chartGrid} />
                  <XAxis dataKey="time" stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="uv" stroke={currentThemeStyles.chartAxis} />
                  <YAxis yAxisId="pressure" orientation="right" stroke={currentThemeStyles.chartAxis} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ChartBarIcon style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>
              Weather Charts
            </h2>
            <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
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