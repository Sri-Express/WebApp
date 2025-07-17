// src/app/sysadmin/emergency/page.tsx
"use client";

import { useState, useEffect } from 'react';
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
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
  FireIcon,
  TruckIcon,
  HeartIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

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

export default function EmergencyManagementPage() {
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

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/sysadmin/login');
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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
  };

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, []);

  const handleCreateAlert = async () => {
    if (!alertForm.title || !alertForm.description || !alertForm.address) return;

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
        body: JSON.stringify(alertData),
      });

      if (response) {
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
        // Reload data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.message) return;

    setBroadcasting(true);
    try {
      const response = await apiCall('/admin/emergency/broadcast', {
        method: 'POST',
        body: JSON.stringify(broadcastForm),
      });

      if (response) {
        setShowBroadcast(false);
        setBroadcastForm({
          message: '',
          recipients: 'all',
          method: 'system',
          priority: 'high'
        });
        // Show success message or reload data
        alert('Emergency broadcast sent successfully!');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
    } finally {
      setBroadcasting(false);
    }
  };

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
    { id: 'broadcast', name: 'Emergency Broadcast', icon: SpeakerWaveIcon }
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
        <div>Loading emergency management center...</div>
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
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
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
            gap: '1rem'
          }}>
            <ExclamationTriangleIcon width={24} height={24} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                CRITICAL ALERT: {dashboardData.overview.criticalCount} Critical Emergency{dashboardData.overview.criticalCount > 1 ? 's' : ''} Active
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Immediate attention required. Response teams have been notified.
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
                  borderRadius: activeTab === tab.id ? '0.75rem 0.75rem 0 0' : '0'
                }}
              >
                <tab.icon width={16} height={16} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
              <div>
                {/* Statistics Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        backgroundColor: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}>
                        <ExclamationTriangleIcon width={24} height={24} color="white" />
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Total Emergencies</div>
                        <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 'bold' }}>
                          {dashboardData.overview.totalEmergencies}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        backgroundColor: '#ea580c',
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}>
                        <BellAlertIcon width={24} height={24} color="white" />
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Active Emergencies</div>
                        <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 'bold' }}>
                          {dashboardData.overview.activeEmergencies}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        backgroundColor: '#16a34a',
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}>
                        <CheckCircleIcon width={24} height={24} color="white" />
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Resolved Today</div>
                        <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 'bold' }}>
                          {dashboardData.overview.resolvedToday}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        backgroundColor: '#ca8a04',
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}>
                        <ClockIcon width={24} height={24} color="white" />
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Avg Response Time</div>
                        <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 'bold' }}>
                          {dashboardData.statistics.averageResponseTime}m
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Critical Emergencies */}
                {dashboardData.criticalEmergencies.length > 0 && (
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FireIcon width={20} height={20} color="#dc2626" />
                      Critical Emergencies
                    </h3>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {dashboardData.criticalEmergencies.map((emergency) => (
                        <div key={emergency._id} style={{
                          backgroundColor: '#1e293b',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #dc2626'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {getTypeIcon(emergency.type)}
                              <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                                {emergency.incidentId}
                              </span>
                              <span style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                CRITICAL
                              </span>
                            </div>
                            <div style={{
                              color: '#94a3b8',
                              fontSize: '0.875rem'
                            }}>
                              {new Date(emergency.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <div style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                            {emergency.title}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#94a3b8',
                            fontSize: '0.875rem'
                          }}>
                            <MapPinIcon width={14} height={14} />
                            {emergency.location.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Emergencies */}
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.75rem'
                }}>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    Recent Emergency Activity
                  </h3>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {dashboardData.recentEmergencies.map((emergency) => (
                      <div key={emergency._id} style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '0.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getTypeIcon(emergency.type)}
                            <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                              {emergency.incidentId}
                            </span>
                            <span style={{
                              backgroundColor: getPriorityColor(emergency.priority),
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              {emergency.priority}
                            </span>
                            <span style={{
                              backgroundColor: getStatusColor(emergency.status),
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              {emergency.status}
                            </span>
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.875rem'
                          }}>
                            {new Date(emergency.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                          {emergency.title}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <MapPinIcon width={14} height={14} />
                            {emergency.location.address}
                          </div>
                          <div>
                            Reported by: {emergency.reportedBy.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Active Emergency Incidents
                </h2>

                {incidents.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {incidents.filter(incident => incident.status === 'active' || incident.status === 'responded').map((incident) => (
                      <div key={incident._id} style={{
                        backgroundColor: '#334155',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #475569'
                      }}>
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
                              <span style={{ 
                                color: '#f1f5f9', 
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                              }}>
                                {incident.incidentId}
                              </span>
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
                              <span style={{
                                backgroundColor: getStatusColor(incident.status),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {incident.status}
                              </span>
                            </div>
                            <h3 style={{
                              color: '#e2e8f0',
                              fontSize: '1rem',
                              fontWeight: '600',
                              marginBottom: '0.5rem'
                            }}>
                              {incident.title}
                            </h3>
                            <p style={{
                              color: '#94a3b8',
                              marginBottom: '1rem',
                              lineHeight: '1.5'
                            }}>
                              {incident.description}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}>
                            <button style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}>
                              <EyeIcon width={16} height={16} />
                            </button>
                            <button style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}>
                              <CheckCircleIcon width={16} height={16} />
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
                            <div style={{ fontWeight: '500', color: '#e2e8f0' }}>Location</div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <MapPinIcon width={14} height={14} />
                              {incident.location.address}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#e2e8f0' }}>Reported By</div>
                            <div>{incident.reportedBy.name} ({incident.reportedBy.role})</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#e2e8f0' }}>Created</div>
                            <div>{new Date(incident.createdAt).toLocaleString()}</div>
                          </div>
                          {incident.assignedTeam && (
                            <div>
                              <div style={{ fontWeight: '500', color: '#e2e8f0' }}>Assigned Team</div>
                              <div>{incident.assignedTeam.teamName}</div>
                            </div>
                          )}
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
                    <CheckCircleIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No Active Emergencies
                    </div>
                    <div>All systems are operating normally</div>
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Emergency Response Teams
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {teams.map((team) => (
                    <div key={team.teamId} style={{
                      backgroundColor: '#334155',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #475569'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h3 style={{
                            color: '#f1f5f9',
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                          }}>
                            {team.teamName}
                          </h3>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.875rem'
                          }}>
                            Team ID: {team.teamId}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: team.statistics.status === 'available' ? '#16a34a' : '#ea580c',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {team.statistics.status}
                        </div>
                      </div>

                      <div style={{
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}>
                          Team Members ({team.members.length})
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {team.members.map((member, index) => (
                            <div key={index} style={{
                              backgroundColor: '#1e293b',
                              padding: '0.75rem',
                              borderRadius: '0.375rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ 
                                  color: '#f1f5f9', 
                                  fontWeight: '500',
                                  fontSize: '0.875rem'
                                }}>
                                  {member.name}
                                </div>
                                <div style={{ 
                                  color: '#94a3b8', 
                                  fontSize: '0.75rem'
                                }}>
                                  {member.role}
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: '#94a3b8',
                                fontSize: '0.75rem'
                              }}>
                                <PhoneIcon width={12} height={12} />
                                {member.contactNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: '#f1f5f9', 
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                          }}>
                            {team.statistics.assignedIncidents}
                          </div>
                          <div style={{ color: '#94a3b8' }}>Assigned</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: '#ea580c', 
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                          }}>
                            {team.statistics.activeIncidents}
                          </div>
                          <div style={{ color: '#94a3b8' }}>Active</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: '#16a34a', 
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                          }}>
                            {team.statistics.resolvedIncidents}
                          </div>
                          <div style={{ color: '#94a3b8' }}>Resolved</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcast Tab */}
            {activeTab === 'broadcast' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Emergency Broadcast System
                </h2>

                <div style={{
                  backgroundColor: '#334155',
                  padding: '2rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <SpeakerWaveIcon width={64} height={64} style={{ 
                    margin: '0 auto 1rem',
                    color: '#ea580c'
                  }} />
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    System-wide Emergency Broadcast
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                  }}>
                    Send immediate emergency notifications to all users, staff, or specific groups.
                    Use this feature for critical system-wide alerts that require immediate attention.
                  </p>

                  <button
                    onClick={() => setShowBroadcast(true)}
                    style={{
                      backgroundColor: '#ea580c',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <SpeakerWaveIcon width={20} height={20} />
                    Send Emergency Broadcast
                  </button>
                </div>
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
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#f1f5f9',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              Create Emergency Alert
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Type
                </label>
                <select
                  value={alertForm.type}
                  onChange={(e) => setAlertForm({...alertForm, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    outline: 'none'
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
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Priority
                </label>
                <select
                  value={alertForm.priority}
                  onChange={(e) => setAlertForm({...alertForm, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    outline: 'none'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Title
              </label>
              <input
                type="text"
                value={alertForm.title}
                onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Emergency title"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Description
              </label>
              <textarea
                value={alertForm.description}
                onChange={(e) => setAlertForm({...alertForm, description: e.target.value})}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Detailed description of the emergency"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Location Address
              </label>
              <input
                type="text"
                value={alertForm.address}
                onChange={(e) => setAlertForm({...alertForm, address: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Emergency location address"
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowCreateAlert(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={creating}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {creating ? <ArrowPathIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
                {creating ? 'Creating...' : 'Create Alert'}
              </button>
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
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            width: '90%',
            maxWidth: '600px'
          }}>
            <h2 style={{
              color: '#f1f5f9',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              Send Emergency Broadcast
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Recipients
                </label>
                <select
                  value={broadcastForm.recipients}
                  onChange={(e) => setBroadcastForm({...broadcastForm, recipients: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="admins">Administrators Only</option>
                  <option value="users">Regular Users</option>
                  <option value="drivers">Drivers</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Method
                </label>
                <select
                  value={broadcastForm.method}
                  onChange={(e) => setBroadcastForm({...broadcastForm, method: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    outline: 'none'
                  }}
                >
                  <option value="system">System Notification</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Broadcast Message
              </label>
              <textarea
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Enter emergency broadcast message..."
              />
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                <ExclamationTriangleIcon width={16} height={16} />
                <span style={{ fontWeight: '600' }}>Warning</span>
              </div>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: '1.5'
              }}>
                This will send an immediate emergency broadcast to all selected recipients. 
                Please ensure the message is accurate and appropriate for emergency communication.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowBroadcast(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={broadcasting || !broadcastForm.message}
                style={{
                  backgroundColor: '#ea580c',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: broadcasting || !broadcastForm.message ? 'not-allowed' : 'pointer',
                  opacity: broadcasting || !broadcastForm.message ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {broadcasting ? <ArrowPathIcon width={16} height={16} /> : <SpeakerWaveIcon width={16} height={16} />}
                {broadcasting ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}