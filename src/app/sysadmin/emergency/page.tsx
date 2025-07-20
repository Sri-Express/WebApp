// src/app/sysadmin/emergency/page.tsx - UPDATED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  ShieldExclamationIcon,
  FireIcon,
  TruckIcon,
  HeartIcon,
  CloudIcon,
  WifiIcon,
  SpeakerXMarkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import RealTimeEmergencyClient, { EmergencyAlert, ConnectionStatus, useEmergencyAlerts } from '../../components/RealTimeEmergencyClient';

interface EmergencyIncident {
  _id: string;
  incidentId: string;
  type: 'accident' | 'breakdown' | 'security' | 'medical' | 'weather' | 'system' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'responded' | 'resolved' | 'closed';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    deviceId?: string;
    vehicleNumber?: string;
  };
  reportedBy: {
    name: string;
    role: string;
  };
  assignedTeam?: {
    teamName: string;
    responseTime?: string;
  };
  createdAt: string;
  escalationLevel: number;
}

interface EmergencyDashboard {
  overview: {
    totalEmergencies: number;
    activeEmergencies: number;
    resolvedToday: number;
    criticalCount: number;
  };
  statistics: {
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    averageResponseTime: number;
    averageResolutionTime: number;
  };
  alerts: {
    deviceAlerts: number;
    offlineDevices: number;
    escalatedEmergencies: number;
  };
  recentEmergencies: EmergencyIncident[];
  criticalEmergencies: EmergencyIncident[];
  realTimeStatus?: {
    connectedUsers: number;
    websocketActive: boolean;
  };
}

interface EmergencyTeam {
  teamId: string;
  teamName: string;
  members: {
    name: string;
    role: string;
    contactNumber: string;
  }[];
  statistics: {
    assignedIncidents: number;
    activeIncidents: number;
    resolvedIncidents: number;
    status: 'available' | 'busy';
  };
}

