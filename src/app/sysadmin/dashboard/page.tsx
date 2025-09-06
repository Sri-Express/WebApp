//src/app/sysadmin/dashboard/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UsersIcon, DevicePhoneMobileIcon, TruckIcon, CpuChipIcon, ChartBarIcon, ExclamationTriangleIcon, ShieldCheckIcon, GlobeAltIcon, ServerIcon, CheckCircleIcon, BellIcon, MapIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API utility functions
const fetchAPI = async (endpoint: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// --- Interfaces (Unchanged) ---
interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  totalAlerts: number;
  totalTrips: number;
  todayTrips: number;
  systemUptime: number;
  apiRequests: number;
  errorRate: number;
  recentActivity: { newUsers: number; newTrips: number; };
  usersByRole: { system_admin: number; route_admin: number; client: number; };
  devicesByStatus: { online: number; offline: number; maintenance: number; };
}
interface FleetStats { total: number; approved: number; pending: number; rejected: number; suspended: number; }
interface Alert { id: string; type: 'warning' | 'error' | 'info'; category: string; title: string; message: string; timestamp: string; priority: 'low' | 'medium' | 'high'; }

export default function SriExpressAdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // --- State Management (Unchanged) ---
  const [user] = useState({ name: 'Mehara Rothila', email: 'admin@sriexpress.lk', role: 'system_admin' });
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // --- Data Fetching (Unchanged) ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [systemStatsData, fleetStatsData, alertsData] = await Promise.all([
        fetchAPI('/admin/system/stats'),
        fetchAPI('/admin/fleet/stats'),
        fetchAPI('/admin/system/alerts'),
      ]);
      setStats(systemStatsData);
      setFleetStats(fleetStatsData);
      setAlerts(alertsData.alerts || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check if the backend server is running.');
      setStats({ totalUsers: 2847, activeUsers: 1923, totalDevices: 156, activeDevices: 134, offlineDevices: 18, maintenanceDevices: 4, totalAlerts: 12, totalTrips: 8945, todayTrips: 127, systemUptime: 99.7, apiRequests: 45230, errorRate: 0.3, recentActivity: { newUsers: 23, newTrips: 89 }, usersByRole: { system_admin: 3, route_admin: 15, client: 2829 }, devicesByStatus: { online: 134, offline: 18, maintenance: 4 } });
      setFleetStats({ total: 47, approved: 41, pending: 4, rejected: 1, suspended: 1 });
      setAlerts([ { id: '1', type: 'warning', category: 'Device', title: 'Low Battery Alert', message: 'Bus LB-2847 battery at 15%', timestamp: new Date().toISOString(), priority: 'medium' }, { id: '2', type: 'error', category: 'System', title: 'API Rate Limit', message: 'High API usage detected', timestamp: new Date().toISOString(), priority: 'high' }, { id: '3', type: 'info', category: 'Fleet', title: 'New Registration', message: 'Ceylon Express submitted application', timestamp: new Date().toISOString(), priority: 'low' } ]);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadInitialData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  const quickActions = stats && fleetStats ? [ 
    { name: 'User Management', href: '/sysadmin/users', icon: UsersIcon, count: stats.totalUsers, desc: 'Manage system users' }, 
    { name: 'Vehicle Management', href: '/sysadmin/vehicles', icon: TruckIcon, count: stats.totalDevices, desc: 'Manage fleet vehicles' }, 
    { name: 'Fleet Control', href: '/sysadmin/fleet', icon: TruckIcon, count: fleetStats.pending, desc: 'Fleet approvals', urgent: fleetStats.pending > 0 }, 
    { name: 'Route Management', href: '/sysadmin/routes', icon: MapIcon, count: stats.todayTrips, desc: 'Route planning & tracking' },
    { name: 'Live Tracking', href: '/sysadmin/devices/monitor', icon: GlobeAltIcon, count: stats.activeDevices, desc: 'Vehicle monitoring' }, 
    { name: 'AI Systems', href: '/sysadmin/ai', icon: CpuChipIcon, desc: 'Neural networks' }, 
    { name: 'Analytics', href: '/sysadmin/analytics', icon: ChartBarIcon, desc: 'Data insights' }, 
    { name: 'Emergency', href: '/sysadmin/emergency', icon: ExclamationTriangleIcon, count: alerts.length, desc: 'Crisis response' } 
  ] : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/sysadmin/login');
  };

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // --- Animation styles for UI elements ---
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
  `;

  // --- Loading state ---
  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading dashboard data...</p>
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>}
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" className="sm:w-8 sm:h-8" />
            <div>
              <h1 style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)' }}><span style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginRight: '0.5rem', textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press Control</h1>
              <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#94a3b8', margin: 0 }}>System Administration Console {error && <span style={{ color: '#f59e0b' }}>⚠ Using fallback data</span>}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ThemeSwitcher />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', cursor: 'pointer' }}><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ accentColor: '#3b82f6' }} /><span className="hidden sm:inline">Auto Refresh</span></label>
            <div style={{ position: 'relative' }}><BellIcon width={20} height={20} color="#F59E0B" />{alerts.length > 0 && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '0.625rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alerts.length}</div>}</div>
            <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>SUPERUSER</div>
            <span style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', display: 'none' }} className="md:inline">Welcome, {user?.name || 'Administrator'}</span>
            <button onClick={handleLogout} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 3vw, 2rem)', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          
          {error && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', color: '#92400e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExclamationTriangleIcon width={20} height={20} color="#f59e0b" />
                <strong>Warning:</strong> {error}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                Displaying fallback data. Please check your backend server at <code>http://localhost:5000</code>
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
            {stats && [ { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: UsersIcon, color: '#3b82f6' }, { label: 'Active Devices', value: stats.activeDevices, icon: DevicePhoneMobileIcon, color: '#10b981' }, { label: 'Fleet Companies', value: fleetStats?.total || 0, icon: TruckIcon, color: '#f59e0b' }, { label: 'System Uptime', value: `${stats.systemUptime}%`, icon: ServerIcon, color: '#8b5cf6' } ].map((metric, index) => (
              <div key={metric.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
                  <metric.icon width={32} height={32} color={metric.color} style={{ minWidth: '24px', width: 'clamp(24px, 5vw, 32px)', height: 'clamp(24px, 5vw, 32px)' }} />
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <h3 style={{ color: metric.color, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>{metric.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 'bold', marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>System Controls</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
              {quickActions.map((action, index) => (
                <Link key={action.name} href={action.href} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: 'clamp(1rem, 2.5vw, 1.5rem)', borderRadius: '0.75rem', border: action.urgent ? '2px solid #f59e0b' : currentThemeStyles.quickActionBorder, transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both` }}>
                    {action.urgent && <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%', animation: 'light-blink 2s infinite' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
                      <action.icon width={24} height={24} color="#F59E0B" style={{ minWidth: '20px', width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} />
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', margin: 0 }}>{action.name}</h3>
                        <p style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', margin: '0.25rem 0 0 0' }}>{action.desc}</p>
                      </div>
                      {action.count !== undefined && (<div style={{ backgroundColor: '#F59E0B', color: 'white', padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '0.5rem', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: 'bold', minWidth: '35px', textAlign: 'center' }}>{action.count.toLocaleString()}</div>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1rem, 3vw, 1.5rem)', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ExclamationTriangleIcon width={24} height={24} color="#f59e0b" style={{ minWidth: '20px', width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} />System Alerts</h2>
              <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', flexWrap: 'wrap' }}>
                <span style={{ color: '#ef4444' }}>{alerts.filter(a => a.priority === 'high').length} High</span>
                <span style={{ color: '#f59e0b' }}>{alerts.filter(a => a.priority === 'medium').length} Medium</span>
                <span style={{ color: '#3b82f6' }}>{alerts.filter(a => a.priority === 'low').length} Low</span>
              </div>
            </div>
            {alerts.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {alerts.map((alert, index) => (
                  <div key={alert.id} style={{ backgroundColor: currentThemeStyles.alertBg, padding: 'clamp(0.75rem, 2.5vw, 1rem)', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: `4px solid ${alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`, animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontWeight: '500', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>{alert.title}</p>
                        <p style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', margin: '0.25rem 0', lineHeight: '1.4' }}>{alert.message}</p>
                        <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', color: currentThemeStyles.textMuted, flexWrap: 'wrap' }}><span>Category: {alert.category}</span><span>{new Date(alert.timestamp).toLocaleString()}</span></div>
                      </div>
                      <div style={{ backgroundColor: alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6', color: 'white', padding: 'clamp(0.25rem, 1vw, 0.25rem) clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '0.25rem', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{alert.priority}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: currentThemeStyles.textSecondary }}>
                <CheckCircleIcon width={48} height={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <p style={{ margin: 0 }}>No active alerts - All systems operational</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}