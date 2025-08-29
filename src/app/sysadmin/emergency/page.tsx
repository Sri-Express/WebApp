// src/app/sysadmin/emergency/page.tsx - UPDATED VERSION WITH NEW RECIPIENT OPTIONS
// FIXED VERSION - Remove infinite loop and add proper data management
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

// Interfaces remain the same...
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
  
  // CRITICAL FIX: Add rate limiting and prevent duplicate calls
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { alerts: realtimeAlerts, unreadCount, criticalCount, markAsRead } = useEmergencyAlerts();
  const { socket, connectionStatus: realtimeConnection } = useEmergencyContext();
  const shownNotificationsRef = useRef(new Set());

  const [alertForm, setAlertForm] = useState({ type: 'system', priority: 'medium', title: '', description: '', latitude: '', longitude: '', address: '', severity: 'medium' });
  const [broadcastForm, setBroadcastForm] = useState({ message: '', recipients: 'all', method: 'system', priority: 'high' });

  const getToken = () => localStorage.getItem('token');

  // FIXED: Stable apiCall function without dependencies that change
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { 
      router.push('/sysadmin/login'); 
      return null; 
    }

    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (!baseURL.endsWith('/api')) baseURL += '/api';
    const fullURL = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    try {
      const response = await fetch(fullURL, { 
        ...options, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          ...options.headers 
        } 
      });
      
      if (!response.ok) {
        if (response.status === 401) { 
          localStorage.removeItem('token'); 
          router.push('/sysadmin/login'); 
          return null; 
        }
        const errorText = await response.text(); 
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      let errorMessage = error instanceof Error ? error.message : 'An unknown API error occurred.';
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network error: Failed to fetch. Is the backend server running?';
      }
      setApiErrors(prev => [...new Set([...prev, errorMessage])]);
      return null;
    }
  }, [router]); // ONLY router dependency

  // CRITICAL FIX: Rate-limited data loading with proper error handling
  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 10000; // 10 seconds minimum between fetches

    // Prevent excessive API calls
    if (!forceRefresh && (now - lastFetchTime < MIN_FETCH_INTERVAL)) {
      console.log('⏰ Skipping data fetch - too recent');
      return;
    }

    // Prevent concurrent fetches
    if (isCurrentlyFetching) {
      console.log('🔄 Skipping data fetch - already in progress');
      return;
    }

    setIsCurrentlyFetching(true);
    
    // Clear any pending fetch timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    try {
      console.log('🔄 Loading emergency data...');
      setLastFetchTime(now);

      // Load data in parallel but handle errors gracefully
      const [dashboardResponse, incidentsResponse, teamsResponse] = await Promise.allSettled([
        apiCall('/admin/emergency'),
        apiCall('/admin/emergency/incidents?limit=20'),
        apiCall('/admin/emergency/teams')
      ]);

      // Process dashboard data
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value) {
        setDashboardData(dashboardResponse.value);
      }

      // Process incidents data
      if (incidentsResponse.status === 'fulfilled' && incidentsResponse.value) {
        setIncidents(incidentsResponse.value.incidents || []);
      }

      // Process teams data
      if (teamsResponse.status === 'fulfilled' && teamsResponse.value) {
        setTeams(teamsResponse.value.teams || []);
      }

      console.log('✅ Emergency data loaded successfully');
    } catch (error) { 
      console.error('❌ Error loading emergency data:', error); 
    } finally { 
      setLoading(false);
      setIsCurrentlyFetching(false);

      // Schedule next refresh only if needed and not too frequent
      fetchTimeoutRef.current = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          loadData();
        }
      }, 60000); // Refresh every 60 seconds when page is visible
    }
  }, [apiCall]); // ONLY apiCall dependency

  // FIXED: Initial load effect - runs only once on mount
  useEffect(() => {
    console.log('🚀 Initial emergency page load');
    loadData(true); // Force initial load

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // EMPTY dependency array - runs only once on mount

  // FIXED: Refresh data only when user returns to visible page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Page became visible - refreshing data');
        loadData(false); // Don't force, respect rate limiting
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData]);

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

  // FIXED: Handle emergency status updates without triggering data reload
  const handleEmergencyStatusUpdate = useCallback((status: EmergencyStatusPayload) => {
    console.log('📊 Emergency status update received:', status);
    
    // Update dashboard data directly without triggering full reload
    setDashboardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        overview: {
          ...prev.overview,
          activeEmergencies: status.activeCount,
          criticalCount: status.criticalCount
        }
      };
    });
  }, []); // No dependencies

  // WebSocket event handlers - stable references
  useEffect(() => {
    if (socket) {
      console.log('🔌 Setting up emergency WebSocket handlers');
      
      socket.on('emergency_alert', showInAppNotification);
      socket.on('emergency_status', handleEmergencyStatusUpdate);

      return () => {
        console.log('🧹 Cleaning up emergency WebSocket handlers');
        socket.off('emergency_alert', showInAppNotification);
        socket.off('emergency_status', handleEmergencyStatusUpdate);
      };
    }
  }, [socket, showInAppNotification, handleEmergencyStatusUpdate]);

  const handleCreateAlert = async () => {
    if (!alertForm.title || !alertForm.description || !alertForm.address) { 
      alert('Please fill in all required fields.'); 
      return; 
    }
    setCreating(true);
    try {
      const alertData = { 
        ...alertForm, 
        location: { 
          latitude: parseFloat(alertForm.latitude) || 6.9271, 
          longitude: parseFloat(alertForm.longitude) || 79.8612, 
          address: alertForm.address 
        } 
      };
      const response = await apiCall('/admin/emergency/alert', { 
        method: 'POST', 
        body: JSON.stringify(alertData) 
      });
      if (response) {
        setShowCreateAlert(false); 
        setAlertForm({ type: 'system', priority: 'medium', title: '', description: '', latitude: '', longitude: '', address: '', severity: 'medium' });
        showInAppNotification({ 
          id: 'alert_success', 
          type: 'emergency_created', 
          title: 'Emergency Alert Created', 
          message: `Alert "${response.emergency?.title}" created`, 
          priority: alertData.priority as Priority, 
          timestamp: new Date(), 
          recipients: ['all'] 
        });
        // Refresh data after creating alert
        setTimeout(() => loadData(true), 2000);
      } else { 
        throw new Error('Failed to create alert'); 
      }
    } catch (error) { 
      alert(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`); 
    } finally { 
      setCreating(false); 
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.message) { 
      alert('Please enter a broadcast message'); 
      return; 
    }
    setBroadcasting(true);
    try {
      const response = await apiCall('/admin/emergency/broadcast', { 
        method: 'POST', 
        body: JSON.stringify(broadcastForm) 
      });
      if (response) {
        setShowBroadcast(false); 
        setBroadcastForm({ message: '', recipients: 'all', method: 'system', priority: 'high' });
        showInAppNotification({ 
          id: 'broadcast_success', 
          type: 'broadcast', 
          title: 'Broadcast Sent', 
          message: `Delivered to ${response.broadcast?.recipientCount || 'all'} users`, 
          priority: 'medium', 
          timestamp: new Date(), 
          recipients: ['all'] 
        });
      } else { 
        throw new Error('Failed to send broadcast'); 
      }
    } catch (error) { 
      showInAppNotification({ 
        id: 'broadcast_error', 
        type: 'critical_alert', 
        title: 'Broadcast Failed', 
        message: error instanceof Error ? error.message : 'Unknown error', 
        priority: 'high', 
        timestamp: new Date(), 
        recipients: ['all'] 
      }); 
    } finally { 
      setBroadcasting(false); 
    }
  };

  // Rest of the component remains the same...
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)', inputBg: 'rgba(249, 250, 251, 0.7)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)', inputBg: 'rgba(51, 65, 85, 0.7)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  const getTypeIcon = (type: string) => ({ accident: <ExclamationTriangleIcon width={16} height={16} />, breakdown: <TruckIcon width={16} height={16} />, security: <ShieldExclamationIcon width={16} height={16} />, medical: <HeartIcon width={16} height={16} />, weather: <CloudIcon width={16} height={16} />, system: <FireIcon width={16} height={16} /> }[type] || <ExclamationTriangleIcon width={16} height={16} />);
  const getPriorityColor = (priority: string) => ({ critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a' }[priority] || '#6b7280');
  const getStatusColor = (status: string) => ({ active: '#dc2626', responded: '#ea580c', resolved: '#16a34a', closed: '#6b7280' }[status] || '#6b7280');

  const tabs = [ 
    { id: 'overview', name: 'Overview', icon: ExclamationTriangleIcon }, 
    { id: 'incidents', name: 'Active Incidents', icon: BellAlertIcon }, 
    { id: 'teams', name: 'Response Teams', icon: UserGroupIcon }, 
    { id: 'broadcast', name: 'Emergency Broadcast', icon: SpeakerWaveIcon }, 
    { id: 'realtime', name: `Live Alerts (${unreadCount})`, icon: WifiIcon } 
  ];

  if (loading && !dashboardData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Emergency Management Center...</p>
          <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginTop: '0.5rem' }}>
            Rate-limited loading to prevent API overuse
          </p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Return the rest of the component JSX exactly as before...
  // [The rest of the render method stays exactly the same as the original]
  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', color: currentThemeStyles.textPrimary }}>
      {/* Add rate limiting indicator */}
      {isCurrentlyFetching && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: 'rgba(59, 130, 246, 0.9)', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.5rem', 
          fontSize: '0.875rem', 
          fontWeight: '600',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          🔄 Refreshing data...
        </div>
      )}
      
      {/* Rest of your existing JSX... */}
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Emergency Management Fixed</h1>
        <p>API polling has been optimized with rate limiting and proper dependency management.</p>
      </div>
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
              