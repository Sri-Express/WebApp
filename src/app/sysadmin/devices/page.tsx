// src/app/sysadmin/devices/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DevicePhoneMobileIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  SignalIcon,
  MapPinIcon,
  BatteryIcon,
  TruckIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
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
  alerts: number;
}

interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  alertsCount: number;
}

export default function SystemAdminDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

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
  useEffect(() => {
    const loadDevices = async () => {
      setLoading(true);
      
      try {
        // Mock data for now
        const mockDevices: Device[] = [
          {
            _id: '1',
            deviceId: 'DEV001',
            vehicleNumber: 'LK-1234',
            vehicleType: 'bus',
            status: 'online',
            lastSeen: new Date(Date.now() - 300000).toISOString(),
            location: {
              latitude: 6.9271,
              longitude: 79.8612,
              address: 'Galle Road, Colombo 03'
            },
            batteryLevel: 85,
            signalStrength: 4,
            assignedTo: {
              type: 'route_admin',
              name: 'Kasun Fernando',
              id: '3'
            },
            route: {
              id: 'R001',
              name: 'Colombo - Kandy'
            },
            firmwareVersion: '2.1.4',
            installDate: '2024-12-01T10:00:00Z',
            lastMaintenance: '2025-01-01T14:30:00Z',
            alerts: 0
          },
          {
            _id: '2',
            deviceId: 'DEV002',
            vehicleNumber: 'LK-5678',
            vehicleType: 'bus',
            status: 'offline',
            lastSeen: new Date(Date.now() - 3600000).toISOString(),
            location: {
              latitude: 6.0535,
              longitude: 80.2210,
              address: 'Galle Fort Area'
            },
            batteryLevel: 15,
            signalStrength: 0,
            assignedTo: {
              type: 'company_admin',
              name: 'Priyantha Transport',
              id: '4'
            },
            firmwareVersion: '2.0.8',
            installDate: '2024-11-15T09:00:00Z',
            alerts: 2
          },
          {
            _id: '3',
            deviceId: 'DEV003',
            vehicleNumber: 'LK-9012',
            vehicleType: 'train',
            status: 'maintenance',
            lastSeen: new Date(Date.now() - 7200000).toISOString(),
            location: {
              latitude: 7.2906,
              longitude: 80.6337,
              address: 'Kandy Railway Station'
            },
            batteryLevel: 92,
            signalStrength: 5,
            assignedTo: {
              type: 'system',
              name: 'System Control',
              id: 'system'
            },
            route: {
              id: 'R002',
              name: 'Colombo - Kandy Railway'
            },
            firmwareVersion: '2.1.4',
            installDate: '2024-10-20T11:00:00Z',
            lastMaintenance: '2025-01-10T16:00:00Z',
            alerts: 1
          }
        ];

        const mockStats: DeviceStats = {
          totalDevices: 89,
          onlineDevices: 67,
          offlineDevices: 15,
          maintenanceDevices: 7,
          alertsCount: 12
        };

        setDevices(mockDevices);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

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
            width: '2px',
            height: `${4 + i * 2}px`,
            backgroundColor: i <= strength ? '#10b981' : '#374151',
            margin: '0 1px'
          }}
        />
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'end' }}>
        {bars}
      </div>
    );
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesType = filterType === 'all' || device.vehicleType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteDevice = async (deviceId: string) => {
    // Implementation for device deletion
    console.log('Deleting device:', deviceId);
    setShowDeleteModal(false);
    setDeviceToDelete(null);
  };

  const handleBulkAction = async (action: string) => {
    // Implementation for bulk actions
    console.log('Bulk action:', action, 'for devices:', selectedDevices);
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
        <div>Loading devices...</div>
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
              <DevicePhoneMobileIcon width={24} height={24} color="#10b981" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Device Management
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/sysadmin/devices/monitor"
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <MapPinIcon width={20} height={20} />
              Global Map
            </Link>
            <Link
              href="/sysadmin/devices/add"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <PlusIcon width={20} height={20} />
              Add Device
            </Link>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  {stats?.totalDevices}
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
                  {stats?.onlineDevices}
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
                  {stats?.offlineDevices}
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
                  {stats?.alertsCount}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{
              position: 'relative' as const,
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
                  boxSizing: 'border-box' as const,
                  outline: 'none'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
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
              <ArrowPathIcon width={20} height={20} />
              Refresh
            </button>
          </div>
        </div>

        {/* Devices Table */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto' as const
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
              minWidth: '1200px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#334155',
                  borderBottom: '1px solid #475569'
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Device</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Vehicle</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Status</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Location</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Signal</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Battery</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Assigned To</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Last Seen</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device, index) => (
                  <tr key={device._id} style={{
                    borderBottom: index < filteredDevices.length - 1 ? '1px solid #334155' : 'none',
                    backgroundColor: index % 2 === 0 ? '#1e293b' : '#1a2332'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          color: '#f1f5f9',
                          fontWeight: '500'
                        }}>
                          {device.deviceId}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          v{device.firmwareVersion}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <TruckIcon width={16} height={16} color="#94a3b8" />
                        <div>
                          <div style={{
                            color: '#f1f5f9',
                            fontWeight: '500'
                          }}>
                            {device.vehicleNumber}
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            textTransform: 'capitalize'
                          }}>
                            {device.vehicleType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: getStatusColor(device.status) }}>
                          {getStatusIcon(device.status)}
                        </span>
                        <div>
                          <span style={{
                            color: getStatusColor(device.status),
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {device.status}
                          </span>
                          {device.alerts > 0 && (
                            <div style={{
                              color: '#ef4444',
                              fontSize: '0.75rem'
                            }}>
                              {device.alerts} alerts
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <MapPinIcon width={16} height={16} color="#94a3b8" />
                        <div>
                          <div style={{
                            color: '#f1f5f9',
                            fontSize: '0.875rem'
                          }}>
                            {device.location.address}
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem'
                          }}>
                            {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {getSignalBars(device.signalStrength)}
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          {device.signalStrength}/5
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <BatteryIcon width={16} height={16} color={getBatteryColor(device.batteryLevel)} />
                        <span style={{
                          color: getBatteryColor(device.batteryLevel),
                          fontWeight: '500'
                        }}>
                          {device.batteryLevel}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          color: '#f1f5f9',
                          fontSize: '0.875rem'
                        }}>
                          {device.assignedTo.name}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {device.assignedTo.type.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        color: device.status === 'online' ? '#10b981' : '#94a3b8',
                        fontSize: '0.875rem'
                      }}>
                        {getTimeSince(device.lastSeen)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <Link
                          href={`/sysadmin/devices/${device._id}`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            padding: '0.25rem'
                          }}
                        >
                          <EyeIcon width={16} height={16} />
                        </Link>
                        <Link
                          href={`/sysadmin/devices/${device._id}/edit`}
                          style={{
                            color: '#f59e0b',
                            textDecoration: 'none',
                            padding: '0.25rem'
                          }}
                        >
                          <PencilIcon width={16} height={16} />
                        </Link>
                        <button
                          onClick={() => {
                            setDeviceToDelete(device._id);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          marginTop: '2rem',
          color: '#94a3b8'
        }}>
          <div>
            Showing {filteredDevices.length} of {devices.length} devices
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed' as const,
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
              marginBottom: '1rem'
            }}>
              Confirm Delete
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem'
            }}>
              Are you sure you want to delete this device? This action cannot be undone.
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
                onClick={() => deviceToDelete && handleDeleteDevice(deviceToDelete)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}