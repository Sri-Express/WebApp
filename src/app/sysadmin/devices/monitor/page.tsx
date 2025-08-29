// src/app/sysadmin/devices/monitor/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlobeAltIcon, DevicePhoneMobileIcon, MagnifyingGlassIcon, MapPinIcon, SignalIcon, BoltIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon, ViewColumnsIcon, MapIcon, FunnelIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';

// Dynamic import for the map component (SSR safe)
const AdvancedMap = dynamic(() => import('../../../components/AdvancedMap'), { 
  ssr: false, 
  loading: () => (
    <div style={{ 
      height: '100%', 
      backgroundColor: 'rgba(51, 65, 85, 0.6)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: '0.75rem' 
    }}>
      <div style={{ color: '#94a3b8' }}>Loading advanced GPS map...</div>
    </div>
  ) 
});

interface Device { 
  _id: string; 
  deviceId: string; 
  vehicleNumber: string; 
  vehicleType: 'bus' | 'train'; 
  status: 'online' | 'offline' | 'maintenance'; 
  lastSeen: string; 
  location: { 
    latitude: number; 
    longitude: number; 
    address: string; 
    lastUpdated: string; 
  }; 
  batteryLevel: number; 
  signalStrength: number; 
  assignedTo: { 
    type: 'route_admin' | 'company_admin' | 'system'; 
    name: string; 
    id: string; 
  }; 
  route?: { id: string; name: string; }; 
  alerts: { count: number; messages: string[]; }; 
}

interface VehicleLocation { 
  _id: string; 
  deviceId: string; 
  routeId: string; 
  vehicleId: string; 
  vehicleNumber: string; 
  location: { 
    latitude: number; 
    longitude: number; 
    accuracy: number; 
    heading: number; 
    speed: number; 
    altitude: number; 
  }; 
  routeProgress: { 
    currentWaypoint: number; 
    distanceCovered: number; 
    estimatedTimeToDestination: number; 
    nextStopETA: string; 
    progressPercentage: number; 
  }; 
  passengerLoad: { 
    currentCapacity: number; 
    maxCapacity: number; 
    loadPercentage: number; 
  }; 
  operationalInfo: { 
    driverInfo: { driverName: string; contactNumber: string; }; 
    tripInfo: { tripId: string; departureTime: string; estimatedArrival: string; }; 
    status: 'on_route' | 'at_stop' | 'delayed' | 'breakdown' | 'off_duty'; 
    delays: { currentDelay: number; reason: string; }; 
  }; 
  environmentalData: { weather: string; temperature: number; trafficCondition: string; }; 
  timestamp: string; 
}

interface SimulationStatus { 
  isRunning: boolean; 
  vehicleCount: number; 
  speedMultiplier: number; 
  routes: number; 
  lastUpdate: string; 
}

type ViewMode = 'map' | 'grid' | 'hybrid';

