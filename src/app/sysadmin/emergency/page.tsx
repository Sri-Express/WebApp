// src/app/sysadmin/emergency/page.tsx - UPDATED VERSION WITH NEW RECIPIENT OPTIONS
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon, SpeakerWaveIcon, UserGroupIcon, BellAlertIcon,
  PlusIcon, ShieldExclamationIcon, FireIcon, TruckIcon, HeartIcon,
  CloudIcon, WifiIcon, SpeakerXMarkIcon, XMarkIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import RealTimeEmergencyClient, { EmergencyAlert, useEmergencyAlerts, useEmergencyContext } from '../../components/RealTimeEmergencyClient';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

// Interfaces
interface EmergencyIncident {
  _id: string; incidentId: string; type: 'accident' | 'breakdown' | 'security' | 'medical' | 'weather' | 'system' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low'; status: 'active' | 'responded' | 'resolved' | 'closed';
  title: string; description: string;
  location: { latitude: number; longitude: number; address: string; deviceId?: string; vehicleNumber?: string; };
  reportedBy: { name: string; role: string; };
  assignedTeam?: { teamName: string; responseTime?: string; };
  createdAt: string; escalationLevel: number;
}
interface EmergencyDashboard {
  overview: { totalEmergencies: number; activeEmergencies: number; resolvedToday: number; criticalCount: number; };
  statistics: { byPriority: Record<string, number>; byType: Record<string, number>; averageResponseTime: number; averageResolutionTime: number; };
  alerts: { deviceAlerts: number; offlineDevices: number; escalatedEmergencies: number; };
  recentEmergencies: EmergencyIncident[]; criticalEmergencies: EmergencyIncident[];
  realTimeStatus?: { connectedUsers: number; websocketActive: boolean; };
}
interface EmergencyTeam {
  teamId: string; teamName: string;
  members: { name: string; role: string; contactNumber: string; }[];
  statistics: { assignedIncidents: number; activeIncidents: number; resolvedIncidents: number; status: 'available' | 'busy'; };
}
interface EmergencyStatusPayload {
  activeCount: number;
  criticalCount: number;
}
type Priority = 'low' | 'medium' | 'high' | 'critical';

