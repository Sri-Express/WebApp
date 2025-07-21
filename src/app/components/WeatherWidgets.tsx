// // /app/components/WeatherWidgets.tsx
// // Compact Weather Display Widgets for Sri Express Dashboard

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import {
//   CloudIcon,
//   SunIcon,
//   EyeIcon,
//   FlagIcon, // Corrected: Replaced WindIcon with FlagIcon
//   MapPinIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   ArrowPathIcon,
//   ChevronRightIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   CalendarDaysIcon,
//   TruckIcon,
//   BoltIcon,
//   BeakerIcon,
//   InformationCircleIcon,
//   ChartBarIcon,
// } from '@heroicons/react/24/outline';
// import { WeatherData, CurrentWeather, TransportationImpact } from '@/app/services/weatherService';

// interface WeatherWidgetsProps {
//   weatherData: WeatherData | null;
//   currentLocation: string;
//   loading?: boolean;
//   onRefresh?: () => void;
//   onLocationChange?: (location: string) => void;
//   availableLocations?: string[];
//   compact?: boolean;
// }

// interface WeatherIconProps {
//   condition: string;
//   size?: 'sm' | 'md' | 'lg';
//   className?: string;
// }

// // Enhanced Weather Icon Component
// const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, size = 'md', className = '' }) => {
//   const sizeClasses = {
//     sm: 'h-4 w-4',
//     md: 'h-6 w-6',
//     lg: 'h-8 w-8',
//   };

//   const iconClass = `${sizeClasses[size]} ${className}`;

//   switch (condition.toLowerCase()) {
//     case 'clear':
//       return <SunIcon className={`${iconClass} text-yellow-400`} />;
//     case 'clouds':
//       return <CloudIcon className={`${iconClass} text-gray-300`} />;
//     case 'rain':
//     case 'drizzle':
//       return <CloudIcon className={`${iconClass} text-blue-400`} />;
//     case 'thunderstorm':
//       return <BoltIcon className={`${iconClass} text-purple-400`} />;
//     case 'snow':
//       return <CloudIcon className={`${iconClass} text-white`} />;
//     case 'mist':
//     case 'fog':
//       return <CloudIcon className={`${iconClass} text-gray-400`} />;
//     default:
//       return <CloudIcon className={`${iconClass} text-gray-300`} />;
//   }
// };

// // Transportation Impact Badge
// const TransportationImpactBadge: React.FC<{ impact: TransportationImpact['overall'] }> = ({ impact }) => {
//   const getImpactStyles = (impact: string) => {
//     switch (impact) {
//       case 'excellent':
//         return 'bg-green-500/20 text-green-400 border-green-500/30';
//       case 'good':
//         return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
//       case 'fair':
//         return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
//       case 'poor':
//         return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
//       case 'dangerous':
//         return 'bg-red-500/20 text-red-400 border-red-500/30';
//       default:
//         return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
//     }
//   };

//   const getImpactIcon = (impact: string) => {
//     switch (impact) {
//       case 'excellent':
//       case 'good':
//         return <CheckCircleIcon className="h-3 w-3" />;
//       case 'fair':
//         return <InformationCircleIcon className="h-3 w-3" />;
//       case 'poor':
//       case 'dangerous':
//         return <ExclamationTriangleIcon className="h-3 w-3" />;
//       default:
//         return <CloudIcon className="h-3 w-3" />;
//     }
//   };

//   return (
//     <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getImpactStyles(impact)}`}>
//       {getImpactIcon(impact)}
//       <span className="capitalize">{impact}</span>
//     </div>
//   );
// };

// // Temperature Trend Component
// const TemperatureTrend: React.FC<{ current: number; forecast?: number }> = ({ current, forecast }) => {
//   if (!forecast) return null;

//   const diff = forecast - current;
//   const isRising = diff > 0;
//   const isSignificant = Math.abs(diff) > 2;

//   if (!isSignificant) return null;

//   return (
//     <div className={`inline-flex items-center space-x-1 text-xs ${isRising ? 'text-red-400' : 'text-blue-400'}`}>
//       {isRising ? (
//         <ArrowTrendingUpIcon className="h-3 w-3" />
//       ) : (
//         <ArrowTrendingDownIcon className="h-3 w-3" />
//       )}
//       <span>{Math.abs(diff).toFixed(1)}°</span>
//     </div>
//   );
// };

// const WeatherWidgets: React.FC<WeatherWidgetsProps> = ({
//   weatherData,
//   currentLocation,
//   loading = false,
//   onRefresh,
//   onLocationChange,
//   availableLocations = [],
//   compact = false,
// }) => {
//   const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
//   const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

//   // Auto-refresh every 10 minutes
//   useEffect(() => {
//     if (!autoRefreshEnabled || !onRefresh) return;

//     const interval = setInterval(() => {
//       onRefresh();
//       setLastUpdated(new Date());
//     }, 10 * 60 * 1000);

//     return () => clearInterval(interval);
//   }, [autoRefreshEnabled, onRefresh]);

//   // Format time helper
//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Get next few hours of weather
//   const getNextHours = (hours: number = 6) => {
//     if (!weatherData?.hourly) return [];
//     return weatherData.hourly.slice(0, hours);
//   };

//   // Get transportation recommendation
//   const getTransportationRecommendation = (): string => {
//     if (!weatherData) return 'Weather data unavailable';
    
//     const { transportationImpact } = weatherData;
    
//     if (transportationImpact.alerts.length > 0) {
//       return transportationImpact.alerts[0];
//     }
    
//     if (transportationImpact.recommendations.length > 0) {
//       return transportationImpact.recommendations[0];
//     }
    
//     return 'Normal travel conditions';
//   };

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 animate-pulse">
//             <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
//             <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
//             <div className="h-3 bg-slate-700 rounded w-full"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (!weatherData) {
//     return (
//       <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
//         <CloudIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-white mb-2">Weather Data Unavailable</h3>
//         <p className="text-slate-400 mb-4">Unable to load weather information for {currentLocation}</p>
//         {onRefresh && (
//           <button
//             onClick={onRefresh}
//             className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//           >
//             <ArrowPathIcon className="h-4 w-4" />
//             <span>Retry</span>
//           </button>
//         )}
//       </div>
//     );
//   }

//   const { current, daily, hourly, transportationImpact } = weatherData;

//   if (compact) {
//     // Compact widget for dashboard integration
//     return (
//       <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-2">
//             <MapPinIcon className="h-4 w-4 text-slate-400" />
//             <span className="text-sm font-medium text-white">{currentLocation}</span>
//           </div>
//           <Link 
//             href="/weather"
//             className="text-blue-400 hover:text-blue-300 transition-colors"
//           >
//             <ChevronRightIcon className="h-4 w-4" />
//           </Link>
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <WeatherIcon condition={current.condition} size="lg" />
//             <div>
//               <div className="text-2xl font-bold text-white">{current.temperature}°C</div>
//               <div className="text-sm text-slate-400 capitalize">{current.description}</div>
//             </div>
//           </div>
          
//           <div className="text-right">
//             <TransportationImpactBadge impact={transportationImpact.overall} />
//             <div className="text-xs text-slate-400 mt-1">Travel conditions</div>
//           </div>
//         </div>

//         <div className="mt-3 pt-3 border-t border-slate-700">
//           <div className="grid grid-cols-3 gap-3 text-center">
//             <div>
//               <div className="text-xs text-slate-400">Humidity</div>
//               <div className="text-sm font-medium text-white">{current.humidity}%</div>
//             </div>
//             <div>
//               <div className="text-xs text-slate-400">Wind</div>
//               <div className="text-sm font-medium text-white">{current.windSpeed} km/h</div>
//             </div>
//             <div>
//               <div className="text-xs text-slate-400">Visibility</div>
//               <div className="text-sm font-medium text-white">{current.visibility} km</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header with controls */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <WeatherIcon condition={current.condition} size="lg" />
//           <div>
//             <h2 className="text-xl font-bold text-white">Weather Overview</h2>
//             <p className="text-slate-400">{currentLocation} • Updated {formatTime(lastUpdated)}</p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-3">
//           {/* Location selector */}
//           {availableLocations.length > 0 && onLocationChange && (
//             <select
//               value={currentLocation}
//               onChange={(e) => onLocationChange(e.target.value)}
//               className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
//             >
//               {availableLocations.map((location) => (
//                 <option key={location} value={location}>
//                   {location}
//                 </option>
//               ))}
//             </select>
//           )}

//           {/* Refresh button */}
//           {onRefresh && (
//             <button
//               onClick={onRefresh}
//               className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
//               title="Refresh weather data"
//             >
//               <ArrowPathIcon className="h-4 w-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main weather widgets grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {/* Current Weather Widget */}
//         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-white">Current Conditions</h3>
//             <WeatherIcon condition={current.condition} size="md" />
//           </div>

//           <div className="space-y-3">
//             <div className="flex items-end space-x-2">
//               <span className="text-4xl font-bold text-white">{current.temperature}°C</span>
//               <TemperatureTrend 
//                 current={current.temperature} 
//                 forecast={daily[0]?.tempMax} 
//               />
//             </div>
            
//             <p className="text-slate-300 capitalize">{current.description}</p>
//             <p className="text-sm text-slate-400">Feels like {current.feelsLike}°C</p>

//             <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
//               <div className="flex items-center space-x-2">
//                 <EyeIcon className="h-4 w-4 text-slate-400" />
//                 <span className="text-sm text-slate-300">{current.visibility} km</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <FlagIcon className="h-4 w-4 text-slate-400" />
//                 <span className="text-sm text-slate-300">{current.windSpeed} km/h</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Transportation Impact Widget */}
//         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-white">Transportation Impact</h3>
//             <TruckIcon className="h-6 w-6 text-blue-400" />
//           </div>

//           <div className="space-y-4">
//             <div className="text-center">
//               <TransportationImpactBadge impact={transportationImpact.overall} />
//               <p className="text-xs text-slate-400 mt-2">Overall conditions</p>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="text-center p-3 bg-slate-900/50 rounded-lg">
//                 <div className="text-xs text-slate-400 mb-1">Visibility</div>
//                 <div className={`text-sm font-medium capitalize ${
//                   transportationImpact.visibility === 'excellent' ? 'text-green-400' :
//                   transportationImpact.visibility === 'good' ? 'text-blue-400' :
//                   transportationImpact.visibility === 'reduced' ? 'text-yellow-400' :
//                   'text-red-400'
//                 }`}>
//                   {transportationImpact.visibility}
//                 </div>
//               </div>
//               <div className="text-center p-3 bg-slate-900/50 rounded-lg">
//                 <div className="text-xs text-slate-400 mb-1">Road Conditions</div>
//                 <div className={`text-sm font-medium capitalize ${
//                   transportationImpact.roadConditions === 'excellent' ? 'text-green-400' :
//                   transportationImpact.roadConditions === 'good' ? 'text-blue-400' :
//                   transportationImpact.roadConditions === 'wet' ? 'text-yellow-400' :
//                   'text-red-400'
//                 }`}>
//                   {transportationImpact.roadConditions}
//                 </div>
//               </div>
//             </div>

//             <div className="p-3 bg-slate-900/50 rounded-lg">
//               <div className="text-xs text-slate-400 mb-1">Recommendation</div>
//               <p className="text-sm text-slate-300">{getTransportationRecommendation()}</p>
//             </div>
//           </div>
//         </div>

//         {/* Hourly Forecast Widget */}
//         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-white">Next 6 Hours</h3>
//             <ClockIcon className="h-6 w-6 text-green-400" />
//           </div>

//           <div className="space-y-3">
//             {getNextHours(6).map((hour, index) => (
//               <div key={index} className="flex items-center justify-between py-2">
//                 <div className="flex items-center space-x-3">
//                   <span className="text-sm text-slate-400 w-12">{hour.time}</span>
//                   <WeatherIcon condition={hour.condition} size="sm" />
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <span className="text-sm text-white">{hour.temperature}°C</span>
//                   <span className="text-xs text-blue-400">{hour.precipitationChance}%</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 7-Day Forecast Widget */}
//         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 md:col-span-2 lg:col-span-3">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
//             <CalendarDaysIcon className="h-6 w-6 text-purple-400" />
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
//             {daily.slice(0, 7).map((day, index) => (
//               <div key={index} className="text-center p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
//                 <div className="text-sm font-medium text-white mb-2">
//                   {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day.slice(0, 3)}
//                 </div>
//                 <div className="flex justify-center mb-3">
//                   <WeatherIcon condition={day.condition} size="md" />
//                 </div>
//                 <div className="space-y-1">
//                   <div className="text-sm font-semibold text-white">
//                     {day.tempMax}° / {day.tempMin}°
//                   </div>
//                   <div className="text-xs text-blue-400">
//                     {day.precipitationChance}% rain
//                   </div>
//                   <div className="text-xs text-green-400">
//                     {day.windSpeed} km/h
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Weather Alerts Widget */}
//         {(transportationImpact.alerts.length > 0 || transportationImpact.recommendations.length > 0) && (
//           <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 md:col-span-2 lg:col-span-3">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white">Travel Advisories</h3>
//               <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Alerts */}
//               {transportationImpact.alerts.length > 0 && (
//                 <div>
//                   <h4 className="text-sm font-medium text-yellow-400 mb-2">Active Alerts</h4>
//                   <div className="space-y-2">
//                     {transportationImpact.alerts.map((alert, index) => (
//                       <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
//                         <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
//                         <span className="text-sm text-yellow-300">{alert}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Recommendations */}
//               <div>
//                 <h4 className="text-sm font-medium text-blue-400 mb-2">Recommendations</h4>
//                 <div className="space-y-2">
//                   {transportationImpact.recommendations.slice(0, 3).map((rec, index) => (
//                     <div key={index} className="flex items-start space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
//                       <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
//                       <span className="text-sm text-blue-300">{rec}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Quick Actions */}
//       <div className="flex flex-wrap gap-3">
//         <Link
//           href="/weather"
//           className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//         >
//           <ChartBarIcon className="h-4 w-4" />
//           <span>View Analytics</span>
//         </Link>
        
//         <Link
//           href="/weather?tab=chatbot"
//           className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
//         >
//           <BoltIcon className="h-4 w-4" />
//           <span>AI Assistant</span>
//         </Link>

//         <button
//           onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
//           className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
//             autoRefreshEnabled
//               ? 'bg-green-600 hover:bg-green-700 text-white'
//               : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
//           }`}
//         >
//           <ArrowPathIcon className="h-4 w-4" />
//           <span>Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WeatherWidgets;