export default function AdvancedDeviceMonitorPage() {
  const router = useRouter(); 
  const { theme } = useTheme();
  
  const [devices, setDevices] = useState<Device[]>([]); 
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]); 
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [typeFilter, setTypeFilter] = useState('all'); 
  const [autoRefresh, setAutoRefresh] = useState(true); 
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); 
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null); 
  const [showSimulationData, setShowSimulationData] = useState(true);

  // Theme styles - consistent with dashboard
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    navBg: 'rgba(30, 41, 59, 0.92)',
    inputBg: 'rgba(249, 250, 251, 0.8)',
    inputBorder: '1px solid rgba(209, 213, 219, 0.5)'
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
    navBg: 'rgba(30, 41, 59, 0.92)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '1px solid rgba(75, 85, 99, 0.5)'
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Animation styles
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } 
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
    .animate-road-marking { animation: road-marking 10s linear infinite; }
    @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
    .animate-car-right { animation: car-right 15s linear infinite; }
    @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } }
    .animate-car-left { animation: car-left 16s linear infinite; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
    .animate-light-blink { animation: light-blink 2s infinite; }
  `;

  // Get auth token
  const getToken = () => localStorage.getItem('token');

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { 
    const token = getToken(); 
    if (!token) { 
      router.push('/sysadmin/login'); 
      return null; 
    } 
    try { 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`, { 
        ...options, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          ...options.headers, 
        }, 
      }); 
      if (!response.ok) { 
        if (response.status === 401) { 
          localStorage.removeItem('token'); 
          router.push('/sysadmin/login'); 
          return null; 
        } 
        throw new Error(`API Error: ${response.status}`); 
      } 
      return await response.json(); 
    } catch (error) { 
      console.error('API call error:', error); 
      return null; 
    } 
  }, [router]);

  // Load devices data
  const loadDevices = useCallback(async () => { 
    try { 
      const response = await apiCall('/admin/devices?limit=1000'); 
      if (response?.devices && Array.isArray(response.devices)) { 
        setDevices(response.devices); 
      } else {
        setDevices([]);
      }
    } catch (error) { 
      console.error('Error loading devices:', error);
      setDevices([]);
    } 
  }, [apiCall]);

  // Load real-time vehicle locations (GPS simulation data)
  const loadVehicleLocations = useCallback(async () => { 
    try { 
      const response = await apiCall('/tracking/live'); 
      if (response?.vehicles && Array.isArray(response.vehicles)) { 
        setVehicles(response.vehicles); 
      } else {
        setVehicles([]);
      }
    } catch (error) { 
      console.error('Error loading vehicle locations:', error);
      setVehicles([]);
    } 
  }, [apiCall]);

  // Load simulation status
  const loadSimulationStatus = useCallback(async () => { 
    try { 
      const response = await apiCall('/admin/simulation/status'); 
      if (response?.simulation) { 
        setSimulationStatus(response.simulation); 
      } 
    } catch (error) { 
      console.error('Error loading simulation status:', error); 
    } 
  }, [apiCall]);

  // Control simulation
  const controlSimulation = useCallback(async (action: 'start' | 'stop' | 'speed', value?: number) => { 
    try { 
      const endpoint = action === 'speed' ? `/admin/simulation/speed` : `/admin/simulation/${action}`; 
      const options = action === 'speed' ? { method: 'POST', body: JSON.stringify({ speed: value }) } : { method: 'POST' }; 
      const response = await apiCall(endpoint, options); 
      if (response) { 
        setSimulationStatus(response.simulation); 
        if (action === 'start') setAutoRefresh(true); 
      } 
    } catch (error) { 
      console.error('Error controlling simulation:', error); 
    } 
  }, [apiCall]);

  // Initial load
  useEffect(() => { 
    const initialLoad = async () => { 
      setLoading(true); 
      try {
        await Promise.all([loadDevices(), loadVehicleLocations(), loadSimulationStatus()]);
      } catch (error) {
        console.error('Error during initial load:', error);
        setDevices([]);
        setVehicles([]);
        setSimulationStatus(null);
      } finally {
        setLoading(false); 
      }
    }; 
    initialLoad(); 
  }, [loadDevices, loadVehicleLocations, loadSimulationStatus]);

  // Auto refresh
  useEffect(() => { 
    if (!autoRefresh) return; 
    const interval = setInterval(() => { 
      loadDevices(); 
      loadVehicleLocations(); 
      loadSimulationStatus(); 
    }, 5000); 
    return () => clearInterval(interval); 
  }, [autoRefresh, loadDevices, loadVehicleLocations, loadSimulationStatus]);

  // Filter devices
  useEffect(() => { 
    let filtered = devices; 
    if (searchTerm && searchTerm.trim()) { 
      filtered = filtered.filter(device => {
        const deviceId = device?.deviceId?.toLowerCase() || '';
        const vehicleNumber = device?.vehicleNumber?.toLowerCase() || '';
        const address = device?.location?.address?.toLowerCase() || '';
        const assignedName = device?.assignedTo?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return deviceId.includes(searchLower) || 
               vehicleNumber.includes(searchLower) || 
               address.includes(searchLower) || 
               assignedName.includes(searchLower);
      }); 
    } 
    if (statusFilter !== 'all') { 
      filtered = filtered.filter(device => device?.status === statusFilter); 
    } 
    if (typeFilter !== 'all') { 
      filtered = filtered.filter(device => device?.vehicleType === typeFilter); 
    } 
    setFilteredDevices(filtered); 
  }, [devices, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => { 
    switch (status) { 
      case 'online': return '#10b981'; 
      case 'offline': return '#ef4444'; 
      case 'maintenance': return '#f59e0b'; 
      default: return '#6b7280'; 
    } 
  }; 

  const getStatusIcon = (status: string) => { 
    switch (status) { 
      case 'online': return <CheckCircleIcon width={16} height={16} />; 
      case 'offline': return <XCircleIcon width={16} height={16} />; 
      case 'maintenance': return <ClockIcon width={16} height={16} />; 
      default: return <ExclamationTriangleIcon width={16} height={16} />; 
    } 
  }; 

  const getBatteryColor = (level: number) => { 
    if (level > 50) return '#10b981'; 
    if (level > 20) return '#f59e0b'; 
    return '#ef4444'; 
  }; 

  const getTimeSince = (dateString: string) => { 
    const now = new Date(); 
    const past = new Date(dateString); 
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60)); 
    if (diffInMinutes < 1) return 'Just now'; 
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`; 
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`; 
    return `${Math.floor(diffInMinutes / 1440)}d ago`; 
  };

  const handleRefresh = async () => { 
    setLoading(true); 
    await Promise.all([loadDevices(), loadVehicleLocations(), loadSimulationStatus()]); 
    setLoading(false); 
  };

  // Combine device and vehicle data for display
  const displayData = showSimulationData ? vehicles : filteredDevices; 
  const deviceCounts = { 
    total: devices?.length || 0, 
    online: devices?.filter(d => d?.status === 'online')?.length || 0, 
    offline: devices?.filter(d => d?.status === 'offline')?.length || 0, 
    maintenance: devices?.filter(d => d?.status === 'maintenance')?.length || 0, 
    alerts: devices?.reduce((sum, d) => sum + (d?.alerts?.count || 0), 0) || 0, 
    simulationVehicles: vehicles?.length || 0 
  };

  if (loading && devices.length === 0) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `4px solid ${theme === 'dark' ? '#1e293b' : '#f3f4f6'}`, 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 1rem' 
          }}></div>
          <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>Loading Advanced Device Monitor...</p>
          <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginTop: '0.5rem' }}>Initializing GPS tracking system</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, background: currentThemeStyles.bgGradient, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>

      {/* Animated Background with Vehicles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {/* Road */}
        <div style={{ 
          position: 'absolute', 
          top: '15%', 
          left: 0, 
          right: 0, 
          height: '100px', 
          backgroundColor: '#1f2937', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' 
        }}></div>
        
        {/* Road Markings */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 40px, transparent 40px, transparent 80px)', transform: 'translateY(-50%)' }}></div>
          <div className="animate-road-marking" style={{ position: 'absolute', top: '30%', width: '60px', height: '8px', backgroundColor: '#fbbf24', left: '10%', transform: 'translateY(-50%)' }}></div>
          <div className="animate-road-marking" style={{ position: 'absolute', top: '70%', width: '60px', height: '8px', backgroundColor: '#fbbf24', left: '30%', transform: 'translateY(-50%)', animationDelay: '0.3s' }}></div>
        </div>
        
        {/* Animated Vehicles */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden' }}>
          {/* Bus moving right */}
          <div className="animate-car-right" style={{ 
            position: 'absolute', 
            top: '20%', 
            width: '60px', 
            height: '30px', 
            backgroundColor: '#3b82f6', 
            borderRadius: '4px', 
            animationDelay: '2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}>🚌</div>
          
          {/* Train moving left */}
          <div className="animate-car-left" style={{ 
            position: 'absolute', 
            top: '60%', 
            width: '80px', 
            height: '25px', 
            backgroundColor: '#10b981', 
            borderRadius: '4px',
            animationDelay: '5s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px'
          }}>🚊</div>
          
          {/* Another bus */}
          <div className="animate-car-right" style={{ 
            position: 'absolute', 
            top: '35%', 
            width: '55px', 
            height: '28px', 
            backgroundColor: '#f59e0b', 
            borderRadius: '4px',
            animationDelay: '8s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px'
          }}>🚐</div>
        </div>
        
        {/* Traffic Lights */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="animate-light-blink" style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#374151', borderRadius: '50%' }}></div>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#374151', borderRadius: '50%' }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ 
        backgroundColor: currentThemeStyles.navBg, 
        backdropFilter: 'blur(12px)', 
        borderBottom: currentThemeStyles.glassPanelBorder, 
        padding: '1rem 0', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/sysadmin/devices" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Devices</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GlobeAltIcon width={24} height={24} color="#06b6d4" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Advanced GPS Monitor</h1>
              {simulationStatus && (
                <span style={{ 
                  fontSize: '0.875rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  color: 'white',
                  backgroundColor: simulationStatus.isRunning ? '#10B981' : '#6B7280'
                }}>
                  {simulationStatus.isRunning ? '🟢 Simulation Active' : '⭕ Simulation Stopped'}
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <ThemeSwitcher />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)} 
                style={{ accentColor: '#3b82f6' }}
              />
              Auto Refresh (5s)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showSimulationData} 
                onChange={(e) => setShowSimulationData(e.target.checked)} 
                style={{ accentColor: '#10B981' }}
              />
              Show Simulation Data
            </label>

            <div style={{ display: 'flex', backgroundColor: 'rgba(51, 65, 85, 0.8)', borderRadius: '0.5rem', padding: '0.25rem' }}>
              {(['grid', 'map', 'hybrid'] as ViewMode[]).map((mode) => (
                <button 
                  key={mode} 
                  onClick={() => setViewMode(mode)} 
                  style={{
                    backgroundColor: viewMode === mode ? '#3b82f6' : 'transparent',
                    color: viewMode === mode ? 'white' : '#94a3b8',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {mode === 'grid' ? <ViewColumnsIcon width={16} height={16} /> : 
                   mode === 'map' ? <MapIcon width={16} height={16} /> : 
                   <GlobeAltIcon width={16} height={16} />}
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        {/* Stats Overview */}
        <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[ 
            { label: 'Total Devices', value: deviceCounts.total, icon: DevicePhoneMobileIcon, color: '#3b82f6' },
            { label: showSimulationData ? 'GPS Vehicles' : 'Online', value: showSimulationData ? deviceCounts.simulationVehicles : deviceCounts.online, icon: CheckCircleIcon, color: '#10b981' },
            { label: 'Offline', value: deviceCounts.offline, icon: XCircleIcon, color: '#ef4444' },
            { label: 'Active Alerts', value: deviceCounts.alerts, icon: ExclamationTriangleIcon, color: '#f59e0b' },
            ...(simulationStatus ? [{ label: 'Sim Speed', value: `${simulationStatus.speedMultiplier}x`, icon: GlobeAltIcon, color: '#8B5CF6' }] : [])
          ].map((metric, index) => (
            <div key={metric.label} style={{ 
              backgroundColor: currentThemeStyles.glassPanelBg, 
              padding: '1.5rem', 
              borderRadius: '0.75rem', 
              boxShadow: currentThemeStyles.glassPanelShadow, 
              backdropFilter: 'blur(12px)', 
              border: currentThemeStyles.glassPanelBorder,
              animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <metric.icon width={32} height={32} color={metric.color} />
                <div>
                  <h3 style={{ color: metric.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>{metric.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simulation Controls */}
        {simulationStatus && (
          <div className="animate-fade-in-up" style={{ 
            backgroundColor: currentThemeStyles.glassPanelBg, 
            backdropFilter: 'blur(12px)', 
            padding: '1.5rem', 
            borderRadius: '0.75rem', 
            border: currentThemeStyles.glassPanelBorder, 
            marginBottom: '2rem',
            animationDelay: '0.2s'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: '1.1rem' }}>GPS Simulation Control:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => controlSimulation(simulationStatus.isRunning ? 'stop' : 'start')} 
                  style={{
                    backgroundColor: simulationStatus.isRunning ? '#ef4444' : '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {simulationStatus.isRunning ? '⏹️ Stop Simulation' : '▶️ Start Simulation'}
                </button>
                <select 
                  onChange={(e) => controlSimulation('speed', parseFloat(e.target.value))} 
                  value={simulationStatus.speedMultiplier} 
                  style={{
                    padding: '0.5rem',
                    border: currentThemeStyles.inputBorder,
                    borderRadius: '0.375rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="0.5">0.5x Speed</option>
                  <option value="1">1x Normal</option>
                  <option value="2">2x Fast</option>
                  <option value="5">5x Very Fast</option>
                </select>
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                  {simulationStatus.vehicleCount} vehicles • {simulationStatus.routes} routes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-in-up" style={{ 
          backgroundColor: currentThemeStyles.glassPanelBg, 
          backdropFilter: 'blur(12px)', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          border: currentThemeStyles.glassPanelBorder, 
          marginBottom: '2rem',
          animationDelay: '0.3s'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FunnelIcon width={20} height={20} color={currentThemeStyles.textSecondary} />
              <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>Filters:</span>
            </div>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <MagnifyingGlassIcon width={20} height={20} color={currentThemeStyles.textMuted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search devices..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '0.5rem',
                  border: currentThemeStyles.inputBorder,
                  backgroundColor: currentThemeStyles.inputBg,
                  color: currentThemeStyles.textPrimary,
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: currentThemeStyles.inputBorder,
                backgroundColor: currentThemeStyles.inputBg,
                color: currentThemeStyles.textPrimary,
                fontSize: '1rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: currentThemeStyles.inputBorder,
                backgroundColor: currentThemeStyles.inputBg,
                color: currentThemeStyles.textPrimary,
                fontSize: '1rem'
              }}
            >
              <option value="all">All Types</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
            </select>
          </div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
            Showing {displayData.length} {showSimulationData ? 'simulation vehicles' : 'devices'} • Updated {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'map' ? (
          /* Map View Only */
          <div className="animate-fade-in-up" style={{ 
            backgroundColor: currentThemeStyles.glassPanelBg, 
            backdropFilter: 'blur(12px)', 
            borderRadius: '0.75rem', 
            border: currentThemeStyles.glassPanelBorder, 
            overflow: 'hidden',
            height: '70vh',
            animationDelay: '0.4s'
          }}>
            <AdvancedMap 
              vehicles={vehicles} 
              selectedVehicle={selectedVehicle} 
              onVehicleSelect={setSelectedVehicle} 
              height="70vh" 
              showControls={true} 
            />
          </div>
        ) : viewMode === 'hybrid' ? (
          /* Hybrid View - Map + Grid */
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: '70vh', animationDelay: '0.4s' }}>
            <div style={{ 
              backgroundColor: currentThemeStyles.glassPanelBg, 
              backdropFilter: 'blur(12px)', 
              borderRadius: '0.75rem', 
              border: currentThemeStyles.glassPanelBorder, 
              overflow: 'hidden'
            }}>
              <AdvancedMap 
                vehicles={vehicles} 
                selectedVehicle={selectedVehicle} 
                onVehicleSelect={setSelectedVehicle} 
                height="70vh" 
                showControls={true} 
              />
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {displayData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(showSimulationData ? vehicles : filteredDevices).slice(0, 10).map((item, index) => {
                    if (!item) return null;
                    const isVehicle = 'operationalInfo' in item; 
                    const device = item as Device; 
                    const vehicle = item as VehicleLocation;
                    return (
                      <div 
                        key={item._id || Math.random()} 
                        onClick={() => isVehicle && setSelectedVehicle(selectedVehicle === vehicle.vehicleId ? null : vehicle.vehicleId)} 
                        style={{
                          backgroundColor: currentThemeStyles.glassPanelBg,
                          backdropFilter: 'blur(12px)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: isVehicle && selectedVehicle === vehicle.vehicleId ? '2px solid #3B82F6' : currentThemeStyles.glassPanelBorder,
                          cursor: isVehicle ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ 
                              color: currentThemeStyles.textPrimary, 
                              fontSize: '1rem', 
                              fontWeight: 'bold', 
                              margin: '0 0 0.25rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {isVehicle ? (vehicle.vehicleId?.includes('TRAIN') ? '🚊' : '🚌') : <TruckIcon width={16} height={16} />}
                              {isVehicle ? (vehicle.vehicleNumber || 'Unknown') : (device.vehicleNumber || 'Unknown')}
                              {isVehicle && selectedVehicle === vehicle.vehicleId && <span style={{ fontSize: '0.875rem', color: '#3B82F6' }}>📍</span>}
                            </h4>
                            <p style={{ 
                              color: currentThemeStyles.textSecondary, 
                              fontSize: '0.875rem', 
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {isVehicle ? 
                                `${vehicle.operationalInfo?.driverInfo?.driverName || 'Unknown'} • Speed: ${vehicle.location?.speed?.toFixed(1) || '0'} km/h` : 
                                `${device.assignedTo?.name || 'Unassigned'} • ${device.vehicleType || 'Unknown'}`
                              }
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isVehicle ? (
                              <span style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: '500', 
                                textTransform: 'capitalize',
                                color: vehicle.operationalInfo?.status === 'on_route' ? '#10B981' : 
                                       vehicle.operationalInfo?.status === 'delayed' ? '#F59E0B' : '#6B7280'
                              }}>
                                {vehicle.operationalInfo?.status?.replace('_', ' ') || 'Unknown'}
                              </span>
                            ) : (
                              <>
                                <span style={{ color: getStatusColor(device.status || 'offline') }}>{getStatusIcon(device.status || 'offline')}</span>
                                <span style={{ 
                                  color: getStatusColor(device.status || 'offline'), 
                                  fontSize: '0.75rem', 
                                  textTransform: 'capitalize' 
                                }}>{device.status || 'offline'}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isVehicle && (
                          <div style={{ 
                            marginTop: '0.5rem', 
                            display: 'flex', 
                            gap: '1rem', 
                            fontSize: '0.75rem', 
                            color: currentThemeStyles.textSecondary 
                          }}>
                            <span>Load: {vehicle.passengerLoad?.loadPercentage?.toFixed(0) || '0'}%</span>
                            <span>Progress: {vehicle.routeProgress?.progressPercentage?.toFixed(0) || '0'}%</span>
                            {(vehicle.operationalInfo?.delays?.currentDelay || 0) > 0 && 
                              <span style={{ color: '#F59E0B' }}>+{vehicle.operationalInfo.delays.currentDelay}min</span>
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: currentThemeStyles.glassPanelBg, 
                  backdropFilter: 'blur(12px)', 
                  padding: '3rem', 
                  borderRadius: '0.75rem', 
                  border: currentThemeStyles.glassPanelBorder, 
                  textAlign: 'center' 
                }}>
                  <DevicePhoneMobileIcon width={48} height={48} color={currentThemeStyles.textMuted} style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>No data found</h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>Try adjusting your filters or starting the simulation</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View Only */
          <div className="animate-fade-in-up" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem',
            animationDelay: '0.4s'
          }}>
            {(showSimulationData ? vehicles : filteredDevices).map((item, index) => {
              if (!item) return null;
              const isVehicle = 'operationalInfo' in item; 
              const device = item as Device; 
              const vehicle = item as VehicleLocation;
              return (
                <div 
                  key={item._id || Math.random()} 
                  onClick={() => isVehicle && setSelectedVehicle(selectedVehicle === vehicle.vehicleId ? null : vehicle.vehicleId)} 
                  style={{
                    backgroundColor: currentThemeStyles.glassPanelBg,
                    backdropFilter: 'blur(12px)',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: isVehicle && selectedVehicle === vehicle.vehicleId ? '2px solid #3B82F6' : currentThemeStyles.glassPanelBorder,
                    boxShadow: currentThemeStyles.glassPanelShadow,
                    cursor: isVehicle ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    animation: `fade-in-up 0.6s ease-out ${index * 0.05}s both`
                  }}
                  onMouseEnter={(e) => {
                    if (!isVehicle) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isVehicle) {
                      e.currentTarget.style.borderColor = currentThemeStyles.glassPanelBorder.includes('#') ? currentThemeStyles.glassPanelBorder.split(' ')[3] : 'rgba(251, 191, 36, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Device/Vehicle Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ 
                        color: currentThemeStyles.textPrimary, 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {isVehicle ? (vehicle.vehicleId?.includes('TRAIN') ? '🚊' : '🚌') : (device.deviceId || 'Unknown')}
                        {isVehicle ? (vehicle.vehicleNumber || 'Unknown') : (device.vehicleNumber || 'Unknown')}
                        {isVehicle && selectedVehicle === vehicle.vehicleId && <span style={{ fontSize: '0.875rem', color: '#3B82F6' }}>📍 Selected</span>}
                      </h3>
                      <p style={{ 
                        color: currentThemeStyles.textSecondary, 
                        fontSize: '0.875rem', 
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <TruckIcon width={14} height={14} />
                        {isVehicle ? 
                          `${vehicle.operationalInfo?.driverInfo?.driverName || 'Unknown'} • Speed: ${vehicle.location?.speed?.toFixed(1) || '0'} km/h` : 
                          `${device.vehicleNumber || 'Unknown'} • ${device.vehicleType || 'Unknown'}`
                        }
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isVehicle ? (
                        <span style={{ 
                          fontSize: '0.875rem',
                          fontWeight: '500', 
                          textTransform: 'capitalize',
                          color: vehicle.operationalInfo?.status === 'on_route' ? '#10B981' : 
                                 vehicle.operationalInfo?.status === 'delayed' ? '#F59E0B' : '#6B7280'
                        }}>
                          {vehicle.operationalInfo?.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      ) : (
                        <>
                          <span style={{ color: getStatusColor(device.status || 'offline') }}>{getStatusIcon(device.status || 'offline')}</span>
                          <span style={{ 
                            color: getStatusColor(device.status || 'offline'), 
                            fontSize: '0.75rem', 
                            textTransform: 'capitalize' 
                          }}>{device.status || 'offline'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  {isVehicle ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#3B82F6', fontSize: '0.875rem', fontWeight: '600' }}>{vehicle.location?.speed?.toFixed(1) || '0'}</div>
                        <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>km/h</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: (vehicle.passengerLoad?.loadPercentage || 0) > 80 ? '#EF4444' : '#10B981', 
                          fontSize: '0.875rem', 
                          fontWeight: '600' 
                        }}>
                          {vehicle.passengerLoad?.loadPercentage?.toFixed(0) || '0'}%
                        </div>
                        <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Load</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#8B5CF6', fontSize: '0.875rem', fontWeight: '600' }}>{vehicle.routeProgress?.progressPercentage?.toFixed(0) || '0'}%</div>
                        <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Progress</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <BoltIcon width={20} height={20} color={getBatteryColor(device.batteryLevel || 0)} style={{ margin: '0 auto 0.25rem' }} />
                        <div style={{ color: getBatteryColor(device.batteryLevel || 0), fontSize: '0.875rem', fontWeight: '600' }}>{device.batteryLevel || 0}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <SignalIcon width={20} height={20} color="#10b981" style={{ margin: '0 auto 0.25rem' }} />
                        <div style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>{device.signalStrength || 0}/5</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <ExclamationTriangleIcon width={20} height={20} color={(device.alerts?.count || 0) > 0 ? '#f59e0b' : '#6b7280'} style={{ margin: '0 auto 0.25rem' }} />
                        <div style={{ 
                          color: (device.alerts?.count || 0) > 0 ? '#f59e0b' : '#6b7280', 
                          fontSize: '0.875rem', 
                          fontWeight: '600' 
                        }}>{device.alerts?.count || 0}</div>
                      </div>
                    </div>
                  )}

                  {/* Location Info */}
                  <div style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(249, 250, 251, 0.8)', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <MapPinIcon width={14} height={14} color={currentThemeStyles.textMuted} />
                      <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Location</span>
                    </div>
                    <p style={{ 
                      color: currentThemeStyles.textPrimary, 
                      fontSize: '0.875rem', 
                      margin: 0, 
                      lineHeight: '1.4' 
                    }}>
                      {isVehicle ? 
                        `${vehicle.location?.latitude?.toFixed(4) || '0'}, ${vehicle.location?.longitude?.toFixed(4) || '0'}` : 
                        (device.location?.address || 'Unknown location')
                      }
                    </p>
                    <p style={{ 
                      color: currentThemeStyles.textMuted, 
                      fontSize: '0.75rem', 
                      margin: '0.25rem 0 0 0' 
                    }}>
                      Updated {isVehicle ? getTimeSince(vehicle.timestamp || new Date().toISOString()) : getTimeSince(device.location?.lastUpdated || new Date().toISOString())}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link 
                      href={`/sysadmin/devices/${item._id}`} 
                      style={{
                        flex: 1,
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <EyeIcon width={14} height={14} />View Details
                    </Link>
                    <button 
                      onClick={() => window.open(`https://maps.google.com/?q=${isVehicle ? (vehicle.location?.latitude || 0) : (device.location?.latitude || 0)},${isVehicle ? (vehicle.location?.longitude || 0) : (device.location?.longitude || 0)}`, '_blank')} 
                      style={{
                        backgroundColor: '#374151',
                        color: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <MapPinIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {displayData.length === 0 && !loading && (
          <div className="animate-fade-in-up" style={{ 
            backgroundColor: currentThemeStyles.glassPanelBg, 
            backdropFilter: 'blur(12px)', 
            padding: '3rem', 
            borderRadius: '0.75rem', 
            border: currentThemeStyles.glassPanelBorder, 
            textAlign: 'center',
            animationDelay: '0.4s'
          }}>
            <DevicePhoneMobileIcon width={48} height={48} color={currentThemeStyles.textMuted} style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              No {showSimulationData ? 'simulation vehicles' : 'devices'} found
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
              {showSimulationData ? 'Start the GPS simulation to see vehicles' : 'Try adjusting your search criteria or filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}