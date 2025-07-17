// src/app/sysadmin/health/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  WifiIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: string;
  lastCheck: string;
  endpoint?: string;
  description: string;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
  };
}

interface HealthOverview {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  lastRestart: string;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
}

export default function SystemHealthPage() {
  const router = useRouter();
  const [healthOverview, setHealthOverview] = useState<HealthOverview | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);

  // Load health data
  const loadHealthData = async () => {
    try {
      // Mock data - replace with real API call
      const mockOverview: HealthOverview = {
        status: 'healthy',
        uptime: 99.8,
        lastRestart: '2025-01-10T14:30:00Z',
        totalRequests: 1247893,
        errorRate: 0.3,
        avgResponseTime: 145
      };

      const mockServices: ServiceHealth[] = [
        {
          name: 'Main API Server',
          status: 'healthy',
          responseTime: 89,
          uptime: '99.9%',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/health',
          description: 'Core application API handling all backend requests'
        },
        {
          name: 'Database',
          status: 'healthy',
          responseTime: 12,
          uptime: '99.8%',
          lastCheck: new Date().toISOString(),
          endpoint: 'mongodb://localhost:27017',
          description: 'Primary MongoDB database cluster'
        },
        {
          name: 'Authentication Service',
          status: 'healthy',
          responseTime: 156,
          uptime: '99.7%',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/auth',
          description: 'JWT authentication and user management service'
        },
        {
          name: 'Real-time Tracking',
          status: 'degraded',
          responseTime: 2340,
          uptime: '98.9%',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/tracking',
          description: 'GPS tracking and location services'
        },
        {
          name: 'Email Service',
          status: 'healthy',
          responseTime: 523,
          uptime: '99.5%',
          lastCheck: new Date().toISOString(),
          endpoint: 'smtp://mail.sriexpress.lk',
          description: 'Email notifications and communications'
        },
        {
          name: 'File Storage',
          status: 'down',
          responseTime: 0,
          uptime: '97.2%',
          lastCheck: new Date(Date.now() - 300000).toISOString(),
          endpoint: '/api/storage',
          description: 'File upload and storage service'
        }
      ];

      const mockMetrics: SystemMetrics = {
        cpu: {
          usage: 34.7,
          cores: 8,
          temperature: 67
        },
        memory: {
          used: 5.2,
          total: 16,
          percentage: 32.5
        },
        disk: {
          used: 127,
          total: 500,
          percentage: 25.4
        },
        network: {
          inbound: 2.3,
          outbound: 1.8,
          connections: 142
        }
      };

      setHealthOverview(mockOverview);
      setServices(mockServices);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadHealthData();
      setLoading(false);
    };

    initialLoad();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadHealthData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'down':
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon width={20} height={20} />;
      case 'degraded':
        return <ExclamationTriangleIcon width={20} height={20} />;
      case 'down':
      case 'critical':
        return <XCircleIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getOverallStatus = () => {
    const downServices = services.filter(s => s.status === 'down').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    
    if (downServices > 0) return 'critical';
    if (degradedServices > 0) return 'degraded';
    return 'healthy';
  };

  const formatUptime = (days: number) => {
    if (days < 1) return `${Math.floor(days * 24)} hours`;
    return `${Math.floor(days)} days`;
  };

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`;
  };

  const formatMbps = (mbps: number) => {
    return `${mbps.toFixed(1)} MB/s`;
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadHealthData();
    setLoading(false);
  };

  if (loading && !healthOverview) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div>Loading system health...</div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

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
              <HeartIcon width={24} height={24} color={getStatusColor(overallStatus)} />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                System Health Monitor
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Auto Refresh Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              Auto Refresh (30s)
            </label>

            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              <ArrowPathIcon width={16} height={16} />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Overall Health Status */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: `1px solid ${getStatusColor(overallStatus)}`,
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ color: getStatusColor(overallStatus) }}>
                {getStatusIcon(overallStatus)}
              </span>
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  System Status: {overallStatus}
                </h2>
                <p style={{
                  color: '#94a3b8',
                  margin: '0.25rem 0 0 0'
                }}>
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: getStatusColor('healthy'),
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {healthOverview?.uptime}%
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Uptime
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#f1f5f9',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {healthOverview?.avgResponseTime}ms
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Avg Response
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: healthOverview && healthOverview.errorRate < 1 ? '#10b981' : '#f59e0b',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {healthOverview?.errorRate}%
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Error Rate
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem'
          }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Requests</span>
              <div style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {healthOverview?.totalRequests.toLocaleString()}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Last Restart</span>
              <div style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {healthOverview ? formatUptime((Date.now() - new Date(healthOverview.lastRestart).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Services</span>
              <div style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {services.filter(s => s.status === 'healthy').length}/{services.length}
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ChartBarIcon width={20} height={20} />
            System Metrics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* CPU Usage */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CpuChipIcon width={20} height={20} color="#3b82f6" />
                <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  CPU Usage
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                  {metrics?.cpu.usage}%
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {metrics?.cpu.cores} cores • {metrics?.cpu.temperature}°C
                </span>
              </div>
              
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: metrics && metrics.cpu.usage > 80 ? '#ef4444' : 
                                   metrics && metrics.cpu.usage > 60 ? '#f59e0b' : '#10b981',
                  height: '100%',
                  width: `${metrics?.cpu.usage}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CircleStackIcon width={20} height={20} color="#10b981" />
                <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  Memory Usage
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                  {metrics?.memory.percentage}%
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {metrics ? formatBytes(metrics.memory.used) : '0'} / {metrics ? formatBytes(metrics.memory.total) : '0'}
                </span>
              </div>
              
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: metrics && metrics.memory.percentage > 80 ? '#ef4444' : 
                                   metrics && metrics.memory.percentage > 60 ? '#f59e0b' : '#10b981',
                  height: '100%',
                  width: `${metrics?.memory.percentage}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <ServerIcon width={20} height={20} color="#f59e0b" />
                <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  Disk Usage
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                  {metrics?.disk.percentage}%
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {metrics ? formatBytes(metrics.disk.used) : '0'} / {metrics ? formatBytes(metrics.disk.total) : '0'}
                </span>
              </div>
              
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: metrics && metrics.disk.percentage > 80 ? '#ef4444' : 
                                   metrics && metrics.disk.percentage > 60 ? '#f59e0b' : '#10b981',
                  height: '100%',
                  width: `${metrics?.disk.percentage}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Network Activity */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <WifiIcon width={20} height={20} color="#06b6d4" />
                <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  Network Activity
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Inbound</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    {metrics ? formatMbps(metrics.network.inbound) : '0'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Outbound</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                    {metrics ? formatMbps(metrics.network.outbound) : '0'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Connections</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                    {metrics?.network.connections}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheckIcon width={20} height={20} />
            Service Health
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {services.map((service) => (
              <div key={service.name} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: `1px solid ${getStatusColor(service.status)}`
              }}>
                {/* Service Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {service.name}
                    </h3>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {service.description}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}>
                    <span style={{ color: getStatusColor(service.status) }}>
                      {getStatusIcon(service.status)}
                    </span>
                    <span style={{
                      color: getStatusColor(service.status),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {service.status}
                    </span>
                  </div>
                </div>

                {/* Service Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                      Response Time
                    </span>
                    <span style={{
                      color: service.responseTime > 1000 ? '#ef4444' : service.responseTime > 500 ? '#f59e0b' : '#10b981',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                      {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                      Uptime
                    </span>
                    <span style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 'bold' }}>
                      {service.uptime}
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                      Last Check
                    </span>
                    <span style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 'bold' }}>
                      {((Date.now() - new Date(service.lastCheck).getTime()) / 1000 / 60).toFixed(0)}m
                    </span>
                  </div>
                </div>

                {/* Endpoint */}
                {service.endpoint && (
                  <div style={{
                    backgroundColor: '#1e293b',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Endpoint: </span>
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}>
                      {service.endpoint}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setSelectedService(service)}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <EyeIcon width={14} height={14} />
                    Details
                  </button>
                  
                  {service.status === 'down' && (
                    <button
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <ArrowPathIcon width={14} height={14} />
                      Restart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Notice */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <InformationCircleIcon width={20} height={20} color="#3b82f6" />
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0
            }}>
              Health Monitoring
            </h3>
          </div>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.5'
          }}>
            System health is monitored continuously. Services are checked every 30 seconds, and alerts are automatically 
            generated for any degraded or failed components. Historical data is retained for 30 days for trend analysis.
          </p>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
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
                {selectedService.name} Details
              </h3>
              <button
                onClick={() => setSelectedService(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Status</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ color: getStatusColor(selectedService.status) }}>
                    {getStatusIcon(selectedService.status)}
                  </span>
                  <span style={{
                    color: getStatusColor(selectedService.status),
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {selectedService.status}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Description</label>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {selectedService.description}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Response Time</label>
                  <p style={{
                    color: selectedService.responseTime > 1000 ? '#ef4444' : 
                           selectedService.responseTime > 500 ? '#f59e0b' : '#10b981',
                    margin: '0.25rem 0 0 0',
                    fontWeight: '600'
                  }}>
                    {selectedService.responseTime > 0 ? `${selectedService.responseTime}ms` : 'N/A'}
                  </p>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Uptime</label>
                  <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0', fontWeight: '600' }}>
                    {selectedService.uptime}
                  </p>
                </div>
              </div>

              {selectedService.endpoint && (
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Endpoint</label>
                  <p style={{
                    color: '#f1f5f9',
                    margin: '0.25rem 0 0 0',
                    fontFamily: 'monospace',
                    backgroundColor: '#334155',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {selectedService.endpoint}
                  </p>
                </div>
              )}

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Last Health Check</label>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {new Date(selectedService.lastCheck).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedService(null)}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
