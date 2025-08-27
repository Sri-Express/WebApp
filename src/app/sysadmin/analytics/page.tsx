// src/app/sysadmin/analytics/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT

// --- Interfaces (Unchanged) ---
interface AnalyticsData {
  overview: { totalUsers: number; activeUsers: number; totalDevices: number; activeDevices: number; totalTrips: number; totalRevenue: number; systemUptime: number; avgResponseTime: number; };
  trends: { userGrowth: number; deviceGrowth: number; tripGrowth: number; revenueGrowth: number; };
  chartData: { userRegistrations: Array<{ date: string; count: number; }>; deviceActivity: Array<{ date: string; online: number; offline: number; }>; tripVolume: Array<{ date: string; trips: number; revenue: number; }>; systemPerformance: Array<{ date: string; uptime: number; responseTime: number; }>; };
  topMetrics: { topRoutes: Array<{ name: string; trips: number; revenue: number; }>; deviceTypes: Array<{ type: string; count: number; percentage: number; }>; userActivity: Array<{ role: string; count: number; percentage: number; }>; alerts: Array<{ type: string; count: number; severity: 'high' | 'medium' | 'low'; }>; };
}
type TimePeriod = '24h' | '7d' | '30d' | '90d';
type MetricType = 'users' | 'devices' | 'trips' | 'revenue' | 'performance';