// Main component that includes the real-time client
function EmergencyPageContent() {
  const router = useRouter();
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
  const [pushEnabled, setPushEnabled] = useState(true);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [realtimeConnection, setRealtimeConnection] = useState<ConnectionStatus>({
    connected: false,
    connectedUsers: 0
  });

  // Real-time alerts hook
  const { alerts: realtimeAlerts, unreadCount, criticalCount, markAsRead } = useEmergencyAlerts();

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    type: 'system',
    priority: 'medium',
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    severity: 'medium'
  });

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    recipients: 'all',
    method: 'system',
    priority: 'high'
  });

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper with proper URL construction
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/sysadmin/login');
      return null;
    }

    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    if (baseURL.endsWith('/api')) {
      // If baseURL already ends with /api, use it as is
    } else if (baseURL.endsWith('/')) {
      baseURL = baseURL + 'api';
    } else {
      baseURL = baseURL + '/api';
    }
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const fullURL = `${baseURL}${cleanEndpoint}`;
    
    console.log(`🔗 API Call: ${fullURL}`);

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log(`📡 Response status: ${response.status} for ${fullURL}`);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/sysadmin/login');
          return null;
        }
        
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      let errorMessage = 'An unknown API error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('404')) {
          const msg = `Endpoint not found: ${fullURL}. Check backend.`;
          setApiErrors(prev => [...new Set([...prev, msg])]);
        } else if (error.message.includes('Failed to fetch')) {
          const msg = 'Network error: Failed to fetch. Is the backend server running?';
          setApiErrors(prev => [...new Set([...prev, msg])]);
        }
      }
      return null;
    }
  }, [router]);

  // Load dashboard data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, incidentsResponse, teamsResponse] = await Promise.all([
        apiCall('/admin/emergency'),
        apiCall('/admin/emergency/incidents?limit=20'),
        apiCall('/admin/emergency/teams')
      ]);

      if (dashboardResponse) setDashboardData(dashboardResponse);
      if (incidentsResponse) setIncidents(incidentsResponse.incidents || []);
      if (teamsResponse) setTeams(teamsResponse.teams || []);
    } catch (error) {
      console.error('Error loading emergency data:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time alert handler
  const handleRealtimeAlert = useCallback((alert: EmergencyAlert) => {
    console.log('🚨 Received real-time alert:', alert);
    
    showInAppNotification(alert);
    
    if (alert.type === 'emergency_created' || alert.type === 'emergency_resolved') {
      setTimeout(() => {
        loadData();
      }, 1000);
    }
  }, [loadData]);

  // Real-time connection status handler
  const handleConnectionStatusChange = useCallback((status: ConnectionStatus) => {
    setRealtimeConnection(status);
    console.log('🔌 Connection status changed:', status);
  }, []);

  // Real-time emergency status update handler
  const handleEmergencyStatusUpdate = useCallback((status: any) => {
    console.log('📊 Emergency status update:', status);
    if (dashboardData) {
      setDashboardData(prev => ({
        ...prev!,
        overview: {
          ...prev!.overview,
          activeEmergencies: status.activeCount || prev!.overview.activeEmergencies,
          criticalCount: status.criticalCount || prev!.overview.criticalCount
        }
      }));
    }
  }, [dashboardData]);

  // Show in-app notification
  const showInAppNotification = (alert: EmergencyAlert) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: ${alert.priority === 'critical' ? '#dc2626' : alert.priority === 'high' ? '#ea580c' : '#f59e0b'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-size: 1.25rem;">🚨</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${alert.title}</div>
          <div style="font-size: 0.875rem; opacity: 0.9;">${alert.message}</div>
          <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">
            ${new Date(alert.timestamp).toLocaleTimeString()} • Click to dismiss
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    notification.onclick = () => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
      markAsRead(alert.id);
    };

    document.body.appendChild(notification);

    if (alert.priority !== 'critical') {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, alert.priority === 'high' ? 15000 : 10000);
    }
  };

  // Enhanced alert creation handler
  const handleCreateAlert = async () => {
    if (!alertForm.title || !alertForm.description || !alertForm.address) {
      alert('Please fill in all required fields (title, description, address)');
      return;
    }

    setCreating(true);
    console.log('🚨 Creating emergency alert...', alertForm);

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
        body: JSON.stringify(alertData),
      });

      if (response) {
        console.log('✅ Alert created successfully:', response);
        
        setShowCreateAlert(false);
        setAlertForm({
          type: 'system',
          priority: 'medium',
          title: '',
          description: '',
          latitude: '',
          longitude: '',
          address: '',
          severity: 'medium'
        });
        
        showInAppNotification({
          id: 'alert_success',
          type: 'emergency_created',
          title: 'Emergency Alert Created',
          message: `Alert "${response.emergency?.title}" created successfully`,
          priority: alertData.priority as any,
          timestamp: new Date(),
          recipients: ['all']
        });
        
        setTimeout(() => loadData(), 1000);
      } else {
        throw new Error('Failed to create alert - no response received');
      }
    } catch (error) {
      console.error('❌ Error creating alert:', error);
      alert(`Failed to create emergency alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  // Enhanced broadcast handler
  const handleBroadcast = async () => {
    if (!broadcastForm.message) {
      alert('Please enter a broadcast message');
      return;
    }

    setBroadcasting(true);
    console.log('🚀 Sending emergency broadcast...', broadcastForm);

    try {
      const response = await apiCall('/admin/emergency/broadcast', {
        method: 'POST',
        body: JSON.stringify(broadcastForm),
      });

      if (response) {
        console.log('✅ Broadcast sent successfully:', response);
        
        setShowBroadcast(false);
        setBroadcastForm({
          message: '',
          recipients: 'all',
          method: 'system',
          priority: 'high'
        });
        
        showInAppNotification({
          id: 'broadcast_success',
          type: 'broadcast',
          title: 'Broadcast Sent Successfully',
          message: `Emergency broadcast delivered to ${response.broadcast?.recipientCount || 'all'} users`,
          priority: 'medium',
          timestamp: new Date(),
          recipients: ['all']
        });
        
        setTimeout(() => loadData(), 1000);
      } else {
        throw new Error('Failed to send broadcast - no response received');
      }
    } catch (error) {
      console.error('❌ Error sending broadcast:', error);
      
      showInAppNotification({
        id: 'broadcast_error',
        type: 'critical_alert',
        title: 'Broadcast Failed',
        message: error instanceof Error ? error.message : 'Failed to send emergency broadcast',
        priority: 'high',
        timestamp: new Date(),
        recipients: ['all']
      });
    } finally {
      setBroadcasting(false);
    }
  };

  // Add connection status debug info
  useEffect(() => {
    console.log('🔌 Emergency page connection status:', {
      realtimeConnection,
      criticalCount,
      unreadCount
    });
  }, [realtimeConnection, criticalCount, unreadCount]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return <ExclamationTriangleIcon width={16} height={16} />;
      case 'breakdown': return <TruckIcon width={16} height={16} />;
      case 'security': return <ShieldExclamationIcon width={16} height={16} />;
      case 'medical': return <HeartIcon width={16} height={16} />;
      case 'weather': return <CloudIcon width={16} height={16} />;
      case 'system': return <FireIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#dc2626';
      case 'responded': return '#ea580c';
      case 'resolved': return '#16a34a';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ExclamationTriangleIcon },
    { id: 'incidents', name: 'Active Incidents', icon: BellAlertIcon },
    { id: 'teams', name: 'Response Teams', icon: UserGroupIcon },
    { id: 'broadcast', name: 'Emergency Broadcast', icon: SpeakerWaveIcon },
    { id: 'realtime', name: `Live Alerts (${unreadCount})`, icon: WifiIcon }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>Loading emergency management center...</div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Connecting to emergency services...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link href="/sysadmin/dashboard" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={24} height={24} color="#dc2626" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Emergency Management Center
              </h1>
              
              {/* Real-time status indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: realtimeConnection.connected ? '#10b981' : '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                <WifiIcon width={14} height={14} />
                {realtimeConnection.connected ? (
                  `LIVE (${realtimeConnection.connectedUsers} connected)`
                ) : (
                  'Offline'
                )}
              </div>
              {/* Debug info panel */}
              <div style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                marginLeft: '1rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                backgroundColor: '#374151'
              }}>
                API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Real-time alerts counter */}
            {criticalCount > 0 && (
              <div style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                animation: 'pulse 2s infinite'
              }}>
                🚨 {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
              </div>
            )}
            
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                backgroundColor: soundEnabled ? '#10b981' : '#6b7280',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
              title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
            >
              {soundEnabled ? <SpeakerWaveIcon width={16} height={16} /> : <SpeakerXMarkIcon width={16} height={16} />}
            </button>

            <button
              onClick={() => setShowCreateAlert(true)}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <PlusIcon width={16} height={16} />
              Create Alert
            </button>

            <button
              onClick={() => setShowBroadcast(true)}
              style={{
                backgroundColor: '#ea580c',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <SpeakerWaveIcon width={16} height={16} />
              Broadcast
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Emergency Status Banner */}
        {dashboardData && dashboardData.overview.criticalCount > 0 && (
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            <ExclamationTriangleIcon width={24} height={24} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                CRITICAL ALERT: {dashboardData.overview.criticalCount} Critical Emergency{dashboardData.overview.criticalCount > 1 ? 's' : ''} Active
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Immediate attention required. Response teams have been notified. Real-time alerts active.
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #334155'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: activeTab === tab.id ? '#334155' : 'transparent',
                  color: activeTab === tab.id ? '#f1f5f9' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: activeTab === tab.id ? '0.75rem 0.75rem 0 0' : '0',
                  position: 'relative'
                }}
              >
                <tab.icon width={16} height={16} />
                {tab.name}
                {tab.id === 'realtime' && unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#dc2626',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Emergency Overview
                </h2>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>
                      {dashboardData.overview.totalEmergencies}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '1rem', marginTop: '0.5rem' }}>
                      Total Emergencies
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: dashboardData.overview.activeEmergencies > 0 ? '2px solid #dc2626' : '1px solid #475569'
                  }}>
                    <div style={{ color: '#dc2626', fontSize: '2rem', fontWeight: 'bold' }}>
                      {dashboardData.overview.activeEmergencies}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '1rem', marginTop: '0.5rem' }}>
                      Active Emergencies
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>
                      {dashboardData.overview.resolvedToday}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '1rem', marginTop: '0.5rem' }}>
                      Resolved Today
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: dashboardData.overview.criticalCount > 0 ? '2px solid #dc2626' : '1px solid #475569'
                  }}>
                    <div style={{ color: '#dc2626', fontSize: '2rem', fontWeight: 'bold' }}>
                      {dashboardData.overview.criticalCount}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '1rem', marginTop: '0.5rem' }}>
                      Critical Alerts
                    </div>
                  </div>
                </div>

                {/* Recent Emergencies */}
                {dashboardData.recentEmergencies.length > 0 && (
                  <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}>
                      Recent Emergencies
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {dashboardData.recentEmergencies.slice(0, 5).map((emergency) => (
                        <div
                          key={emergency._id}
                          style={{
                            backgroundColor: '#4b5563',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {getTypeIcon(emergency.type)}
                            <div>
                              <div style={{ color: '#f1f5f9', fontWeight: '500' }}>
                                {emergency.title}
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                {emergency.location.address}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              backgroundColor: getPriorityColor(emergency.priority),
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {emergency.priority.toUpperCase()}
                            </span>
                            <span style={{
                              backgroundColor: getStatusColor(emergency.status),
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {emergency.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active Incidents Tab */}
            {activeTab === 'incidents' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Active Emergency Incidents ({incidents.length})
                </h2>

                {incidents.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {incidents.map((incident) => (
                      <div
                        key={incident._id}
                        style={{
                          backgroundColor: '#374151',
                          padding: '1.5rem',
                          borderRadius: '0.75rem',
                          border: incident.priority === 'critical' ? '2px solid #dc2626' : '1px solid #475569'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              marginBottom: '0.5rem'
                            }}>
                              {getTypeIcon(incident.type)}
                              <h3 style={{
                                color: '#f1f5f9',
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                margin: 0
                              }}>
                                {incident.title}
                              </h3>
                              <span style={{
                                backgroundColor: getPriorityColor(incident.priority),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {incident.priority}
                              </span>
                            </div>
                            <p style={{
                              color: '#e2e8f0',
                              marginBottom: '1rem'
                            }}>
                              {incident.description}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}>
                            <button style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}>
                              Resolve
                            </button>
                            <button style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}>
                              View Details
                            </button>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          <div>
                            <strong>Location:</strong> {incident.location.address}
                          </div>
                          <div>
                            <strong>Reported by:</strong> {incident.reportedBy.name} ({incident.reportedBy.role})
                          </div>
                          <div>
                            <strong>Status:</strong> {incident.status.toUpperCase()}
                          </div>
                          <div>
                            <strong>Created:</strong> {new Date(incident.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#374151',
                    padding: '3rem',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    <BellAlertIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No Active Incidents
                    </div>
                    <div>All emergency situations are currently resolved.</div>
                  </div>
                )}
              </div>
            )}

            {/* Response Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Emergency Response Teams ({teams.length})
                </h2>

                {teams.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {teams.map((team) => (
                      <div
                        key={team.teamId}
                        style={{
                          backgroundColor: '#374151',
                          padding: '1.5rem',
                          borderRadius: '0.75rem',
                          border: '1px solid #475569'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <h3 style={{
                            color: '#f1f5f9',
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0
                          }}>
                            {team.teamName}
                          </h3>
                          <span style={{
                            backgroundColor: team.statistics.status === 'available' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {team.statistics.status}
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                          marginBottom: '1rem',
                          padding: '1rem',
                          backgroundColor: '#4b5563',
                          borderRadius: '0.5rem'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                              {team.statistics.assignedIncidents}
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                              Assigned
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
                              {team.statistics.activeIncidents}
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                              Active
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
                              {team.statistics.resolvedIncidents}
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                              Resolved
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            marginBottom: '0.5rem'
                          }}>
                            Team Members ({team.members.length})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {team.members.map((member, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.5rem',
                                  backgroundColor: '#374151',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <div>
                                  <span style={{ color: '#f1f5f9', fontWeight: '500' }}>
                                    {member.name}
                                  </span>
                                  <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                                    ({member.role})
                                  </span>
                                </div>
                                <span style={{ color: '#94a3b8' }}>
                                  {member.contactNumber}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#374151',
                    padding: '3rem',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    <UserGroupIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No Response Teams
                    </div>
                    <div>Emergency response teams are being configured.</div>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Broadcast Tab */}
            {activeTab === 'broadcast' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <SpeakerWaveIcon width={20} height={20} color="#ea580c" />
                  Emergency Broadcast System
                </h2>

                <div style={{
                  backgroundColor: '#374151',
                  padding: '2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #475569',
                  textAlign: 'center'
                }}>
                  <SpeakerWaveIcon width={64} height={64} color="#ea580c" style={{ margin: '0 auto 2rem' }} />
                  
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    System-wide Emergency Broadcast
                  </h3>
                  
                  <p style={{
                    color: '#e2e8f0',
                    marginBottom: '2rem',
                    maxWidth: '600px',
                    margin: '0 auto 2rem'
                  }}>
                    Send critical emergency notifications to all users, administrators, and response teams 
                    across multiple channels including real-time alerts, email, SMS, and push notifications.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      backgroundColor: '#4b5563',
                      padding: '1.5rem',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>
                        {realtimeConnection.connectedUsers}
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        Connected Users
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#4b5563',
                      padding: '1.5rem',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}>
                        5
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        Delivery Channels
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#4b5563',
                      padding: '1.5rem',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>
                        {'<5s'}
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        Delivery Time
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBroadcast(true)}
                    style={{
                      backgroundColor: '#ea580c',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontWeight: '600',
                      fontSize: '1.125rem',
                      margin: '0 auto'
                    }}
                  >
                    <SpeakerWaveIcon width={20} height={20} />
                    Send Emergency Broadcast
                  </button>
                </div>
              </div>
            )}

            {/* Real-time Alerts Tab */}
            {activeTab === 'realtime' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <WifiIcon width={20} height={20} color="#10b981" />
                  Live Emergency Alerts ({realtimeAlerts.length})
                </h2>

                {realtimeAlerts.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxHeight: '600px',
                    overflowY: 'auto'
                  }}>
                    {realtimeAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        style={{
                          backgroundColor: alert.read ? '#334155' : (alert.priority === 'critical' ? '#7f1d1d' : '#374151'),
                          padding: '1.5rem',
                          borderRadius: '0.75rem',
                          border: alert.priority === 'critical' ? '2px solid #dc2626' : '1px solid #475569',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.5rem' }}>
                                {alert.priority === 'critical' ? '🚨' : alert.priority === 'high' ? '⚠️' : '📢'}
                              </span>
                              <span style={{ 
                                color: '#f1f5f9', 
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                              }}>
                                {alert.title}
                              </span>
                              <span style={{
                                backgroundColor: getPriorityColor(alert.priority),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {alert.priority}
                              </span>
                              {!alert.read && (
                                <span style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.625rem',
                                  fontWeight: '600'
                                }}>
                                  NEW
                                </span>
                              )}
                            </div>
                            <p style={{
                              color: '#e2e8f0',
                              marginBottom: '1rem',
                              lineHeight: '1.5'
                            }}>
                              {alert.message}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          <div>
                            Type: {alert.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div>
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '3rem',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    <WifiIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No Real-time Alerts
                    </div>
                    <div>Waiting for emergency notifications...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #334155',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Create Emergency Alert
              </h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <XMarkIcon width={24} height={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Type and Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Emergency Type
                  </label>
                  <select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  >
                    <option value="system">System</option>
                    <option value="accident">Accident</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="security">Security</option>
                    <option value="medical">Medical</option>
                    <option value="weather">Weather</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Priority Level
                  </label>
                  <select
                    value={alertForm.priority}
                    onChange={(e) => setAlertForm({ ...alertForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Alert Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter emergency title..."
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Description *
                </label>
                <textarea
                  placeholder="Describe the emergency situation..."
                  value={alertForm.description}
                  onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Location */}
              <div>
                <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Location Address *
                </label>
                <input
                  type="text"
                  placeholder="Enter location address..."
                  value={alertForm.address}
                  onChange={(e) => setAlertForm({ ...alertForm, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9'
                  }}
                />
              </div>

              {/* Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="6.9271"
                    value={alertForm.latitude}
                    onChange={(e) => setAlertForm({ ...alertForm, latitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="79.8612"
                    value={alertForm.longitude}
                    onChange={(e) => setAlertForm({ ...alertForm, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowCreateAlert(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={creating || !alertForm.title || !alertForm.description || !alertForm.address}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: creating ? '#6b7280' : '#dc2626',
                    color: 'white',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {creating ? 'Creating Alert...' : 'Create Emergency Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #334155',
            width: '90%',
            maxWidth: '600px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Send Emergency Broadcast
              </h3>
              <button
                onClick={() => setShowBroadcast(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <XMarkIcon width={24} height={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Recipients and Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Recipients
                  </label>
                  <select
                    value={broadcastForm.recipients}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, recipients: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="admins">Administrators</option>
                    <option value="users">Regular Users</option>
                    <option value="drivers">Drivers</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Priority
                  </label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#374151',
                      color: '#f1f5f9'
                    }}
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Broadcast Message *
                </label>
                <textarea
                  placeholder="Enter your emergency broadcast message..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Method */}
              <div>
                <label style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Delivery Method
                </label>
                <select
                  value={broadcastForm.method}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9'
                  }}
                >
                  <option value="system">All Channels (Real-time + Email + SMS)</option>
                  <option value="email">Email Only</option>
                  <option value="sms">SMS Only</option>
                  <option value="push">Push Notifications Only</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowBroadcast(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#374151',
                    color: '#f1f5f9',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={broadcasting || !broadcastForm.message}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: broadcasting ? '#6b7280' : '#ea580c',
                    color: 'white',
                    cursor: broadcasting ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {broadcasting ? 'Sending Broadcast...' : 'Send Emergency Broadcast'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced error display */}
      {apiErrors.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxWidth: '400px',
          zIndex: 1000
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
            ⚠️ Connection Issues
          </h4>
          {apiErrors.map((error, index) => (
            <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              • {error}
            </div>
          ))}
          <button 
            onClick={() => setApiErrors([])}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              marginTop: '0.5rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pulse animation styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Main component with real-time wrapper
export default function EmergencyManagementPage() {
  return (
    <RealTimeEmergencyClient
      enableSound={true}
      enablePushNotifications={true}
    >
      <EmergencyPageContent />
    </RealTimeEmergencyClient>
  );
}