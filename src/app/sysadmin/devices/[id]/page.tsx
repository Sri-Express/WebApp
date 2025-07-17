// src/app/sysadmin/devices/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  DevicePhoneMobileIcon,
  MapPinIcon,
  SignalIcon,
  BoltIcon, // Replaced BatteryIcon
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon, // Replaced RefreshCcwIcon
  CpuChipIcon,
  UserIcon,
  GlobeAltIcon
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
  firmwareVersion: string;
  installDate: string;
  lastMaintenance?: string;
  alerts: {
    count: number;
    messages: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DeviceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
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
  }, [router]);

  // Load device data
  useEffect(() => {
    const loadDevice = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await apiCall(`/admin/devices/${deviceId}`);
        if (response) {
          setDevice(response);
        } else {
          setError('Device not found');
        }
      } catch (err) {
        setError('Failed to load device details');
        console.error('Error loading device:', err);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      loadDevice();
    }
  }, [deviceId, apiCall]);

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
        return <CheckCircleIcon width={20} height={20} />;
      case 'offline':
        return <XCircleIcon width={20} height={20} />;
      case 'maintenance':
        return <ClockIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getSignalBars = (strength: number) => {
    const bars = [];
    for (let i = 1; i <= 5; i++) {
      bars.push(
        <div
          key={i}
          style={{
            width: '3px',
            height: `${6 + i * 3}px`,
            backgroundColor: i <= strength ? '#10b981' : '#374151',
            margin: '0 1px',
            borderRadius: '1px'
          }}
        />
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'end', height: '20px' }}>
        {bars}
      </div>
    );
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const handleDeleteDevice = async () => {
    setActionLoading('delete');
    try {
      await apiCall(`/admin/devices/${deviceId}`, {
        method: 'DELETE',
      });
      router.push('/sysadmin/devices');
    } catch (error) {
      console.error('Error deleting device:', error);
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  const handleClearAlerts = async () => {
    setActionLoading('clearAlerts');
    try {
      await apiCall(`/admin/devices/${deviceId}/alerts`, {
        method: 'DELETE',
      });
      // Reload device data
      const response = await apiCall(`/admin/devices/${deviceId}`);
      if (response) {
        setDevice(response);
      }
    } catch (error) {
      console.error('Error clearing alerts:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    setActionLoading('refresh');
    try {
      const response = await apiCall(`/admin/devices/${deviceId}`);
      if (response) {
        setDevice(response);
      }
    } catch (error) {
      console.error('Error refreshing device:', error);
    } finally {
      setActionLoading(null);
    }
  };

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
        <div>Loading device details...</div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
        <div>{error || 'Device not found'}</div>
        <Link
          href="/sysadmin/devices"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Back to Devices
        </Link>
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
              <DevicePhoneMobileIcon width={24} height={24} color="#10b981" />
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  margin: 0
                }}>
                  {device.deviceId}
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {device.vehicleNumber} • {device.vehicleType}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleRefresh}
              disabled={actionLoading === 'refresh'}
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
                opacity: actionLoading === 'refresh' ? 0.7 : 1
              }}
            >
              <ArrowPathIcon width={16} height={16} />
              Refresh
            </button>
            <Link
              href={`/sysadmin/devices/${deviceId}/edit`}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PencilIcon width={16} height={16} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <TrashIcon width={16} height={16} />
              Delete
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Status Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Status */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: getStatusColor(device.status) }}>
                {getStatusIcon(device.status)}
              </span>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Status
              </h3>
            </div>
            <p style={{
              color: getStatusColor(device.status),
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              margin: 0
            }}>
              {device.status}
            </p>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              margin: '0.25rem 0 0 0'
            }}>
              Last seen {getTimeSince(device.lastSeen)}
            </p>
          </div>

          {/* Battery */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <BoltIcon width={20} height={20} color={getBatteryColor(device.batteryLevel)} />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Battery
              </h3>
            </div>
            <p style={{
              color: getBatteryColor(device.batteryLevel),
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              {device.batteryLevel}%
            </p>
          </div>

          {/* Signal */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <SignalIcon width={20} height={20} color="#10b981" />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Signal
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {getSignalBars(device.signalStrength)}
              <span style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                {device.signalStrength}/5
              </span>
            </div>
          </div>

          {/* Alerts */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={20} height={20} color={device.alerts.count > 0 ? '#f59e0b' : '#6b7280'} />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Alerts
              </h3>
            </div>
            <p style={{
              color: device.alerts.count > 0 ? '#f59e0b' : '#10b981',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              {device.alerts.count}
            </p>
            {device.alerts.count > 0 && (
              <button
                onClick={handleClearAlerts}
                disabled={actionLoading === 'clearAlerts'}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  opacity: actionLoading === 'clearAlerts' ? 0.7 : 1
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Device Information */}
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
              <CpuChipIcon width={20} height={20} />
              Device Information
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Device ID
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {device.deviceId}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Vehicle Number
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {device.vehicleNumber}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Vehicle Type
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {device.vehicleType === 'bus' ? '🚌' : '🚊'} {device.vehicleType}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Firmware Version
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  v{device.firmwareVersion}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Install Date
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {formatDate(device.installDate)}
                </span>
              </div>

              {device.lastMaintenance && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Last Maintenance
                  </label>
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {formatDate(device.lastMaintenance)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
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
              <MapPinIcon width={20} height={20} />
              Current Location
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Address
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {device.location.address}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Latitude
                  </label>
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    {device.location.latitude.toFixed(6)}
                  </span>
                </div>

                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Longitude
                  </label>
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    {device.location.longitude.toFixed(6)}
                  </span>
                </div>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Last Updated
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {formatDateTime(device.location.lastUpdated)}
                </span>
              </div>

              <button
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
                onClick={() => window.open(`https://maps.google.com/?q=${device.location.latitude},${device.location.longitude}`, '_blank')}
              >
                <GlobeAltIcon width={16} height={16} />
                View on Map
              </button>
            </div>
          </div>

          {/* Assignment Information */}
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
              <UserIcon width={20} height={20} />
              Assignment
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Assigned To
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {device.assignedTo.name}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Assignment Type
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {device.assignedTo.type.replace('_', ' ')}
                </span>
              </div>

              {device.route && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Route
                  </label>
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {device.route.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Activity */}
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
              <ExclamationTriangleIcon width={20} height={20} />
              Alerts & Activity
            </h2>

            {device.alerts.count > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {device.alerts.messages.map((alert, index) => (
                  <div key={index} style={{
                    backgroundColor: '#334155',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <p style={{
                      color: '#f1f5f9',
                      margin: 0,
                      fontSize: '0.875rem'
                    }}>
                      {alert}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: '#334155',
                padding: '2rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <CheckCircleIcon width={32} height={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{
                  color: '#94a3b8',
                  margin: 0
                }}>
                  No active alerts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={24} height={24} color="#ef4444" />
              Confirm Delete
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem'
            }}>
              Are you sure you want to delete device <strong>{device.deviceId}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDevice}
                disabled={actionLoading === 'delete'}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: actionLoading === 'delete' ? 0.7 : 1
                }}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}