export default function SystemAnalyticsPage() {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('users');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // --- Data Fetching and Logic (Unchanged) ---
  const loadAnalyticsData = async () => {
    try {
      const mockData: AnalyticsData = {
        overview: { totalUsers: 1547, activeUsers: 1432, totalDevices: 89, activeDevices: 67, totalTrips: 12749, totalRevenue: 2847650, systemUptime: 99.8, avgResponseTime: 145 },
        trends: { userGrowth: 12.3, deviceGrowth: 8.7, tripGrowth: 15.4, revenueGrowth: 18.9 },
        chartData: { userRegistrations: [ { date: '2025-01-10', count: 23 }, { date: '2025-01-11', count: 45 }, { date: '2025-01-12', count: 32 }, { date: '2025-01-13', count: 67 }, { date: '2025-01-14', count: 54 }, { date: '2025-01-15', count: 78 }, { date: '2025-01-16', count: 89 }, { date: '2025-01-17', count: 92 } ], deviceActivity: [ { date: '2025-01-10', online: 56, offline: 33 }, { date: '2025-01-11', online: 61, offline: 28 }, { date: '2025-01-12', online: 58, offline: 31 }, { date: '2025-01-13', online: 64, offline: 25 }, { date: '2025-01-14', online: 67, offline: 22 }, { date: '2025-01-15', online: 63, offline: 26 }, { date: '2025-01-16', online: 69, offline: 20 }, { date: '2025-01-17', online: 67, offline: 22 } ], tripVolume: [ { date: '2025-01-10', trips: 145, revenue: 65400 }, { date: '2025-01-11', trips: 189, revenue: 84200 }, { date: '2025-01-12', trips: 167, revenue: 74800 }, { date: '2025-01-13', trips: 203, revenue: 91350 }, { date: '2025-01-14', trips: 178, revenue: 79900 }, { date: '2025-01-15', trips: 234, revenue: 105300 }, { date: '2025-01-16', trips: 198, revenue: 89100 }, { date: '2025-01-17', trips: 156, revenue: 70200 } ], systemPerformance: [ { date: '2025-01-10', uptime: 99.9, responseTime: 134 }, { date: '2025-01-11', uptime: 99.8, responseTime: 156 }, { date: '2025-01-12', uptime: 99.7, responseTime: 142 }, { date: '2025-01-13', uptime: 99.9, responseTime: 128 }, { date: '2025-01-14', uptime: 99.8, responseTime: 167 }, { date: '2025-01-15', uptime: 99.6, responseTime: 189 }, { date: '2025-01-16', uptime: 99.9, responseTime: 145 }, { date: '2025-01-17', uptime: 99.8, responseTime: 152 } ] },
        topMetrics: { topRoutes: [ { name: 'Colombo - Kandy', trips: 2847, revenue: 1278300 }, { name: 'Galle - Colombo', trips: 2156, revenue: 969400 }, { name: 'Kandy - Jaffna', trips: 1789, revenue: 804050 }, { name: 'Colombo - Negombo', trips: 1543, revenue: 693850 }, { name: 'Anuradhapura - Colombo', trips: 1234, revenue: 555300 } ], deviceTypes: [ { type: 'Bus', count: 67, percentage: 75.3 }, { type: 'Train', count: 22, percentage: 24.7 } ], userActivity: [ { role: 'Client', count: 1398, percentage: 90.4 }, { role: 'Route Admin', count: 45, percentage: 2.9 }, { role: 'Company Admin', count: 8, percentage: 0.5 }, { role: 'Customer Service', count: 12, percentage: 0.8 }, { role: 'System Admin', count: 3, percentage: 0.2 } ], alerts: [ { type: 'Device Offline', count: 15, severity: 'high' }, { type: 'High Response Time', count: 8, severity: 'medium' }, { type: 'Low Battery', count: 23, severity: 'medium' }, { type: 'Maintenance Due', count: 7, severity: 'low' }, { type: 'Route Delay', count: 12, severity: 'medium' } ] }
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadAnalyticsData();
      setLoading(false);
    };
    initialLoad();
  }, [selectedPeriod]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 300000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedPeriod]);

  const formatNumber = (num: number) => { if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`; if (num >= 1000) return `${(num / 1000).toFixed(1)}K`; return num.toLocaleString(); };
  const formatCurrency = (amount: number) => `LKR ${(amount / 1000).toFixed(0)}K`;
  const getTrendColor = (value: number) => value >= 0 ? '#10b981' : '#ef4444';
  const getTrendIcon = (value: number) => value >= 0 ? <ArrowUpIcon width={16} height={16} /> : <ArrowDownIcon width={16} height={16} />;
  const getSeverityColor = (severity: string) => ({ high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }[severity] || '#6b7280');
  const handleExportData = () => alert('Export functionality would download analytics data as CSV/PDF');
  const handleRefresh = async () => { setLoading(true); await loadAnalyticsData(); setLoading(false); };

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

  if (loading && !analyticsData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary }}>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #334155', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/sysadmin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>← Dashboard</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChartBarIcon width={24} height={24} color="#ef4444" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>System Analytics</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)} style={{ backgroundColor: '#334155', color: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #475569', outline: 'none' }}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button onClick={handleExportData} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <DocumentArrowDownIcon width={16} height={16} /> Export
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Total Users</h3>
                <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData ? formatNumber(analyticsData.overview.totalUsers) : '0'}</div>
              </div>
              <UsersIcon width={24} height={24} color="#3b82f6" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getTrendColor(analyticsData?.trends.userGrowth || 0) }}>
              {getTrendIcon(analyticsData?.trends.userGrowth || 0)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{analyticsData?.trends.userGrowth.toFixed(1)}% this period</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Active Devices</h3>
                <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData ? formatNumber(analyticsData.overview.activeDevices) : '0'}</div>
              </div>
              <DevicePhoneMobileIcon width={24} height={24} color="#10b981" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getTrendColor(analyticsData?.trends.deviceGrowth || 0) }}>
              {getTrendIcon(analyticsData?.trends.deviceGrowth || 0)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{analyticsData?.trends.deviceGrowth.toFixed(1)}% this period</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Total Trips</h3>
                <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData ? formatNumber(analyticsData.overview.totalTrips) : '0'}</div>
              </div>
              <TruckIcon width={24} height={24} color="#f59e0b" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getTrendColor(analyticsData?.trends.tripGrowth || 0) }}>
              {getTrendIcon(analyticsData?.trends.tripGrowth || 0)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{analyticsData?.trends.tripGrowth.toFixed(1)}% this period</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Total Revenue</h3>
                <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData ? formatCurrency(analyticsData.overview.totalRevenue) : 'LKR 0'}</div>
              </div>
              <ChartBarIcon width={24} height={24} color="#8b5cf6" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getTrendColor(analyticsData?.trends.revenueGrowth || 0) }}>
              {getTrendIcon(analyticsData?.trends.revenueGrowth || 0)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{analyticsData?.trends.revenueGrowth.toFixed(1)}% this period</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Trend Analysis</h2>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as MetricType)} style={{ backgroundColor: '#334155', color: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #475569', outline: 'none' }}>
              <option value="users">User Registrations</option>
              <option value="devices">Device Activity</option>
              <option value="trips">Trip Volume</option>
              <option value="revenue">Revenue</option>
              <option value="performance">System Performance</option>
            </select>
          </div>
          <div style={{ backgroundColor: '#334155', borderRadius: '0.5rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <ChartBarIcon width={64} height={64} color="#94a3b8" />
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>Interactive Charts</h3>
              <p style={{ margin: 0 }}>Chart visualization for {selectedMetric} over {selectedPeriod}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Integration with Chart.js or Recharts coming soon</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Top Routes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData?.topMetrics.topRoutes.map((route, index) => (
                <div key={route.name} style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.25rem' }}>#{index + 1} {route.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{route.trips.toLocaleString()} trips</div>
                  </div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(route.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Device Distribution</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData?.topMetrics.deviceTypes.map((device) => (
                <div key={device.type} style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{device.type}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{device.count} ({device.percentage}%)</span>
                  </div>
                  <div style={{ backgroundColor: '#1e293b', borderRadius: '0.25rem', height: '6px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: device.type === 'Bus' ? '#f59e0b' : '#3b82f6', height: '100%', width: `${device.percentage}%`, borderRadius: '0.25rem' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>User Roles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData?.topMetrics.userActivity.map((user) => (
                <div key={user.role} style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{user.role}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{user.count.toLocaleString()} ({user.percentage}%)</span>
                  </div>
                  <div style={{ backgroundColor: '#1e293b', borderRadius: '0.25rem', height: '6px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#10b981', height: '100%', width: `${user.percentage}%`, borderRadius: '0.25rem' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Alert Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData?.topMetrics.alerts.map((alert) => (
                <div key={alert.type} style={{ backgroundColor: '#334155', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${getSeverityColor(alert.severity)}` }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.25rem' }}>{alert.type}</div>
                    <div style={{ color: getSeverityColor(alert.severity), fontSize: '0.875rem', textTransform: 'capitalize', fontWeight: '500' }}>{alert.severity} Priority</div>
                  </div>
                  <div style={{ backgroundColor: getSeverityColor(alert.severity), color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>{alert.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #334155', marginTop: '2rem' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>System Performance Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#334155', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData?.overview.systemUptime}%</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>System Uptime</div>
            </div>
            <div style={{ backgroundColor: '#334155', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>{analyticsData?.overview.avgResponseTime}ms</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Avg Response Time</div>
            </div>
            <div style={{ backgroundColor: '#334155', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}>{((analyticsData?.overview.activeUsers || 0) / (analyticsData?.overview.totalUsers || 1) * 100).toFixed(1)}%</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>User Activity Rate</div>
            </div>
            <div style={{ backgroundColor: '#334155', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold' }}>{((analyticsData?.overview.activeDevices || 0) / (analyticsData?.overview.totalDevices || 1) * 100).toFixed(1)}%</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Device Online Rate</div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <InformationCircleIcon width={20} height={20} color="#3b82f6" />
            <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Analytics Information</h3>
          </div>
          <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
            Analytics data is processed in real-time and updated every 5 minutes. Historical data is retained for 365 days for trend analysis. Export functionality allows you to download detailed reports in CSV or PDF format for further analysis and reporting.
          </p>
        </div>
      </div>
    </div>
  );
}