function EmergencyPageContent() {
  const router = useRouter();
  const { theme } = useTheme();

  const [dashboardData, setDashboardData] = useState<EmergencyDashboard | null>(null);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [teams, setTeams] = useState<EmergencyTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [creating, setCreating] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  const { alerts: realtimeAlerts, unreadCount, criticalCount, markAsRead } = useEmergencyAlerts();
  const { socket, connectionStatus: realtimeConnection } = useEmergencyContext();
  const shownNotificationsRef = useRef(new Set());

  const [alertForm, setAlertForm] = useState({ type: 'system', priority: 'medium', title: '', description: '', latitude: '', longitude: '', address: '', severity: 'medium' });
  const [broadcastForm, setBroadcastForm] = useState({ message: '', recipients: 'all', method: 'system', priority: 'high' });

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/sysadmin/login'); return null; }
    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (!baseURL.endsWith('/api')) baseURL += '/api';
    const fullURL = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    try {
      const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers } });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; }
        const errorText = await response.text(); throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      let errorMessage = error instanceof Error ? error.message : 'An unknown API error occurred.';
      if (errorMessage.includes('Failed to fetch')) errorMessage = 'Network error: Failed to fetch. Is the backend server running?';
      setApiErrors(prev => [...new Set([...prev, errorMessage])]);
      return null;
    }
  }, [router]);

  const loadData = useCallback(async () => {
    if (!dashboardData) setLoading(true);
    try {
      const [dashboardResponse, incidentsResponse, teamsResponse] = await Promise.all([
        apiCall('/admin/emergency'), apiCall('/admin/emergency/incidents?limit=20'), apiCall('/admin/emergency/teams')
      ]);
      if (dashboardResponse) setDashboardData(dashboardResponse);
      if (incidentsResponse) setIncidents(incidentsResponse.incidents || []);
      if (teamsResponse) setTeams(teamsResponse.teams || []);
    } catch (error) { console.error('Error loading emergency data:', error); } finally { setLoading(false); }
  }, [apiCall, dashboardData]);

  useEffect(() => { loadData(); }, [loadData]);

  const showInAppNotification = useCallback((alert: EmergencyAlert) => {
    if (shownNotificationsRef.current.has(alert.id)) return;
    shownNotificationsRef.current.add(alert.id);

    const notification = document.createElement('div');
    notification.style.cssText = `position: fixed; top: 80px; right: 20px; z-index: 10000; background: ${alert.priority === 'critical' ? '#dc2626' : alert.priority === 'high' ? '#ea580c' : '#f59e0b'}; color: white; padding: 1rem 1.5rem; border-radius: 0.75rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); max-width: 400px; animation: slideIn 0.3s ease-out; cursor: pointer;`;
    notification.innerHTML = `<div style="display: flex; align-items: center; gap: 0.75rem;"><div style="font-size: 1.25rem;">🚨</div><div><div style="font-weight: 600; margin-bottom: 0.25rem;">${alert.title}</div><div style="font-size: 0.875rem; opacity: 0.9;">${alert.message}</div><div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">${new Date(alert.timestamp).toLocaleTimeString()} • Click to dismiss</div></div></div>`;
    const style = document.createElement('style');
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
    document.head.appendChild(style);
    notification.onclick = () => { notification.style.animation = 'slideOut 0.3s ease-in'; setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300); markAsRead(alert.id); };
    document.body.appendChild(notification);
    if (alert.priority !== 'critical') setTimeout(() => { if (notification.parentNode) { notification.style.animation = 'slideOut 0.3s ease-in'; setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300); } }, alert.priority === 'high' ? 15000 : 10000);
  }, [markAsRead]);

  const handleEmergencyStatusUpdate = useCallback((status: EmergencyStatusPayload) => {
    if (dashboardData) {
      setDashboardData(prev => ({ ...prev!, overview: { ...prev!.overview, activeEmergencies: status.activeCount, criticalCount: status.criticalCount } }));
    }
  }, [dashboardData]);

  useEffect(() => {
    if (socket) {
      socket.on('emergency_alert', showInAppNotification);
      socket.on('emergency_status', handleEmergencyStatusUpdate);

      return () => {
        socket.off('emergency_alert', showInAppNotification);
        socket.off('emergency_status', handleEmergencyStatusUpdate);
      };
    }
  }, [socket, showInAppNotification, handleEmergencyStatusUpdate]);

  const handleCreateAlert = async () => {
    if (!alertForm.title || !alertForm.description || !alertForm.address) { alert('Please fill in all required fields.'); return; }
    setCreating(true);
    try {
      const alertData = { ...alertForm, location: { latitude: parseFloat(alertForm.latitude) || 6.9271, longitude: parseFloat(alertForm.longitude) || 79.8612, address: alertForm.address } };
      const response = await apiCall('/admin/emergency/alert', { method: 'POST', body: JSON.stringify(alertData) });
      if (response) {
        setShowCreateAlert(false); setAlertForm({ type: 'system', priority: 'medium', title: '', description: '', latitude: '', longitude: '', address: '', severity: 'medium' });
        showInAppNotification({ id: 'alert_success', type: 'emergency_created', title: 'Emergency Alert Created', message: `Alert "${response.emergency?.title}" created`, priority: alertData.priority as Priority, timestamp: new Date(), recipients: ['all'] });
        setTimeout(() => loadData(), 1000);
      } else { throw new Error('Failed to create alert'); }
    } catch (error) { alert(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`); } finally { setCreating(false); }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.message) { alert('Please enter a broadcast message'); return; }
    setBroadcasting(true);
    try {
      const response = await apiCall('/admin/emergency/broadcast', { method: 'POST', body: JSON.stringify(broadcastForm) });
      if (response) {
        setShowBroadcast(false); setBroadcastForm({ message: '', recipients: 'all', method: 'system', priority: 'high' });
        showInAppNotification({ id: 'broadcast_success', type: 'broadcast', title: 'Broadcast Sent', message: `Delivered to ${response.broadcast?.recipientCount || 'all'} users`, priority: 'medium', timestamp: new Date(), recipients: ['all'] });
      } else { throw new Error('Failed to send broadcast'); }
    } catch (error) { showInAppNotification({ id: 'broadcast_error', type: 'critical_alert', title: 'Broadcast Failed', message: error instanceof Error ? error.message : 'Unknown error', priority: 'high', timestamp: new Date(), recipients: ['all'] }); } finally { setBroadcasting(false); }
  };

  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)', inputBg: 'rgba(249, 250, 251, 0.7)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)', inputBg: 'rgba(51, 65, 85, 0.7)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } @keyframes connecting-rod { 0% { transform: translateX(-1px) rotate(0deg); } 50% { transform: translateX(1px) rotate(180deg); } 100% { transform: translateX(-1px) rotate(360deg); } } .animate-connecting-rod { animation: connecting-rod 2s linear infinite; } @keyframes piston-move { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } } .animate-piston { animation: piston-move 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } `;

  const getTypeIcon = (type: string) => ({ accident: <ExclamationTriangleIcon width={16} height={16} />, breakdown: <TruckIcon width={16} height={16} />, security: <ShieldExclamationIcon width={16} height={16} />, medical: <HeartIcon width={16} height={16} />, weather: <CloudIcon width={16} height={16} />, system: <FireIcon width={16} height={16} /> }[type] || <ExclamationTriangleIcon width={16} height={16} />);
  const getPriorityColor = (priority: string) => ({ critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a' }[priority] || '#6b7280');
  const getStatusColor = (status: string) => ({ active: '#dc2626', responded: '#ea580c', resolved: '#16a34a', closed: '#6b7280' }[status] || '#6b7280');

  const tabs = [ { id: 'overview', name: 'Overview', icon: ExclamationTriangleIcon }, { id: 'incidents', name: 'Active Incidents', icon: BellAlertIcon }, { id: 'teams', name: 'Response Teams', icon: UserGroupIcon }, { id: 'broadcast', name: 'Emergency Broadcast', icon: SpeakerWaveIcon }, { id: 'realtime', name: `Live Alerts (${unreadCount})`, icon: WifiIcon } ];

  if (loading && !dashboardData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Emergency Management Center...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', color: currentThemeStyles.textPrimary }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/sysadmin/dashboard" style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheckIcon width={24} height={24} color="#f59e0b" /> <span>Dashboard</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
              <ExclamationTriangleIcon width={24} height={24} color="#dc2626" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Emergency Center</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', backgroundColor: realtimeConnection.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)', border: `1px solid ${realtimeConnection.connected ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'}`, color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
              <WifiIcon width={14} height={14} /> {realtimeConnection.connected ? `LIVE (${realtimeConnection.connectedUsers})` : 'Offline'}
            </div>
            {criticalCount > 0 && (
              <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.8)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', animation: 'pulse 2s infinite', border: '1px solid #ef4444' }}>
                🚨 {criticalCount} Critical
              </div>
            )}
            <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ backgroundColor: soundEnabled ? 'rgba(16, 185, 129, 0.5)' : 'rgba(107, 114, 128, 0.5)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: `1px solid ${soundEnabled ? 'rgba(16, 185, 129, 0.7)' : 'rgba(107, 114, 128, 0.7)'}`, cursor: 'pointer', backdropFilter: 'blur(8px)' }} title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}>
              {soundEnabled ? <SpeakerWaveIcon width={16} height={16} /> : <SpeakerXMarkIcon width={16} height={16} />}
            </button>
            <button onClick={() => setShowCreateAlert(true)} style={{ backgroundColor: 'rgba(220, 38, 38, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(220, 38, 38, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', backdropFilter: 'blur(8px)' }}>
              <PlusIcon width={16} height={16} /> Create Alert
            </button>
            <button onClick={() => setShowBroadcast(true)} style={{ backgroundColor: 'rgba(234, 88, 12, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(234, 88, 12, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', backdropFilter: 'blur(8px)' }}>
              <SpeakerWaveIcon width={16} height={16} /> Broadcast
            </button>
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          {dashboardData && dashboardData.overview.criticalCount > 0 && (
            <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.8)', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'pulse 2s infinite', border: '1px solid #ef4444', backdropFilter: 'blur(8px)' }}>
              <ExclamationTriangleIcon width={24} height={24} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>CRITICAL ALERT: {dashboardData.overview.criticalCount} Critical Emergency{dashboardData.overview.criticalCount > 1 ? 's' : ''} Active</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Immediate attention required. Response teams have been notified.</div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'}` }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '1rem', backgroundColor: activeTab === tab.id ? currentThemeStyles.quickActionBg : 'transparent', color: activeTab === tab.id ? currentThemeStyles.textPrimary : currentThemeStyles.textSecondary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '0.5rem 0.5rem 0 0', position: 'relative', borderBottom: activeTab === tab.id ? '2px solid #f59e0b' : '2px solid transparent', transition: 'all 0.2s ease' }}>
                  <tab.icon width={16} height={16} /> {tab.name}
                  {tab.id === 'realtime' && unreadCount > 0 && (<div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%', animation: 'pulse 2s infinite' }} />)}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {activeTab === 'overview' && dashboardData && (
                <div>
                  <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Emergency Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[ { label: 'Total Emergencies', value: dashboardData.overview.totalEmergencies, color: '#3b82f6' }, { label: 'Active Emergencies', value: dashboardData.overview.activeEmergencies, color: '#dc2626' }, { label: 'Resolved Today', value: dashboardData.overview.resolvedToday, color: '#10b981' }, { label: 'Critical Alerts', value: dashboardData.overview.criticalCount, color: '#f59e0b' } ].map(stat => (
                      <div key={stat.label} style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder }}>
                        <div style={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold' }}>{stat.value}</div>
                        <div style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', marginTop: '0.5rem' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {dashboardData.recentEmergencies.length > 0 && (
                    <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder }}>
                      <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Emergencies</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dashboardData.recentEmergencies.slice(0, 5).map((emergency) => (
                          <div key={emergency._id} style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: currentThemeStyles.textSecondary }}>{getTypeIcon(emergency.type)}
                              <div>
                                <div style={{ color: currentThemeStyles.textPrimary, fontWeight: '500' }}>{emergency.title}</div>
                                <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{emergency.location.address}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ backgroundColor: getPriorityColor(emergency.priority), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>{emergency.priority.toUpperCase()}</span>
                              <span style={{ backgroundColor: getStatusColor(emergency.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>{emergency.status.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'incidents' && (
                <div>
                  <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Active Emergency Incidents ({incidents.length})</h2>
                  {incidents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {incidents.map((incident) => (
                        <div key={incident._id} style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: incident.priority === 'critical' ? '2px solid #dc2626' : currentThemeStyles.quickActionBorder }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: currentThemeStyles.textSecondary }}>{getTypeIcon(incident.type)}
                                <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>{incident.title}</h3>
                                <span style={{ backgroundColor: getPriorityColor(incident.priority), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{incident.priority}</span>
                              </div>
                              <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>{incident.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button style={{ backgroundColor: 'rgba(16, 185, 129, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid rgba(16, 185, 129, 0.7)', cursor: 'pointer', fontSize: '0.875rem', backdropFilter: 'blur(8px)' }}>Resolve</button>
                              <button style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid rgba(59, 130, 246, 0.7)', cursor: 'pointer', fontSize: '0.875rem', backdropFilter: 'blur(8px)' }}>View Details</button>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                            <div><strong>Location:</strong> {incident.location.address}</div>
                            <div><strong>Reported by:</strong> {incident.reportedBy.name} ({incident.reportedBy.role})</div>
                            <div><strong>Status:</strong> {incident.status.toUpperCase()}</div>
                            <div><strong>Created:</strong> {new Date(incident.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '3rem', borderRadius: '0.75rem', textAlign: 'center', color: currentThemeStyles.textSecondary, border: currentThemeStyles.quickActionBorder }}>
                      <BellAlertIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Active Incidents</div>
                      <div>All emergency situations are currently resolved.</div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'teams' && (
                <div>
                  <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Emergency Response Teams ({teams.length})</h2>
                  {teams.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                      {teams.map((team) => (
                        <div key={team.teamId} style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>{team.teamName}</h3>
                            <span style={{ backgroundColor: team.statistics.status === 'available' ? '#10b981' : '#f59e0b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{team.statistics.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem' }}>
                            <div style={{ textAlign: 'center' }}><div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>{team.statistics.assignedIncidents}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Assigned</div></div>
                            <div style={{ textAlign: 'center' }}><div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>{team.statistics.activeIncidents}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Active</div></div>
                            <div style={{ textAlign: 'center' }}><div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{team.statistics.resolvedIncidents}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Resolved</div></div>
                          </div>
                          <div>
                            <h4 style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', marginBottom: '0.5rem' }}>Team Members ({team.members.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {team.members.map((member, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                                  <div><span style={{ color: currentThemeStyles.textPrimary, fontWeight: '500' }}>{member.name}</span><span style={{ color: currentThemeStyles.textMuted, marginLeft: '0.5rem' }}>({member.role})</span></div>
                                  <span style={{ color: currentThemeStyles.textMuted }}>{member.contactNumber}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '3rem', borderRadius: '0.75rem', textAlign: 'center', color: currentThemeStyles.textSecondary, border: currentThemeStyles.quickActionBorder }}>
                      <UserGroupIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Response Teams</div>
                      <div>Emergency response teams are being configured.</div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'broadcast' && (
                <div>
                  <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><SpeakerWaveIcon width={20} height={20} color="#ea580c" />Emergency Broadcast System</h2>
                  <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '2rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder, textAlign: 'center' }}>
                    <SpeakerWaveIcon width={64} height={64} color="#ea580c" style={{ margin: '0 auto 2rem' }} />
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>System-wide Emergency Broadcast</h3>
                    <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>Send critical emergency notifications to all users, administrators, and response teams across multiple channels.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1.5rem', borderRadius: '0.75rem' }}><div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>{realtimeConnection.connectedUsers}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Connected Users</div></div>
                      <div style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1.5rem', borderRadius: '0.75rem' }}><div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}>5</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Delivery Channels</div></div>
                      <div style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1.5rem', borderRadius: '0.75rem' }}><div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>{'<5s'}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Delivery Time</div></div>
                    </div>
                    <button onClick={() => setShowBroadcast(true)} style={{ backgroundColor: 'rgba(234, 88, 12, 0.8)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: '1px solid rgba(234, 88, 12, 1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600', fontSize: '1.125rem', margin: '0 auto', backdropFilter: 'blur(8px)' }}>
                      <SpeakerWaveIcon width={20} height={20} /> Send Emergency Broadcast
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'realtime' && (
                <div>
                  <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><WifiIcon width={20} height={20} color="#10b981" />Live Emergency Alerts ({realtimeAlerts.length})</h2>
                  {realtimeAlerts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem' }}>
                      {realtimeAlerts.map((alert) => (
                        <div key={alert.id} style={{ backgroundColor: alert.read ? currentThemeStyles.alertBg : (alert.priority === 'critical' ? 'rgba(127, 29, 29, 0.8)' : currentThemeStyles.quickActionBg), padding: '1.5rem', borderRadius: '0.75rem', border: alert.priority === 'critical' ? '2px solid #dc2626' : currentThemeStyles.quickActionBorder, cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => markAsRead(alert.id)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{alert.priority === 'critical' ? '🚨' : alert.priority === 'high' ? '⚠️' : '📢'}</span>
                                <span style={{ color: currentThemeStyles.textPrimary, fontWeight: 'bold', fontSize: '1.1rem' }}>{alert.title}</span>
                                <span style={{ backgroundColor: getPriorityColor(alert.priority), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{alert.priority}</span>
                                {!alert.read && (<span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '600' }}>NEW</span>)}
                              </div>
                              <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem', lineHeight: '1.5' }}>{alert.message}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                            <div>Type: {alert.type.replace('_', ' ').toUpperCase()}</div>
                            <div>{new Date(alert.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '3rem', borderRadius: '0.75rem', textAlign: 'center', color: currentThemeStyles.textSecondary, border: currentThemeStyles.quickActionBorder }}>
                      <WifiIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Real-time Alerts</div>
                      <div>Waiting for emergency notifications...</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(showCreateAlert || showBroadcast) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            {showCreateAlert && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Create Emergency Alert</h3>
                  <button onClick={() => setShowCreateAlert(false)} style={{ background: 'none', border: 'none', color: currentThemeStyles.textSecondary, cursor: 'pointer', padding: '0.5rem' }}><XMarkIcon width={24} height={24} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Emergency Type</label>
                      <select value={alertForm.type} onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }}>
                        <option value="system">System</option><option value="accident">Accident</option><option value="breakdown">Breakdown</option><option value="security">Security</option><option value="medical">Medical</option><option value="weather">Weather</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Priority Level</label>
                      <select value={alertForm.priority} onChange={(e) => setAlertForm({ ...alertForm, priority: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Alert Title *</label>
                    <input type="text" placeholder="Enter emergency title..." value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }} />
                  </div>
                  <div>
                    <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Description *</label>
                    <textarea placeholder="Describe the emergency situation..." value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Location Address *</label>
                    <input type="text" placeholder="Enter location address..." value={alertForm.address} onChange={(e) => setAlertForm({ ...alertForm, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Latitude (Optional)</label>
                      <input type="number" step="any" placeholder="6.9271" value={alertForm.latitude} onChange={(e) => setAlertForm({ ...alertForm, latitude: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }} />
                    </div>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Longitude (Optional)</label>
                      <input type="number" step="any" placeholder="79.8612" value={alertForm.longitude} onChange={(e) => setAlertForm({ ...alertForm, longitude: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setShowCreateAlert(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleCreateAlert} disabled={creating || !alertForm.title || !alertForm.description || !alertForm.address} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: creating ? '#6b7280' : 'rgba(220, 38, 38, 0.8)', color: 'white', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{creating ? 'Creating Alert...' : 'Create Emergency Alert'}</button>
                  </div>
                </div>
              </>
            )}
            {showBroadcast && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Send Emergency Broadcast</h3>
                  <button onClick={() => setShowBroadcast(false)} style={{ background: 'none', border: 'none', color: currentThemeStyles.textSecondary, cursor: 'pointer', padding: '0.5rem' }}><XMarkIcon width={24} height={24} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Recipients</label>
                      <select 
                        value={broadcastForm.recipients} 
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, recipients: e.target.value })} 
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem', 
                          borderRadius: '0.5rem', 
                          border: currentThemeStyles.quickActionBorder, 
                          backgroundColor: currentThemeStyles.inputBg, 
                          color: currentThemeStyles.textPrimary 
                        }}
                      >
                        <option value="all">All Users & Staff</option>
                        <option value="passengers">Passengers Only</option>
                        <option value="fleet_operators">Fleet Operators</option>
                        <option value="route_admins">Route Administrators</option>
                        <option value="customer_service">Customer Service Agents</option>
                        <option value="system_admins">System Administrators</option>
                        <option value="staff_only">All Staff (No Passengers)</option>
                        <option value="emergency_responders">Emergency Response Teams</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Priority</label>
                      <select value={broadcastForm.priority} onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }}>
                        <option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Broadcast Message *</label>
                    <textarea placeholder="Enter your emergency broadcast message..." value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Delivery Method</label>
                    <select value={broadcastForm.method} onChange={(e) => setBroadcastForm({ ...broadcastForm, method: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }}>
                      <option value="system">All Channels (Real-time + Email + SMS)</option><option value="email">Email Only</option><option value="sms">SMS Only</option><option value="push">Push Notifications Only</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setShowBroadcast(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleBroadcast} disabled={broadcasting || !broadcastForm.message} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: broadcasting ? '#6b7280' : 'rgba(234, 88, 12, 0.8)', color: 'white', cursor: broadcasting ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{broadcasting ? 'Sending Broadcast...' : 'Send Emergency Broadcast'}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {apiErrors.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#dc2626', color: 'white', padding: '1rem', borderRadius: '0.5rem', maxWidth: '400px', zIndex: 1000, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>⚠️ Connection Issues</h4>
          {apiErrors.map((error, index) => (<div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {error}</div>))}
          <button onClick={() => setApiErrors([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginTop: '0.5rem', cursor: 'pointer', width: '100%' }}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default function EmergencyManagementPage() {
  return (
    <RealTimeEmergencyClient enableSound={true} enablePushNotifications={true}>
      <EmergencyPageContent />
    </RealTimeEmergencyClient>
  );
}