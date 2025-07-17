// src/app/sysadmin/devices/monitor/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  SignalIcon,
  BatteryIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  RefreshCcwIcon,
  ViewColumnsIcon,
  MapIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

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
  route?: {
    id: string;
    name: string;
  };
  alerts: {
    count: number;
    messages: string[];
  };
}

type ViewMode = 'map' | 'grid';

export default function DeviceMonitorPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Load devices data
  const loadDevices = async () => {
    try {
      const response = await apiCall('/admin/devices?limit=1000');
      if (response?.devices) {
        setDevices(response.devices);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadDevices();
      setLoading(false);
    };

    initialLoad();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDevices();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter devices
  useEffect(() => {
    let filtered = devices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => device.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(device => device.vehicleType === typeFilter);
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon width={16} height={16} />;
      case 'offline':
        return <XCircleIcon width={16} height={16} />;
      case 'maintenance':
        return <ClockIcon width={16} height={16} />;
      default:
        return <ExclamationTriangleIcon width={16} height={16} />;
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
    await loadDevices();
    setLoading(false);
  };

  const deviceCounts = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
    alerts: devices.reduce((sum, d) => sum + d.alerts.count, 0)
  };

  if (loading && devices.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div>Loading device monitor...</div>
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
            <Link href="/sysadmin/devices" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Back to Devices
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <GlobeAltIcon width={24} height={24} color="#06b6d4" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Global Device Monitor
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

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              backgroundColor: '#334155',
              borderRadius: '0.5rem',
              padding: '0.25rem'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : '#94a3b8',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <ViewColumnsIcon width={16} height={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  backgroundColor: viewMode === 'map' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'map' ? 'white' : '#94a3b8',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <MapIcon width={16} height={16} />
                Map
              </button>
            </div>

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
              <RefreshCcwIcon width={16} height={16} />
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
        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <DevicePhoneMobileIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {deviceCounts.total}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Devices</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {deviceCounts.online}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Online</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <XCircleIcon width={32} height={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {deviceCounts.offline}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Offline</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ExclamationTriangleIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {deviceCounts.alerts}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FunnelIcon width={20} height={20} color="#94a3b8" />
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Filters:</span>
            </div>

            {/* Search */}
            <div style={{
              position: 'relative',
              flex: '1 1 300px'
            }}>
              <MagnifyingGlassIcon 
                width={20} 
                height={20} 
                color="#94a3b8" 
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">All Types</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{
            marginTop: '1rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            Showing {filteredDevices.length} of {devices.length} devices
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'map' ? (
          /* Map View */
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <MapIcon width={64} height={64} color="#94a3b8" />
            <div style={{
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem 0' }}>
                Interactive Map View
              </h3>
              <p style={{ margin: 0 }}>
                Map integration with Google Maps/Mapbox coming soon
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                Will show all {filteredDevices.length} devices with real-time positions
              </p>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredDevices.map((device) => (
              <div key={device._id} style={{
                backgroundColor: '#1e293b',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #334155',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                {/* Device Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {device.deviceId}
                    </h3>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <TruckIcon width={14} height={14} />
                      {device.vehicleNumber} • {device.vehicleType}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: getStatusColor(device.status) }}>
                      {getStatusIcon(device.status)}
                    </span>
                    <span style={{
                      color: getStatusColor(device.status),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {device.status}
                    </span>
                  </div>
                </div>

                {/* Device Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <BatteryIcon width={20} height={20} color={getBatteryColor(device.batteryLevel)} style={{ margin: '0 auto 0.25rem' }} />
                    <div style={{ color: getBatteryColor(device.batteryLevel), fontSize: '0.875rem', fontWeight: '600' }}>
                      {device.batteryLevel}%
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <SignalIcon width={20} height={20} color="#10b981" style={{ margin: '0 auto 0.25rem' }} />
                    <div style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      {device.signalStrength}/5
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <ExclamationTriangleIcon width={20} height={20} color={device.alerts.count > 0 ? '#f59e0b' : '#6b7280'} style={{ margin: '0 auto 0.25rem' }} />
                    <div style={{ 
                      color: device.alerts.count > 0 ? '#f59e0b' : '#6b7280', 
                      fontSize: '0.875rem', 
                      fontWeight: '600' 
                    }}>
                      {device.alerts.count}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div style={{
                  backgroundColor: '#334155',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <MapPinIcon width={14} height={14} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Location</span>
                  </div>
                  <p style={{
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {device.location.address}
                  </p>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Updated {getTimeSince(device.location.lastUpdated)}
                  </p>
                </div>

                {/* Assignment */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Assigned to</span>
                    <p style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {device.assignedTo.name}
                    </p>
                  </div>
                  <span style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    {device.assignedTo.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <Link
                    href={`/sysadmin/devices/${device._id}`}
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
                    <EyeIcon width={14} height={14} />
                    View Details
                  </Link>
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${device.location.latitude},${device.location.longitude}`, '_blank')}
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
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredDevices.length === 0 && !loading && (
          <div style={{
            backgroundColor: '#1e293b',
            padding: '3rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            textAlign: 'center'
          }}>
            <DevicePhoneMobileIcon width={48} height={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              No devices found
            </h3>
            <p style={{
              color: '#94a3b8',
              margin: 0
            }}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}